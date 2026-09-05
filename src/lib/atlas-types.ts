import type { TransportProfile, HydroProfile, ProximityResult } from "./atlas-network";
import type { AtlasRelativeFact } from "@/lib/atlas-ranking-types";

export type GeoSource = {
  name: string;
  provider?: string;
  source_class: string;
  source_class_label?: string;
  dataset_version?: string | null;
  attribution?: string | null;
  url?: string | null;
  retrieval_date?: string | null;
  methodology_note?: string;
};

export type GeoEntity = {
  id: number;
  name: string;
  slug: string;
  kind: string;
};

export type GeoCanton = {
  id: number;
  name: string;
  slug: string;
};

export type GeoCensusComparability =
  | "comparable"
  | "comparable_with_caveat"
  | "not_directly_comparable"
  | "unresolved";

export type GeoCensusRecord = {
  census_year: number;
  population: number;
  households?: number | null;
  statistical_settlement_code?: string | null;
  comparability?: GeoCensusComparability;
  mapping_status?: string;
  historical_settlement_name?: string | null;
  historical_municipality_name?: string | null;
  reconciliation_note?: string | null;
  notes?: string | null;
  source?: GeoSource;
};

export type GeoPopulationChange = {
  from_year: number;
  to_year: number;
  from_population: number;
  to_population: number;
  absolute_change: number;
  percentage_change: number | null;
  trend: "growth" | "decline" | "unchanged";
  comparability: GeoCensusComparability;
};

export type GeoSettlementPopulation = {
  year: number;
  population: number;
  households?: number | null;
};

export type GeoSettlementSummary = {
  id: number;
  name: string;
  slug: string;
  name_cyrillic?: string | null;
  statistical_code?: string | null;
  path: string;
  indexable: boolean;
  population?: GeoSettlementPopulation;
};

export type GeoMunicipalityPopulation = {
  year: number;
  total: number;
  households?: number;
  settlement_records?: number;
  note?: string;
};

export type GeoMunicipality = {
  id: number;
  name: string;
  slug: string;
  admin_type: string;
  admin_type_label: string;
  statistical_code?: string | null;
  path: string;
  entity?: GeoEntity;
  canton?: GeoCanton;
  settlement_count: number;
  population?: GeoMunicipalityPopulation;
  source?: GeoSource;
  settlements?: GeoSettlementSummary[];
};

export type GeoNeighbor = {
  name: string;
  slug: string;
  path: string;
};

export type GeoTerrain = {
  elevation_min_m: number;
  elevation_max_m: number;
  elevation_mean_m?: number | null;
  elevation_median_m?: number | null;
  elevation_range_m?: number | null;
  slope_mean_deg?: number | null;
  sample_count?: number;
  quality_flag?: string;
  dem_source?: string;
  dem_version?: string;
  dem_resolution_m?: number;
  algorithm_version?: string;
  calculated_at?: string | null;
};

export type GeoGeography = {
  area_km2?: number;
  area_algorithm?: string;
  geographic_centroid?: { lat: number; lng: number };
  terrain?: GeoTerrain;
  boundary_source?: GeoSource;
  terrain_source?: GeoSource;
  methodology?: string;
};

export type GeoClimateMonth = {
  month: number;
  temperature_mean_c: number | null;
  temperature_mean_min_c: number | null;
  temperature_mean_max_c: number | null;
  precipitation_mean_mm: number | null;
};

export type GeoClimateIndex = {
  code: string;
  value: number | null;
  threshold?: number;
  unit?: string;
  definition?: string;
};

export type GeoClimateExtreme = {
  metric_code: string;
  value: number | null;
  unit: string;
  occurred_on?: string | null;
  period_start?: string | null;
  period_end?: string | null;
  kind?: string;
  wording?: string | null;
};

export type GeoClimate = {
  normal_period: string;
  normal_period_start?: string | null;
  normal_period_end?: string | null;
  historical_period_start?: string | null;
  historical_period_end?: string | null;
  annual: {
    temperature_mean_c: number | null;
    precipitation_mm: number | null;
    coldest_month?: number | null;
    warmest_month?: number | null;
    wettest_month?: number | null;
    driest_month?: number | null;
    temperature_range_c?: number | null;
    temperature_mean_1961_1990_c?: number | null;
    temperature_mean_change_c?: number | null;
  };
  monthly: GeoClimateMonth[];
  indices?: GeoClimateIndex[];
  extremes?: GeoClimateExtreme[];
  methodology?: {
    text: string;
    spatial_method?: string;
    source_resolution_km?: number | null;
    grid_cell_count?: number;
    algorithm_version?: string;
    quality_flag?: string;
    timezone?: string;
    temperature_dataset?: string;
    precipitation_dataset?: string;
  };
  source?: GeoSource | null;
};

export type GeoLandCoverGroup = {
  code: string;
  label: string;
  share_pct: number | null;
};

export type GeoLandCoverClass = {
  code: string;
  label: string;
  atlas_group?: string | null;
  atlas_group_label?: string | null;
  area_km2: number;
  share_pct: number | null;
};

export type GeoLandCover = {
  reference_year: number;
  summary?: {
    dominant_group?: { code: string; label: string; share_pct?: number; area_km2?: number } | null;
    dominant_class?: { code: string; label: string; atlas_group?: string; share_pct?: number; area_km2?: number } | null;
    artificial_pct?: number | null;
    agricultural_pct?: number | null;
    forest_pct?: number | null;
    seminatural_pct?: number | null;
    open_or_sparse_pct?: number | null;
    wetland_pct?: number | null;
    water_pct?: number | null;
    groups?: GeoLandCoverGroup[];
  };
  classes?: GeoLandCoverClass[];
  forest?: {
    tree_cover_mean_pct?: number | null;
    forest_area_pct?: number | null;
    tree_cover_wording?: string | null;
    forest_area_wording?: string | null;
    reference_year?: number;
  } | null;
  imperviousness?: {
    imperviousness_mean_pct?: number | null;
    wording?: string | null;
    reference_year?: number;
  } | null;
  water_wetness?: {
    permanent_water_pct?: number | null;
    temporary_water_pct?: number | null;
    wet_area_pct?: number | null;
    water_wetness_pct?: number | null;
    wording?: string | null;
    reference_year?: number;
  } | null;
  methodology?: {
    text: string;
    algorithm_version?: string;
    processing_crs?: string;
    clc_method?: string;
    hrl_method?: string;
    quality_flag?: string;
    boundary_note?: string;
    temporal_note?: string;
  };
  source?: GeoSource | null;
};

export type GeoSettlementDetail = {
  id: number;
  name: string;
  slug: string;
  name_cyrillic?: string | null;
  statistical_code?: string | null;
  official_code?: string | null;
  path: string;
  indexable: boolean;
  municipality?: GeoMunicipality;
  entity?: GeoEntity;
  population?: GeoSettlementPopulation;
  census?: GeoCensusRecord[];
  population_changes?: GeoPopulationChange[];
  points?: Array<{ type: string; lat: number; lng: number }>;
  geography?: GeoGeography;
  climate?: GeoClimate;
  land_cover?: GeoLandCover;
  transport?: TransportProfile;
  hydrography?: HydroProfile;
  proximity?: Record<string, ProximityResult>;
  relative_facts?: AtlasRelativeFact[];
  neighbors?: {
    previous: GeoNeighbor | null;
    next: GeoNeighbor | null;
  };
  source?: GeoSource;
};
