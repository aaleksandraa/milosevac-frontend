export type AtlasThematicMode =
  | "boundaries"
  | "elevation_mean"
  | "elevation_range"
  | "slope_mean"
  | "population_2013"
  | "population_change_1991_2013"
  | "temperature_mean_annual"
  | "precipitation_annual"
  | "landcover_agricultural"
  | "landcover_forest"
  | "landcover_artificial"
  | "tree_cover_mean";

export type AtlasMapFeatureProperties = {
  settlement_id: number;
  settlement_name: string;
  settlement_slug: string;
  municipality_name: string;
  municipality_slug: string;
  path: string;
  indexable?: boolean;
  area_km2?: number;
  population_2013?: number;
  population_change_1991_2013_pct?: number;
  elevation_min_m?: number;
  elevation_max_m?: number;
  elevation_mean_m?: number;
  elevation_median_m?: number;
  elevation_range_m?: number;
  slope_mean_deg?: number;
  boundary_source_type?: string;
  terrain_quality_flag?: string;
  temperature_mean_annual_c?: number;
  precipitation_annual_mm?: number;
  climate_quality_flag?: string;
  climate_normal_period?: string;
  landcover_agricultural_pct?: number;
  landcover_forest_pct?: number;
  landcover_artificial_pct?: number;
  tree_cover_mean_pct?: number;
  imperviousness_mean_pct?: number;
};

export type AtlasMapFeature = {
  type: "Feature";
  id?: number;
  properties: AtlasMapFeatureProperties;
  geometry: {
    type: string;
    coordinates: unknown;
  };
};

export type AtlasMapMeta = {
  boundary_source_type?: string;
  terrain_source_type?: string;
  climate_source_type?: string;
  geometry_strategy?: string;
  feature_count?: number;
  boundary_note?: string;
  terrain_note?: string;
  coverage_note?: string;
  climate_note?: string;
  landcover_note?: string;
  landcover_source_type?: string;
  population_change_note?: string;
};

export type AtlasMapCollection = {
  type: "FeatureCollection";
  features: AtlasMapFeature[];
  bbox?: [number, number, number, number];
  meta?: AtlasMapMeta;
};

export const THEMATIC_MODES: Array<{
  id: AtlasThematicMode;
  label: string;
  property: keyof AtlasMapFeatureProperties | null;
  unit: string;
  legendTitle: string;
  legendNote?: string;
}> = [
  { id: "boundaries", label: "Granice", property: null, unit: "", legendTitle: "Granice naselja" },
  {
    id: "elevation_mean",
    label: "Prosječna visina",
    property: "elevation_mean_m",
    unit: "m",
    legendTitle: "Prosječna nadmorska visina prema DEM-u",
  },
  {
    id: "elevation_range",
    label: "Visinski raspon",
    property: "elevation_range_m",
    unit: "m",
    legendTitle: "Visinska razlika",
  },
  {
    id: "slope_mean",
    label: "Prosječan nagib",
    property: "slope_mean_deg",
    unit: "°",
    legendTitle: "Prosječan nagib terena",
  },
  {
    id: "population_2013",
    label: "Stanovništvo 2013.",
    property: "population_2013",
    unit: "",
    legendTitle: "Stanovništvo — Popis 2013",
  },
  {
    id: "population_change_1991_2013",
    label: "Promjena 1991–2013.",
    property: "population_change_1991_2013_pct",
    unit: "%",
    legendTitle: "Promjena broja stanovnika, Popis 1991 → Popis 2013",
    legendNote: "Razlika popisa za uporediva naselja. Nije uzrok niti procjena za 2026.",
  },
  {
    id: "temperature_mean_annual",
    label: "Prosječna godišnja temperatura",
    property: "temperature_mean_annual_c",
    unit: "°C",
    legendTitle: "Prosječna godišnja temperatura",
    legendNote: "ERA5-Land reanaliza, period 1991–2020. Nisu mjerenja meteorološke stanice.",
  },
  {
    id: "precipitation_annual",
    label: "Godišnje padavine",
    property: "precipitation_annual_mm",
    unit: "mm",
    legendTitle: "Godišnje padavine",
    legendNote: "ERA5 reanaliza, period 1991–2020. Nisu mjerenja meteorološke stanice.",
  },
  {
    id: "landcover_agricultural",
    label: "Poljoprivredne površine",
    property: "landcover_agricultural_pct",
    unit: "%",
    legendTitle: "Udio poljoprivrednih površina",
    legendNote: "CORINE Land Cover 2018, unutar atlas granice naselja. Referentna 2018. godina.",
  },
  {
    id: "landcover_forest",
    label: "Šumske površine",
    property: "landcover_forest_pct",
    unit: "%",
    legendTitle: "Udio šumskog pokrova (CLC)",
    legendNote: "CLC razredi 311–313, 2018. Nije gustoća krošnji.",
  },
  {
    id: "landcover_artificial",
    label: "Umjetne površine",
    property: "landcover_artificial_pct",
    unit: "%",
    legendTitle: "Udio umjetnih površina",
    legendNote: "CORINE Land Cover 2018. Nisu sve umjetne površine zgrade.",
  },
  {
    id: "tree_cover_mean",
    label: "Pokrivenost krošnjama",
    property: "tree_cover_mean_pct",
    unit: "%",
    legendTitle: "Prosječna pokrivenost krošnjama",
    legendNote: "Copernicus HRL Tree Cover Density 2018. Gustoća krošnji, ne CLC udio šume.",
  },
];
