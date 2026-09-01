import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { MapLayerMouseEvent } from "maplibre-gl";
import { useAtlasMapData } from "@/hooks/useAtlasMapData";
import { useMapLibre } from "@/hooks/useMapLibre";
import { AtlasMapControls } from "@/components/atlas/map/AtlasMapControls";
import { AtlasMapEmptyState } from "@/components/atlas/map/AtlasMapEmptyState";
import { AtlasMapLegend } from "@/components/atlas/map/AtlasMapLegend";
import { AtlasMapPopup } from "@/components/atlas/map/AtlasMapPopup";
import { ATLAS_MAP_LAYERS, findMapFeature } from "@/lib/atlas-map-style";
import { fitAtlasCollection, setAtlasFeatureStates, syncAtlasGeoJson } from "@/lib/atlas-map-engine";
import type { AtlasMapFeatureProperties, AtlasThematicMode } from "@/lib/atlas-map-types";
import "./atlas-map.css";

type AtlasMapProps = {
  municipalitySlug?: string;
  selectedSettlementId?: number | null;
  onSelectedSettlementIdChange?: (id: number | null) => void;
  missingBoundaryName?: string | null;
  fitSelected?: boolean;
};

export function AtlasMap({
  municipalitySlug,
  selectedSettlementId = null,
  onSelectedSettlementIdChange,
  missingBoundaryName,
  fitSelected = false,
}: AtlasMapProps) {
  const { collection, loading, error } = useAtlasMapData(municipalitySlug);
  const mapEnabled = true;
  const { containerRef, mapRef, ready, webglFailed, basemapFailed } = useMapLibre(mapEnabled);
  const [mode, setMode] = useState<AtlasThematicMode>("boundaries");
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const previousHoverRef = useRef<number | null>(null);
  const previousSelectedRef = useRef<number | null>(null);
  const fittedKey = useRef("");

  const selectedFeature = findMapFeature(collection, selectedSettlementId);
  const selectedProperties = selectedFeature?.properties;

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !collection) return;
    syncAtlasGeoJson(map, collection, mode);
    try {
      setAtlasFeatureStates(map, hoveredId, selectedSettlementId, previousHoverRef.current, previousSelectedRef.current);
      previousHoverRef.current = hoveredId;
      previousSelectedRef.current = selectedSettlementId;
    } catch {
      // Source may not accept feature-state until the first GeoJSON load completes.
    }
  }, [collection, hoveredId, mapRef, mode, ready, selectedSettlementId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !collection) return;
    const key = `${municipalitySlug ?? "all"}:${collection.features.length}:${fitSelected ? selectedSettlementId ?? "" : ""}`;
    if (fittedKey.current === key) return;
    fitAtlasCollection(map, collection, {
      maxZoom: fitSelected ? 12.5 : municipalitySlug ? 11.5 : 10.5,
      padding: fitSelected ? 56 : 40,
    });
    fittedKey.current = key;
  }, [collection, fitSelected, mapRef, municipalitySlug, ready, selectedSettlementId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    const onMove = (event: MapLayerMouseEvent) => {
      const id = featureIdFromEvent(event);
      map.getCanvas().style.cursor = id == null ? "" : "pointer";
      setHoveredId(id);
    };
    const onLeave = () => {
      map.getCanvas().style.cursor = "";
      setHoveredId(null);
    };
    const onClick = (event: MapLayerMouseEvent) => {
      const id = featureIdFromEvent(event);
      if (id == null) return;
      onSelectedSettlementIdChange?.(id);
    };

    map.on("mousemove", ATLAS_MAP_LAYERS.fill, onMove);
    map.on("mouseleave", ATLAS_MAP_LAYERS.fill, onLeave);
    map.on("click", ATLAS_MAP_LAYERS.fill, onClick);

    return () => {
      map.off("mousemove", ATLAS_MAP_LAYERS.fill, onMove);
      map.off("mouseleave", ATLAS_MAP_LAYERS.fill, onLeave);
      map.off("click", ATLAS_MAP_LAYERS.fill, onClick);
    };
  }, [mapRef, onSelectedSettlementIdChange, ready]);

  if (webglFailed) {
    return (
      <AtlasMapEmptyState title="Karta trenutno nije dostupna">
        <p>Preglednik ne može pokrenuti MapLibre/WebGL. Atlas naselja i dalje možete koristiti preko liste i pretrage.</p>
      </AtlasMapEmptyState>
    );
  }

  return (
    <section className="atlas-map-shell" aria-labelledby="atlas-karta-naslov">
      <div className="mb-3">
        <h2 id="atlas-karta-naslov" className="text-lg font-extrabold">
          Interaktivna karta naselja
        </h2>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Granice prikazane na karti zasnovane su na dostupnim OpenStreetMap administrativnim poligonima i ne predstavljaju nužno
          službene katastarske ili statističke granice naseljenih mjesta. Visinski podaci izvedeni su iz Copernicus DEM GLO-30
          modela terena.
        </p>
      </div>

      {missingBoundaryName ? (
        <p className="mb-3 rounded-md border border-border/70 bg-muted/60 px-3 py-2 text-sm" role="status">
          Granica trenutno nije dostupna na karti za {missingBoundaryName}. Naselje ostaje u atlasu preko liste i stranice naselja.
        </p>
      ) : null}

      {error ? (
        <p className="mb-3 rounded-md border border-border/70 bg-muted/60 px-3 py-2 text-sm" role="status">
          Granice naselja trenutno nisu učitane. Lista naselja ispod i dalje radi.
        </p>
      ) : null}

      {basemapFailed ? (
        <p className="mb-3 text-sm text-muted-foreground" role="status">
          Podloga karte nije učitana. Poligoni naselja i dalje mogu biti dostupni na praznoj podlozi.
        </p>
      ) : null}

      <div className="relative">
        <div
          ref={containerRef}
          className="atlas-map-canvas"
          role="region"
          aria-label="Karta naseljenih mjesta"
        />
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/55 text-sm font-bold text-muted-foreground">
            Učitavam kartu...
          </div>
        ) : null}
        <div className="atlas-map-overlay left-2 top-2 sm:left-3 sm:top-3">
          <AtlasMapControls mode={mode} onModeChange={setMode} />
        </div>
        <div className={`atlas-map-overlay bottom-10 left-2 sm:bottom-auto sm:left-auto sm:right-3 sm:top-3 ${selectedProperties ? "hidden sm:block" : ""}`}>
          <AtlasMapLegend mode={mode} features={collection?.features ?? []} />
        </div>
        {selectedProperties ? (
          <div className="atlas-map-overlay bottom-2 left-2 right-2 sm:left-3 sm:right-auto">
            <AtlasMapPopup properties={selectedProperties} onClose={() => onSelectedSettlementIdChange?.(null)} />
          </div>
        ) : null}
      </div>

      <SelectedSettlementText properties={selectedProperties} />

      {collection?.meta?.coverage_note ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{collection.meta.coverage_note}</p>
      ) : null}
    </section>
  );
}

function SelectedSettlementText({ properties }: { properties?: AtlasMapFeatureProperties }) {
  if (!properties) {
    return (
      <p className="sr-only" aria-live="polite">
        Nijedno naselje nije izabrano na karti.
      </p>
    );
  }

  return (
    <p className="mt-3 text-sm" aria-live="polite">
      Izabrano naselje:{" "}
      <Link className="font-bold text-primary hover:underline" to={properties.path}>
        {properties.settlement_name}
      </Link>
      {", "}
      opština {properties.municipality_name}.
    </p>
  );
}

function featureIdFromEvent(event: MapLayerMouseEvent): number | null {
  const raw = event.features?.[0]?.id ?? event.features?.[0]?.properties?.settlement_id;
  const id = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(id) ? id : null;
}
