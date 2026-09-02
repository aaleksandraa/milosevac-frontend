import { AtlasStatCard } from "@/components/atlas/AtlasStatCard";
import { PopulationChart } from "@/components/atlas/PopulationChart";
import { PopulationTable } from "@/components/atlas/PopulationTable";
import { SourcePanel } from "@/components/atlas/SourcePanel";
import { formatBsNumber, formatCensusHouseholds, formatCensusPopulation } from "@/lib/atlas-format";
import {
  censusChangeCardCopy,
  censusDifferenceSentence,
  changeBetween,
  hasComparabilityCaveat,
  sortCensusAscending,
} from "@/lib/atlas-population";
import type { GeoCensusRecord, GeoPopulationChange, GeoSettlementPopulation, GeoSource } from "@/lib/atlas-types";

const CAVEAT_COPY =
  "Istorijski podaci su povezani sa današnjim naseljem, ali administrativne ili statističke granice kroz vrijeme nisu nužno potpuno iste.";

export function PopulationSection({
  latest,
  census,
  changes,
}: {
  latest?: GeoSettlementPopulation;
  census: GeoCensusRecord[];
  changes: GeoPopulationChange[];
}) {
  if (!latest && census.length === 0) {
    return (
      <p className="editorial-panel mt-8 py-8 text-center text-muted-foreground">
        Za ovo naselje još nema uvezenih podataka o stanovništvu.
      </p>
    );
  }

  const chronological = sortCensusAscending(census);
  const change1991 = changeBetween(changes, 1991, 2013);
  const showCaveat = hasComparabilityCaveat(census, changes);
  const sources = uniqueCensusSources(chronological.filter((row) => row.census_year !== 2013));

  return (
    <>
      {latest ? (
        <section className="mt-8" aria-labelledby="stanovnistvo">
          <h2 id="stanovnistvo" className="text-lg font-extrabold">Stanovništvo</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <AtlasStatCard
              label={`Popis ${latest.year}.`}
              value={formatBsNumber(latest.population)}
              hint={formatCensusPopulation(latest.population, latest.year)}
            />
            {latest.households !== null && latest.households !== undefined ? (
              <AtlasStatCard
                label="Domaćinstva"
                value={formatBsNumber(latest.households)}
                hint={formatCensusHouseholds(latest.households, latest.year)}
              />
            ) : null}
          </div>
        </section>
      ) : null}

      {chronological.length > 0 ? (
        <section className="editorial-panel mt-8 p-5 sm:p-6" aria-labelledby="kretanje-stanovnistva">
          <h2 id="kretanje-stanovnistva" className="text-lg font-extrabold">Kretanje broja stanovnika</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Prikazani su samo službeni popisi. Između popisnih godina nema procjena ni interpolacije.
            Posljednji službeni popis naselja je 2013.
          </p>
          {change1991 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <AtlasStatCard label="Popis 1991." value={formatBsNumber(change1991.from_population)} />
              <AtlasStatCard label="Popis 2013." value={formatBsNumber(change1991.to_population)} />
              <AtlasStatCard
                label="Razlika 1991–2013."
                value={`${change1991.absolute_change > 0 ? "+" : ""}${formatBsNumber(change1991.absolute_change)}`}
                hint={censusChangeCardCopy(1991, 2013, change1991.absolute_change, change1991.percentage_change)}
              />
              {change1991.percentage_change !== null ? (
                <AtlasStatCard
                  label="Promjena 1991–2013."
                  value={`${change1991.percentage_change > 0 ? "+" : ""}${change1991.percentage_change.toLocaleString("bs-BA", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`}
                />
              ) : null}
            </div>
          ) : null}
          {change1991 ? (
            <p className="mt-4 text-sm leading-relaxed">{censusDifferenceSentence(1991, change1991.from_population, 2013, change1991.to_population)}</p>
          ) : null}
          {showCaveat ? (
            <p className="mt-4 rounded-md border border-border/70 bg-muted/50 px-3 py-2 text-sm leading-relaxed" role="note">
              {CAVEAT_COPY}
            </p>
          ) : null}
          <PopulationChart records={chronological} />
          <div className="mt-4">
            <PopulationTable records={chronological} />
          </div>
        </section>
      ) : null}

      {sources.length > 0 ? (
        <div className="mt-6 grid gap-4">
          {sources.map((item) => (
            <SourcePanel
              key={`${item.year}-${item.source.name}`}
              source={item.source}
              title={`Izvor popisa ${item.year}.`}
              headingId={`atlas-izvor-popis-${item.year}`}
              extraItems={item.note ? [["Napomena o povezivanju", item.note]] : undefined}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}

function uniqueCensusSources(records: GeoCensusRecord[]): Array<{ year: number; source: GeoSource; note?: string }> {
  const seen = new Set<string>();
  const items: Array<{ year: number; source: GeoSource; note?: string }> = [];
  for (const row of records) {
    if (!row.source) continue;
    const key = `${row.census_year}-${row.source.name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({
      year: row.census_year,
      source: row.source,
      note: row.reconciliation_note,
    });
  }
  return items;
}
