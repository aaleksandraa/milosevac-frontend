const numberFormat = new Intl.NumberFormat("bs-BA", { maximumFractionDigits: 0 });
const decimalFormat = new Intl.NumberFormat("bs-BA", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const areaFormat = new Intl.NumberFormat("bs-BA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatBsNumber(value: number): string {
  return numberFormat.format(value);
}

export function formatBsDecimal(value: number, digits = 1): string {
  if (digits === 2) return areaFormat.format(value);
  return decimalFormat.format(value);
}

export function formatAreaKm2(value: number): string {
  return `${formatBsDecimal(value, 2)} km²`;
}

export function formatElevationM(value: number): string {
  return `${formatBsDecimal(value, 1)} m`;
}

export function formatSlopeDeg(value: number): string {
  return `${formatBsDecimal(value, 1)}°`;
}

export function formatCensusPopulation(count: number, year = 2013): string {
  return `${formatBsNumber(count)} stanovnika prema Popisu ${year}.`;
}

export function formatCensusHouseholds(count: number, year = 2013): string {
  return `${formatBsNumber(count)} ${count === 1 ? "domaćinstvo" : "domaćinstava"} prema Popisu ${year}.`;
}
