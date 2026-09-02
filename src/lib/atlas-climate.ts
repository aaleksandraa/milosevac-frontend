import type { GeoClimate, GeoClimateIndex, GeoClimateMonth } from "@/lib/atlas-types";

export const MONTH_LABELS_BS = [
  "januar",
  "februar",
  "mart",
  "april",
  "maj",
  "jun",
  "jul",
  "august",
  "septembar",
  "oktobar",
  "novembar",
  "decembar",
] as const;

export const MONTH_SHORT_BS = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"] as const;

export function monthLabel(month: number | null | undefined): string {
  if (month == null || month < 1 || month > 12) return "";
  return MONTH_LABELS_BS[month - 1];
}

export function climateMonthlyRows(climate: GeoClimate): GeoClimateMonth[] {
  return [...(climate.monthly ?? [])].sort((a, b) => a.month - b.month);
}

export function climateChartPoints(climate: GeoClimate): Array<{
  month: number;
  label: string;
  short: string;
  temperature: number | null;
  precipitation: number | null;
}> {
  return climateMonthlyRows(climate).map((row) => ({
    month: row.month,
    label: monthLabel(row.month),
    short: MONTH_SHORT_BS[row.month - 1],
    temperature: row.temperature_mean_c,
    precipitation: row.precipitation_mean_mm,
  }));
}

const INDEX_LABELS: Record<string, string> = {
  hot_days_30c: "Vrući dani",
  very_hot_days_35c: "Vrlo vrući dani",
  frost_days: "Mrazni dani",
  ice_days: "Ledeni dani",
  tropical_nights: "Tropske noći",
  precipitation_days_1mm: "Dani s padavinama",
};

export function climateIndexLabel(index: GeoClimateIndex): string {
  return INDEX_LABELS[index.code] ?? index.code;
}

export function climateHasPublicValues(climate?: GeoClimate | null): climate is GeoClimate {
  return Boolean(
    climate &&
      climate.annual &&
      climate.annual.temperature_mean_c !== null &&
      climate.annual.temperature_mean_c !== undefined &&
      climate.annual.precipitation_mm !== null &&
      climate.annual.precipitation_mm !== undefined,
  );
}
