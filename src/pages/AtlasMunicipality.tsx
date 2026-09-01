import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { AtlasBreadcrumbs } from "@/components/atlas/AtlasBreadcrumbs";
import { AtlasStatCard } from "@/components/atlas/AtlasStatCard";
import { MunicipalityHeader } from "@/components/atlas/MunicipalityHeader";
import { SettlementList } from "@/components/atlas/SettlementList";
import { SourcePanel } from "@/components/atlas/SourcePanel";
import { useAtlasMunicipality } from "@/hooks/useAtlas";
import { atlasMatches } from "@/lib/atlas-search";
import { formatBsNumber, formatCensusHouseholds, formatCensusPopulation } from "@/lib/atlas-format";
import type { GeoSettlementSummary } from "@/lib/atlas-types";

type SortKey = "name" | "population";

function sortSettlements(settlements: GeoSettlementSummary[], sort: SortKey): GeoSettlementSummary[] {
  return [...settlements].sort((left, right) => {
    if (sort === "population") {
      const rightPop = right.population?.population;
      const leftPop = left.population?.population;
      if (rightPop === undefined && leftPop === undefined) return left.name.localeCompare(right.name, "bs");
      if (rightPop === undefined) return 1;
      if (leftPop === undefined) return -1;
      if (rightPop !== leftPop) return rightPop - leftPop;
    }
    return left.name.localeCompare(right.name, "bs");
  });
}

const AtlasMunicipality = () => {
  const { municipalitySlug } = useParams();
  const { municipality, loading, error, notFound } = useAtlasMunicipality(municipalitySlug);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("name");

  useEffect(() => {
    if (!municipality) return;
    document.title = `Naselja opštine ${municipality.name} | Miloševac.com`;
    window.scrollTo({ top: 0 });
  }, [municipality]);

  const settlements = useMemo(() => {
    const rows = (municipality?.settlements ?? []).filter((settlement) => atlasMatches(settlement.name, query));
    return sortSettlements(rows, sort);
  }, [municipality, query, sort]);

  if (loading) {
    return <SiteLayout><div className="container-news py-16 text-center text-muted-foreground">Učitavam opštinu...</div></SiteLayout>;
  }

  if (notFound) {
    return (
      <SiteLayout>
        <div className="container-news py-16 text-center text-muted-foreground">
          Tražena opština nije pronađena u atlasu.
        </div>
      </SiteLayout>
    );
  }

  if (error || !municipality) {
    return (
      <SiteLayout>
        <div className="container-news py-16 text-center text-muted-foreground">
          Podatke o opštini trenutno nije moguće učitati.
        </div>
      </SiteLayout>
    );
  }

  const population = municipality.population;

  return (
    <SiteLayout>
      <AtlasBreadcrumbs
        items={[
          { label: "Početna", href: "/" },
          { label: "Mjesta", href: "/mjesta" },
          { label: municipality.name },
        ]}
      />

      <section className="container-news mt-4">
        <MunicipalityHeader municipality={municipality} kicker="Atlas naseljenih mjesta" />

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <AtlasStatCard
            label="Uvezena naselja"
            value={formatBsNumber(municipality.settlement_count)}
          />
          {population ? (
            <AtlasStatCard
              label={`Stanovništvo ${population.year}.`}
              value={formatBsNumber(population.total)}
              hint={formatCensusPopulation(population.total, population.year)}
            />
          ) : null}
          {population && population.households !== undefined ? (
            <AtlasStatCard
              label={`Domaćinstva ${population.year}.`}
              value={formatBsNumber(population.households)}
              hint={formatCensusHouseholds(population.households, population.year)}
            />
          ) : null}
        </div>

        {municipality.settlement_count === 0 ? (
          <p className="editorial-panel mt-8 py-10 text-center text-muted-foreground">
            Za ovu opštinu još nisu uvezena naselja.
          </p>
        ) : (
          <div className="editorial-panel mt-8 p-5 sm:p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex-1">
                <label htmlFor="naselja-pretraga" className="mb-1.5 block text-sm font-bold">
                  Pretraga naselja
                </label>
                <input
                  id="naselja-pretraga"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="npr. Miloševac"
                  className="h-11 w-full rounded-md border border-border/70 bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:max-w-sm"
                />
              </div>
              <div>
                <label htmlFor="naselja-poredak" className="mb-1.5 block text-sm font-bold">
                  Poredak
                </label>
                <select
                  id="naselja-poredak"
                  value={sort}
                  onChange={(event) => setSort(event.target.value as SortKey)}
                  className="h-11 rounded-md border border-border/70 bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="name">Abecedno</option>
                  <option value="population">Prema stanovništvu 2013.</option>
                </select>
              </div>
            </div>
            <SettlementList settlements={settlements} municipalitySlug={municipality.slug} />
          </div>
        )}

        <div className="mt-8">
          <SourcePanel source={municipality.source} />
        </div>
      </section>
    </SiteLayout>
  );
};

export default AtlasMunicipality;
