import type { GeoJSONSource, Map as MapLibreMap } from "maplibre-gl";
import {
  ATLAS_MAP_LAYERS,
  ATLAS_MAP_SOURCE_ID,
  OSM_BOUNDARY_ATTRIBUTION,
  sourceSpecFromCollection,
  thematicFillExpression,
  type AtlasMapSourceSpec,
} from "@/lib/atlas-map-style";
import type { AtlasMapCollection, AtlasThematicMode } from "@/lib/atlas-map-types";

export function addOrReplaceAtlasSource(map: MapLibreMap, spec: AtlasMapSourceSpec): void {
  if (map.getSource(ATLAS_MAP_SOURCE_ID)) {
    if (spec.kind === "geojson") {
      const source = map.getSource(ATLAS_MAP_SOURCE_ID) as GeoJSONSource;
      source.setData(spec.data as GeoJSON.FeatureCollection);
    }
    return;
  }

  if (spec.kind === "geojson") {
    map.addSource(ATLAS_MAP_SOURCE_ID, {
      type: "geojson",
      data: spec.data as GeoJSON.FeatureCollection,
      promoteId: "settlement_id",
      attribution: OSM_BOUNDARY_ATTRIBUTION,
    });
    return;
  }

  map.addSource(ATLAS_MAP_SOURCE_ID, {
    type: "vector",
    tiles: spec.tiles,
    promoteId: "settlement_id",
    attribution: OSM_BOUNDARY_ATTRIBUTION,
  });
}

export function ensureAtlasLayers(map: MapLibreMap, collection: AtlasMapCollection, mode: AtlasThematicMode, sourceLayer?: string): void {
  const sourceLayerProps = sourceLayer ? { "source-layer": sourceLayer } : {};

  if (!map.getLayer(ATLAS_MAP_LAYERS.fill)) {
    map.addLayer({
      id: ATLAS_MAP_LAYERS.fill,
      type: "fill",
      source: ATLAS_MAP_SOURCE_ID,
      ...sourceLayerProps,
      paint: {
        "fill-color": thematicFillExpression(mode, collection.features),
        "fill-opacity": 0.62,
      },
    });
    map.addLayer({
      id: ATLAS_MAP_LAYERS.outline,
      type: "line",
      source: ATLAS_MAP_SOURCE_ID,
      ...sourceLayerProps,
      paint: {
        "line-color": "#3f2a2c",
        "line-width": 1,
        "line-opacity": 0.85,
      },
    });
    map.addLayer({
      id: ATLAS_MAP_LAYERS.hover,
      type: "line",
      source: ATLAS_MAP_SOURCE_ID,
      ...sourceLayerProps,
      paint: {
        "line-color": "#111827",
        "line-width": ["case", ["boolean", ["feature-state", "hover"], false], 2.75, 0],
      },
    });
    map.addLayer({
      id: ATLAS_MAP_LAYERS.selected,
      type: "line",
      source: ATLAS_MAP_SOURCE_ID,
      ...sourceLayerProps,
      paint: {
        "line-color": "#7f1d1d",
        "line-width": ["case", ["boolean", ["feature-state", "selected"], false], 3.6, 0],
      },
    });
    return;
  }

  map.setPaintProperty(ATLAS_MAP_LAYERS.fill, "fill-color", thematicFillExpression(mode, collection.features));
}

export function syncAtlasGeoJson(map: MapLibreMap, collection: AtlasMapCollection, mode: AtlasThematicMode): void {
  addOrReplaceAtlasSource(map, sourceSpecFromCollection(collection));
  ensureAtlasLayers(map, collection, mode);
}

export function fitAtlasCollection(
  map: MapLibreMap,
  collection: AtlasMapCollection,
  options?: { maxZoom?: number; padding?: number; duration?: number },
): void {
  const bbox = collection.bbox;
  if (!bbox || bbox.length !== 4) return;
  map.fitBounds(
    [
      [bbox[0], bbox[1]],
      [bbox[2], bbox[3]],
    ],
    {
      padding: options?.padding ?? 48,
      maxZoom: options?.maxZoom ?? 11,
      duration: options?.duration ?? 0,
    },
  );
}

export function setAtlasFeatureStates(
  map: MapLibreMap,
  hoveredId: number | null,
  selectedId: number | null,
  previousHoveredId: number | null,
  previousSelectedId: number | null,
): void {
  const clear = (id: number | null, key: "hover" | "selected") => {
    if (id == null) return;
    map.setFeatureState({ source: ATLAS_MAP_SOURCE_ID, id }, { [key]: false });
  };
  const set = (id: number | null, key: "hover" | "selected") => {
    if (id == null) return;
    map.setFeatureState({ source: ATLAS_MAP_SOURCE_ID, id }, { [key]: true });
  };

  if (previousHoveredId !== hoveredId) {
    clear(previousHoveredId, "hover");
    set(hoveredId, "hover");
  }
  if (previousSelectedId !== selectedId) {
    clear(previousSelectedId, "selected");
    set(selectedId, "selected");
  }
}
