export type AtlasThematicMode =
  | "boundaries"
  | "elevation_mean"
  | "elevation_range"
  | "slope_mean"
  | "population_2013"
  | "temperature_mean_annual"
  | "precipitation_annual";

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
];
