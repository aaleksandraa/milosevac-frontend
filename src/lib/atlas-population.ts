import type { GeoCensusRecord, GeoPopulationChange } from "@/lib/atlas-types";
import { formatBsNumber } from "@/lib/atlas-format";

export function sortCensusAscending(records: GeoCensusRecord[]): GeoCensusRecord[] {
  return [...records].sort((left, right) => left.census_year - right.census_year);
}

export function censusChartPoints(records: GeoCensusRecord[]): Array<{ year: number; population: number }> {
  return sortCensusAscending(records)
    .filter((row) => row.population !== null && row.population !== undefined)
    .map((row) => ({ year: row.census_year, population: row.population }));
}

export function hasComparabilityCaveat(records: GeoCensusRecord[], changes: GeoPopulationChange[] = []): boolean {
  return records.some((row) => row.comparability === "comparable_with_caveat")
    || changes.some((row) => row.comparability === "comparable_with_caveat");
}

export function changeBetween(changes: GeoPopulationChange[], fromYear: number, toYear: number): GeoPopulationChange | undefined {
  return changes.find((row) => row.from_year === fromYear && row.to_year === toYear);
}

export function censusDifferenceSentence(fromYear: number, fromPopulation: number, toYear: number, toPopulation: number): string {
  if (toPopulation < fromPopulation) {
    return `Broj stanovnika prema popisu smanjen je sa ${formatBsNumber(fromPopulation)} ${fromYear}. na ${formatBsNumber(toPopulation)} ${toYear}.`;
  }
  if (toPopulation > fromPopulation) {
    return `Broj stanovnika prema popisu povećan je sa ${formatBsNumber(fromPopulation)} ${fromYear}. na ${formatBsNumber(toPopulation)} ${toYear}.`;
  }

  return `Broj stanovnika prema popisu ostao je ${formatBsNumber(toPopulation)} (${fromYear}. i ${toYear}.).`;
}

export function censusChangeCardCopy(
  fromYear: number,
  toYear: number,
  absoluteChange: number,
  percentageChange: number | null,
): string {
  const amount = formatBsNumber(Math.abs(absoluteChange));
  const direction = absoluteChange > 0 ? "više" : absoluteChange < 0 ? "manje" : "isto";
  const percent = percentageChange === null
    ? ""
    : ` (${absoluteChange > 0 ? "+" : ""}${formatBsDecimalPct(percentageChange)}%)`;
  if (absoluteChange === 0) {
    return `U odnosu na Popis ${fromYear}, Popis ${toYear} bilježi isti broj stanovnika.`;
  }

  return `U odnosu na Popis ${fromYear}, Popis ${toYear} bilježi ${amount} stanovnika ${direction}${percent}.`;
}

function formatBsDecimalPct(value: number): string {
  return value.toLocaleString("bs-BA", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}
