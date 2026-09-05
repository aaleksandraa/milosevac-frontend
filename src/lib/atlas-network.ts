export interface NetworkSource {
  name: string;
  attribution: string;
  license: string;
  url: string;
  osm_timestamp: string | null;
}
export interface TransportProfile {
  mapped_road_length_km: number;
  major_road_length_km: number;
  mapped_road_density_km_per_km2: number | null;
  road_length_by_group_km: Record<string, number>;
  source: NetworkSource;
  methodology: string;
}
export interface HydroProfile {
  waterway_length_km: number;
  mapped_water_area_km2: number;
  named_features: Array<{ osm_type: string; osm_id: number; name: string; feature_type: string; relation: string }>;
  source: NetworkSource;
  methodology: string;
}
export interface ProximityResult {
  label: string;
  target_name: string | null;
  distance_straight_m: number;
  distance_route_m: null;
  travel_time_s: null;
  method: string;
  origin_type: string;
  source: NetworkSource;
}
export function formatDistance(metres: number): string {
  if (metres < 1000) return `${new Intl.NumberFormat("bs-BA", { maximumFractionDigits: 0 }).format(metres)} m`;
  return `${new Intl.NumberFormat("bs-BA", { maximumFractionDigits: metres < 10000 ? 1 : 0 }).format(metres / 1000)} km`;
}
export function formatNetworkKm(km: number): string {
  return `${new Intl.NumberFormat("bs-BA", { maximumFractionDigits: 1 }).format(km)} km`;
}
