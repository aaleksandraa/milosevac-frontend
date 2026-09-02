import { formatAreaKm2, formatBsDecimal, formatBsNumber, formatElevationM, formatPrecipitationMm, formatSlopeDeg, formatTemperatureC } from "@/lib/atlas-format";
import type { AtlasThematicMode } from "@/lib/atlas-map-types";
import type { AtlasCompareRow, AtlasMetricDefinition, AtlasRelativeFact, RankingDirectionCode } from "@/lib/atlas-ranking-types";
import type { GeoMunicipality } from "@/lib/atlas-types";

export type SettlementOption = {
  municipalitySlug: string;
  municipalityName: string;
  settlementSlug: string;
  settlementName: string;
  path: string;
};

export function settlementOptionsFromMunicipalities(municipalities: GeoMunicipality[]): SettlementOption[] {
  return municipalities.flatMap((municipality) =>
    (municipality.settlements ?? []).map((settlement) => ({
      municipalitySlug: municipality.slug,
      municipalityName: municipality.name,
      settlementSlug: settlement.slug,
      settlementName: settlement.name,
      path: settlement.path,
    })),
  );
}

export function comparePath(
  municipalityA: string,
  settlementA: string,
  municipalityB: string,
  settlementB: string,
): string {
  return `/uporedi/${municipalityA}/${settlementA}/${municipalityB}/${settlementB}`;
}

export function rankingPath(params: {
  metric?: string;
  scope?: string;
  municipality?: string;
  direction?: string;
  limit?: string;
}): string {
  const search = new URLSearchParams();
  if (params.metric) search.set("metric", params.metric);
  if (params.scope) search.set("scope", params.scope);
  if (params.municipality) search.set("municipality", params.municipality);
  if (params.direction) search.set("direction", params.direction);
  if (params.limit) search.set("limit", params.limit);
  const query = search.toString();
  return query ? `/rang-liste?${query}` : "/rang-liste";
}

export function metricForThematicMode(mode: AtlasThematicMode): string | null {
  switch (mode) {
    case "population_2013":
      return "population_2013";
    case "population_change_1991_2013":
      return "population_change_1991_2013_pct";
    case "elevation_mean":
      return "elevation_mean_m";
    case "elevation_range":
      return "elevation_range_m";
    case "slope_mean":
      return "slope_mean_deg";
    case "temperature_mean_annual":
      return "temperature_mean_annual_c";
    case "precipitation_annual":
      return "precipitation_annual_mm";
    default:
      return null;
  }
}

export function formatMetricValue(value: number | null | undefined, unit: string, precision = 1): string {
  if (value === null || value === undefined) return "Nema dostupnog podatka";
  if (unit === "km²") return formatAreaKm2(value);
  if (unit === "m") return formatElevationM(value);
  if (unit === "°C") return formatTemperatureC(value);
  if (unit === "mm") return formatPrecipitationMm(value);
  if (unit === "°") return formatSlopeDeg(value);
  if (unit === "%") return `${formatBsDecimal(value, 1)}%`;
  if (unit === "dana/god.") return `${formatBsDecimal(value, precision)} dana/god.`;
  if (unit === "") return formatBsNumber(Math.round(value));
  return `${formatBsDecimal(value, precision)} ${unit}`.trim();
}

export function relativeFactSentence(fact: AtlasRelativeFact): string {
  return `${fact.short_label}: ${fact.rank}. od ${fact.eligible} naselja ${fact.scope_note}.`;
}

export function relativePercentileSentence(fact: AtlasRelativeFact): string | null {
  if (fact.eligible < 2) return null;
  if (fact.percentile_strictly_above >= fact.percentile_strictly_below && fact.percentile_strictly_above > 0) {
    return `Niže je od ${fact.percentile_strictly_above}% ${fact.scope_note}.`;
  }
  if (fact.percentile_strictly_below > 0) {
    return `Više je od ${fact.percentile_strictly_below}% ${fact.scope_note}.`;
  }
  return null;
}

export function rankingPresetOptions(metrics: AtlasMetricDefinition[]): Array<{
  id: string;
  metric: string;
  direction: RankingDirectionCode;
  category: string;
  category_label: string;
  label: string;
}> {
  return metrics
    .filter((metric) => metric.rankable)
    .flatMap((metric) => {
      const options = [
        {
          id: `${metric.code}:desc`,
          metric: metric.code,
          direction: "desc" as const,
          category: metric.category,
          category_label: metric.category_label,
          label: metric.high_ranking_label,
        },
      ];
      if (metric.allows_both_directions) {
        options.push({
          id: `${metric.code}:asc`,
          metric: metric.code,
          direction: "asc",
          category: metric.category,
          category_label: metric.category_label,
          label: metric.low_ranking_label,
        });
      }
      return options;
    });
}

export function compareBarWidths(row: AtlasCompareRow): { a: number; b: number } | null {
  if (row.a.value === null || row.b.value === null) return null;
  if (row.unit === "°C" || row.unit === "m" || row.unit === "°" || row.unit === "%" || row.unit === "mm") return null;
  const max = Math.max(Math.abs(row.a.value), Math.abs(row.b.value));
  if (max <= 0) return { a: 0, b: 0 };
  return {
    a: Math.round((Math.abs(row.a.value) / max) * 100),
    b: Math.round((Math.abs(row.b.value) / max) * 100),
  };
}
