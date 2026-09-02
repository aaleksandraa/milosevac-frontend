export type RankingScopeCode = "pilot" | "municipality";
export type RankingDirectionCode = "asc" | "desc";

export type AtlasMetricDefinition = {
  code: string;
  label: string;
  short_label: string;
  unit: string;
  source_family: string;
  category: "population" | "geography" | "climate" | "places";
  category_label: string;
  default_direction: RankingDirectionCode;
  allows_both_directions: boolean;
  rankable: boolean;
  zero_is_valid: boolean;
  precision: number;
  ranking_method: string;
  high_semantic_label: string;
  low_semantic_label: string;
  percentage_difference_useful: boolean;
  methodology: string;
  eligibility: string;
  high_ranking_label: string;
  low_ranking_label: string;
};

export type AtlasRelativeFact = {
  metric: string;
  label: string;
  short_label: string;
  value: number;
  unit: string;
  rank: number;
  eligible: number;
  tied?: boolean;
  tie_count?: number;
  percentile_strictly_above: number;
  percentile_strictly_below: number;
  direction: RankingDirectionCode;
  scope: RankingScopeCode;
  scope_note: string;
  eligibility_note: string;
  methodology: string;
  source_family: string;
};

export type AtlasRankingEntry = {
  rank: number;
  value: number;
  percentile_strictly_above: number;
  percentile_strictly_below: number;
  tie_count: number;
  eligible?: number;
  settlement: {
    id: number;
    name: string;
    slug: string;
    path: string;
    municipality?: { name: string; slug: string } | null;
  };
};

export type AtlasRankingTable = {
  metric: AtlasMetricDefinition;
  scope: RankingScopeCode;
  scope_label: string;
  scope_note: string;
  municipality?: { name: string; slug: string } | null;
  direction: RankingDirectionCode;
  ranking_method: string;
  eligible: number;
  missing: number;
  universe: number;
  limit: number;
  min?: number | null;
  max?: number | null;
  entries: AtlasRankingEntry[];
};

export type AtlasCompareSide = {
  id: number;
  name: string;
  slug: string;
  path: string;
  municipality?: { id?: number; name: string; slug: string; path?: string } | null;
};

export type AtlasCompareRow = {
  metric: string;
  label: string;
  short_label: string;
  unit: string;
  a: { value: number | null; unavailable_reason?: string | null };
  b: { value: number | null; unavailable_reason?: string | null };
  difference?: { absolute: number; percentage: number | null } | null;
  comparable: boolean;
  caveat?: string | null;
  source_family: string;
  methodology: string;
};

export type AtlasComparePayload = {
  a: AtlasCompareSide;
  b: AtlasCompareSide;
  sections: Array<{
    code: string;
    label: string;
    rows: AtlasCompareRow[];
  }>;
};
