import type { ExpressionSpecification, StyleSpecification } from "maplibre-gl";
import type { AtlasMapCollection, AtlasMapFeature, AtlasMapFeatureProperties, AtlasThematicMode } from "@/lib/atlas-map-types";
import { THEMATIC_MODES } from "@/lib/atlas-map-types";

export const ATLAS_MAP_SOURCE_ID = "atlas-settlements";

export const ATLAS_MAP_LAYERS = {
  fill: "atlas-settlements-fill",
  outline: "atlas-settlements-outline",
  hover: "atlas-settlements-hover",
  selected: "atlas-settlements-selected",
} as const;

export const ATLAS_POI_SOURCE_ID = "atlas-places";

export const ATLAS_POI_LAYERS = {
  circles: "atlas-places-circles",
  selected: "atlas-places-selected",
} as const;

export const DEFAULT_MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

export const OSM_BOUNDARY_ATTRIBUTION =
  'Granice naselja © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors (ODbL)';

export const OSM_POI_ATTRIBUTION =
  'Objekti © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors (ODbL)';

export const COPERNICUS_ATTRIBUTION = "Visine: Copernicus DEM GLO-30";

export const ERA5_ATTRIBUTION = "Klima: ERA5-Land / ERA5, Copernicus C3S / ECMWF";

export const BASEMAP_ATTRIBUTION_NOTE =
  "Podloga karte: OpenFreeMap (podaci OpenStreetMap / OpenMapTiles). Javna instanca, bez API ključa; atribucija je obavezna.";

export const BLANK_MAP_STYLE: StyleSpecification = {
  version: 8,
  name: "atlas-fallback",
  sources: {},
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": "#e7eef4" },
    },
  ],
};

const BOUNDARY_FILL = "#9a3b45";
const MISSING_VALUE_FILL = "#d7dde3";

const SCALES: Record<Exclude<AtlasThematicMode, "boundaries">, string[]> = {
  elevation_mean: ["#ffffd4", "#fed98e", "#fe9929", "#d95f0e", "#993404"],
  elevation_range: ["#f1eef6", "#bdc9e1", "#74a9cf", "#2b8cbe", "#045a8d"],
  slope_mean: ["#f7f4f9", "#d4b9da", "#c994c7", "#df65b0", "#980043"],
  population_2013: ["#fff7ec", "#fee8c8", "#fdbb84", "#e34a33", "#b30000"],
  temperature_mean_annual: ["#ffffcc", "#ffeda0", "#feb24c", "#f03b20", "#bd0026"],
  precipitation_annual: ["#f7fbff", "#c6dbef", "#6baed6", "#2171b5", "#084594"],
};

export type AtlasMapSourceSpec =
  | { kind: "geojson"; data: AtlasMapCollection }
  | { kind: "vector"; tiles: string[]; sourceLayer: string };

export function atlasMapStyleUrl(): string {
  return import.meta.env.VITE_ATLAS_MAP_STYLE_URL?.trim() || DEFAULT_MAP_STYLE_URL;
}

export function modeConfig(mode: AtlasThematicMode) {
  return THEMATIC_MODES.find((item) => item.id === mode) ?? THEMATIC_MODES[0];
}

export function numericDomain(
  features: AtlasMapFeature[],
  property: keyof AtlasMapFeatureProperties,
): { min: number; max: number } | null {
  const values = features
    .map((feature) => feature.properties[property])
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (values.length === 0) return null;
  return { min: Math.min(...values), max: Math.max(...values) };
}

export function thematicFillExpression(
  mode: AtlasThematicMode,
  features: AtlasMapFeature[],
): ExpressionSpecification | string {
  if (mode === "boundaries") return BOUNDARY_FILL;

  const config = modeConfig(mode);
  if (!config.property) return BOUNDARY_FILL;

  const domain = numericDomain(features, config.property);
  const colors = SCALES[mode];
  if (!domain) return MISSING_VALUE_FILL;
  if (domain.min === domain.max) return colors[Math.floor(colors.length / 2)];

  const stops: Array<number | string> = [];
  colors.forEach((color, index) => {
    const t = index / (colors.length - 1);
    stops.push(domain.min + t * (domain.max - domain.min), color);
  });

  return [
    "case",
    ["==", ["typeof", ["get", config.property]], "number"],
    ["interpolate", ["linear"], ["to-number", ["get", config.property]], ...stops],
    MISSING_VALUE_FILL,
  ];
}

export function legendStops(mode: AtlasThematicMode, features: AtlasMapFeature[]): Array<{ color: string; value: number }> {
  if (mode === "boundaries") {
    return [{ color: BOUNDARY_FILL, value: Number.NaN }];
  }
  const config = modeConfig(mode);
  if (!config.property) return [];
  const domain = numericDomain(features, config.property);
  const colors = SCALES[mode];
  if (!domain) return [];
  return colors.map((color, index) => ({
    color,
    value: domain.min + (index / (colors.length - 1)) * (domain.max - domain.min),
  }));
}

export function findMapFeature(collection: AtlasMapCollection | undefined, settlementId: number | null | undefined): AtlasMapFeature | undefined {
  if (!collection || settlementId == null) return undefined;
  return collection.features.find((feature) => feature.properties.settlement_id === settlementId);
}

export function settlementPath(properties: Pick<AtlasMapFeatureProperties, "municipality_slug" | "settlement_slug" | "path">): string {
  if (properties.path) return properties.path;
  return `/mjesta/${properties.municipality_slug}/${properties.settlement_slug}`;
}

export function sourceSpecFromCollection(data: AtlasMapCollection): AtlasMapSourceSpec {
  return { kind: "geojson", data };
}
