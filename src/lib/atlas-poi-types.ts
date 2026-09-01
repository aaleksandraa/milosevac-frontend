export type AtlasPoiFamily =
  | "education"
  | "health"
  | "sport"
  | "religion"
  | "culture"
  | "historic"
  | "tourism"
  | "government"
  | "transport"
  | "infrastructure"
  | "nature"
  | "commercial";

export type AtlasPoiProperties = {
  id: number;
  type?: string;
  family?: AtlasPoiFamily | string;
  family_label?: string;
  type_label?: string;
  name?: string | null;
  display_label: string;
  name_is_generic?: boolean;
  municipality_slug?: string;
  municipality_name?: string;
  settlement_slug?: string | null;
  settlement_name?: string | null;
  path?: string | null;
  operator?: string | null;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
  verification?: string;
  source?: string;
};

export type AtlasPoiFeature = {
  type: "Feature";
  id?: number;
  properties: AtlasPoiProperties;
  geometry: {
    type: "Point";
    coordinates: [number, number] | number[];
  };
};

export type AtlasPoiCollection = {
  type: "FeatureCollection";
  features: AtlasPoiFeature[];
  bbox?: [number, number, number, number];
  meta?: {
    source_type?: string;
    license?: string;
    attribution?: string;
    feature_count?: number;
    coverage_note?: string;
    point_note?: string;
    assignment_note?: string;
  };
};

export type AtlasPoiListItem = AtlasPoiProperties & {
  lat?: number;
  lng?: number;
};

export type AtlasPoiGroup = {
  family: string;
  family_label: string;
  places: AtlasPoiListItem[];
};

export const POI_FILTER_GROUPS: Array<{ id: string; label: string; families: string[] }> = [
  { id: "all", label: "Sve", families: [] },
  { id: "health", label: "Zdravstvo", families: ["health"] },
  { id: "education", label: "Obrazovanje", families: ["education"] },
  { id: "sport", label: "Sport", families: ["sport"] },
  { id: "religion", label: "Vjerski objekti", families: ["religion"] },
  { id: "culture_history", label: "Kultura i istorija", families: ["culture", "historic"] },
  { id: "tourism", label: "Turizam", families: ["tourism"] },
  { id: "public", label: "Javne službe", families: ["government", "transport"] },
];

export const POI_FAMILY_COLORS: Record<string, string> = {
  education: "#1d4ed8",
  health: "#b91c1c",
  sport: "#15803d",
  religion: "#57534e",
  culture: "#6d28d9",
  historic: "#6d28d9",
  tourism: "#0f766e",
  government: "#b45309",
  transport: "#334155",
  nature: "#3f6212",
  infrastructure: "#57534e",
  commercial: "#9a3412",
};

export function poiDisplayLabel(place: Pick<AtlasPoiProperties, "name" | "display_label" | "type_label">): string {
  if (place.name && place.name.trim() !== "") return place.name;
  return place.display_label || place.type_label || "Objekat";
}
