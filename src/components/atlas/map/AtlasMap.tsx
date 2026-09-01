import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { MapLayerMouseEvent } from "maplibre-gl";
import { useAtlasMapData } from "@/hooks/useAtlasMapData";
import { useAtlasPoiData } from "@/hooks/useAtlasPoiData";
import { useMapLibre } from "@/hooks/useMapLibre";
import { AtlasMapControls } from "@/components/atlas/map/AtlasMapControls";
import { AtlasMapEmptyState } from "@/components/atlas/map/AtlasMapEmptyState";
import { AtlasMapLegend } from "@/components/atlas/map/AtlasMapLegend";
import { AtlasMapPopup } from "@/components/atlas/map/AtlasMapPopup";
import { AtlasPoiFilters } from "@/components/atlas/map/AtlasPoiFilters";
import { AtlasPoiPopup } from "@/components/atlas/map/AtlasPoiPopup";
import { ATLAS_MAP_LAYERS, ATLAS_POI_LAYERS, findMapFeature } from "@/lib/atlas-map-style";
import {
  filterAtlasPoiLayer,
  findPoiFeature,
  fitAtlasCollection,
  setAtlasFeatureStates,
  setAtlasPoiSelectedState,
  syncAtlasGeoJson,
  syncAtlasPoiGeoJson,
} from "@/lib/atlas-map-engine";
import type { AtlasMapFeatureProperties, AtlasThematicMode } from "@/lib/atlas-map-types";
import { POI_FILTER_GROUPS, poiDisplayLabel, type AtlasPoiProperties } from "@/lib/atlas-poi-types";
import "./atlas-map.css";

type AtlasMapProps = {
  municipalitySlug?: string;
  selectedSettlementId?: number | null;
  onSelectedSettlementIdChange?: (id: number | null) => void;
  selectedPoiId?: number | null;
  onSelectedPoiIdChange?: (id: number | null) => void;
  missingBoundaryName?: string | null;
  fitSelected?: boolean;
};

export function AtlasMap({
  municipalitySlug,
  selectedSettlementId = null,
  onSelectedSettlementIdChange,
  selectedPoiId = null,
  onSelectedPoiIdChange,
  missingBoundaryName,
  fitSelected = false,
}: AtlasMapProps) {
  const { collection, loading, error } = useAtlasMapData(municipalitySlug);
  const { collection: poiCollection, error: poiError } = useAtlasPoiData(municipalitySlug);
  const { containerRef, mapRef, ready, webglFailed, basemapFailed } = useMapLibre(true);
  const [mode, setMode] = useState<AtlasThematicMode>("boundaries");
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [poiGroupId, setPoiGroupId] = useState("all");
  const [internalPoiId, setInternalPoiId] = useState<number | null>(null);
  const previousHoverRef = useRef<number | null>(null);
  const previousSelectedRef = useRef<number | null>(null);
  const previousPoiRef = useRef<number | null>(null);
  const fittedKey = useRef("");

  const activePoiId = selectedPoiId ?? internalPoiId;
  const setActivePoiId = useCallback((id: number | null) => {
    setInternalPoiId(id);
    onSelectedPoiIdChange?.(id);
  }, [onSelectedPoiIdChange]);

  const selectedFeature = findMapFeature(collection, selectedSettlementId);
  const selectedProperties = selectedFeature?.properties;
  const selectedPoi = findPoiFeature(poiCollection, activePoiId)?.properties;
  const poiFamilies = useMemo(
    () => POI_FILTER_GROUPS.find((group) => group.id === poiGroupId)?.families ?? [],
    [poiGroupId],
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    if (collection) {
      syncAtlasGeoJson(map, collection, mode);
      try {
        setAtlasFeatureStates(map, hoveredId, selectedSettlementId, previousHoverRef.current, previousSelectedRef.current);
        previousHoverRef.current = hoveredId;
        previousSelectedRef.current = selectedSettlementId;
      } catch {
        // Source may not accept feature-state until the first GeoJSON load completes.
      }
    }
    try {
      syncAtlasPoiGeoJson(map, poiCollection);
      filterAtlasPoiLayer(map, poiFamilies);
      setAtlasPoiSelectedState(map, activePoiId, previousPoiRef.current);
      previousPoiRef.current = activePoiId;
    } catch {
      // POI source is optional; boundary map must keep working.
    }
  }, [activePoiId, collection, hoveredId, mapRef, mode, poiCollection, poiFamilies, ready, selectedSettlementId]);

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
      const id = featureIdFromEvent(event, "settlement_id");
      map.getCanvas().style.cursor = id == null ? "" : "pointer";
      setHoveredId(id);
    };
    const onLeave = () => {
      map.getCanvas().style.cursor = "";
      setHoveredId(null);
    };
    const onSettlementClick = (event: MapLayerMouseEvent) => {
      const id = featureIdFromEvent(event, "settlement_id");
      if (id == null) return;
      setActivePoiId(null);
      onSelectedSettlementIdChange?.(id);
    };
    const onPoiClick = (event: MapLayerMouseEvent) => {
      event.originalEvent.stopPropagation();
      const id = featureIdFromEvent(event, "id");
      if (id == null) return;
      setActivePoiId(id);
    };

    map.on("mousemove", ATLAS_MAP_LAYERS.fill, onMove);
    map.on("mouseleave", ATLAS_MAP_LAYERS.fill, onLeave);
    map.on("click", ATLAS_MAP_LAYERS.fill, onSettlementClick);
    map.on("click", ATLAS_POI_LAYERS.circles, onPoiClick);

    return () => {
      map.off("mousemove", ATLAS_MAP_LAYERS.fill, onMove);
      map.off("mouseleave", ATLAS_MAP_LAYERS.fill, onLeave);
      map.off("click", ATLAS_MAP_LAYERS.fill, onSettlementClick);
      map.off("click", ATLAS_POI_LAYERS.circles, onPoiClick);
    };
  }, [mapRef, onSelectedSettlementIdChange, ready, setActivePoiId]);

  const visiblePoiNote = poiError ? null : poiCollection?.meta?.coverage_note;

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
          modela terena. Objekti su uvezeni OSM zapisi (ODbL), nisu službeni inventar.
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

      {poiError ? (
        <p className="mb-3 rounded-md border border-border/70 bg-muted/60 px-3 py-2 text-sm" role="status">
          Sloj objekata trenutno nije učitan. Granice naselja ostaju dostupne.
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
        <div className="atlas-map-overlay left-2 top-2 flex max-w-[calc(100%-5rem)] flex-col gap-2 sm:left-3 sm:top-3">
          <AtlasMapControls mode={mode} onModeChange={setMode} />
          <AtlasPoiFilters groupId={poiGroupId} onGroupChange={setPoiGroupId} />
        </div>
        <div className={`atlas-map-overlay bottom-10 left-2 sm:bottom-auto sm:left-auto sm:right-3 sm:top-3 ${selectedProperties || selectedPoi ? "hidden sm:block" : ""}`}>
          <AtlasMapLegend mode={mode} features={collection?.features ?? []} />
        </div>
        {selectedPoi ? (
          <div className="atlas-map-overlay bottom-2 left-2 right-2 sm:left-3 sm:right-auto">
            <AtlasPoiPopup properties={selectedPoi} onClose={() => setActivePoiId(null)} />
          </div>
        ) : selectedProperties ? (
          <div className="atlas-map-overlay bottom-2 left-2 right-2 sm:left-3 sm:right-auto">
            <AtlasMapPopup properties={selectedProperties} onClose={() => onSelectedSettlementIdChange?.(null)} />
          </div>
        ) : null}
      </div>

      <SelectedStatus settlement={selectedProperties} poi={selectedPoi} />

      {collection?.meta?.coverage_note ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{collection.meta.coverage_note}</p>
      ) : null}
      {visiblePoiNote ? (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{visiblePoiNote}</p>
      ) : null}
    </section>
  );
}

function SelectedStatus({
  settlement,
  poi,
}: {
  settlement?: AtlasMapFeatureProperties;
  poi?: AtlasPoiProperties;
}) {
  if (poi) {
    return (
      <p className="mt-3 text-sm" aria-live="polite">
        Izabran objekat: <span className="font-bold">{poiDisplayLabel(poi)}</span>
        {poi.settlement_name ? `, ${poi.settlement_name}` : ""}
        {poi.municipality_name ? `, opština ${poi.municipality_name}` : ""}.
      </p>
    );
  }

  if (!settlement) {
    return (
      <p className="sr-only" aria-live="polite">
        Nijedno naselje nije izabrano na karti.
      </p>
    );
  }

  return (
    <p className="mt-3 text-sm" aria-live="polite">
      Izabrano naselje:{" "}
      <Link className="font-bold text-primary hover:underline" to={settlement.path}>
        {settlement.settlement_name}
      </Link>
      {", "}
      opština {settlement.municipality_name}.
    </p>
  );
}

function featureIdFromEvent(event: MapLayerMouseEvent, property: string): number | null {
  const raw = event.features?.[0]?.id ?? event.features?.[0]?.properties?.[property];
  const id = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(id) ? id : null;
}
