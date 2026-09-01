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

export type GeoCensusRecord = {
  census_year: number;
  population: number;
  households?: number | null;
  statistical_settlement_code?: string | null;
  notes?: string | null;
  source?: GeoSource;
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
  points?: Array<{ type: string; lat: number; lng: number }>;
  geography?: GeoGeography;
  neighbors?: {
    previous: GeoNeighbor | null;
    next: GeoNeighbor | null;
  };
  source?: GeoSource;
};
