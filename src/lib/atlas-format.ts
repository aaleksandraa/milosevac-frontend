const numberFormat = new Intl.NumberFormat("bs-BA", { maximumFractionDigits: 0 });

export function formatBsNumber(value: number): string {
  return numberFormat.format(value);
}

export function formatCensusPopulation(count: number, year = 2013): string {
  return `${formatBsNumber(count)} stanovnika prema Popisu ${year}.`;
}

export function formatCensusHouseholds(count: number, year = 2013): string {
  return `${formatBsNumber(count)} ${count === 1 ? "domaćinstvo" : "domaćinstava"} prema Popisu ${year}.`;
}
