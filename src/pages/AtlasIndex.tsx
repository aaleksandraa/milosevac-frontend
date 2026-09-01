import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapPinned, Search } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SourcePanel } from "@/components/atlas/SourcePanel";
import { AtlasMap } from "@/components/atlas/map/AtlasMap";
import { useAtlasMunicipalities } from "@/hooks/useAtlas";
import { atlasMatches } from "@/lib/atlas-search";
import { formatBsNumber, formatCensusPopulation } from "@/lib/atlas-format";

const AtlasIndex = () => {
  const { municipalities, loading, error } = useAtlasMunicipalities();
  const [query, setQuery] = useState("");
  const [selectedSettlementId, setSelectedSettlementId] = useState<number | null>(null);

  useEffect(() => {
    document.title = "Atlas naseljenih mjesta | Miloševac.com";
    window.scrollTo({ top: 0 });
  }, []);

  const filtered = useMemo(() => {
    return municipalities.map((municipality) => {
      const settlements = (municipality.settlements ?? []).filter((settlement) => atlasMatches(settlement.name, query));
      const municipalityMatches = atlasMatches(municipality.name, query);
      return {
        municipality,
        settlements: municipalityMatches && query.trim() === "" ? [] : settlements,
        show: municipalityMatches || settlements.length > 0,
      };
    }).filter((row) => row.show);
  }, [municipalities, query]);

  useEffect(() => {
    const matches = municipalities.flatMap((municipality) =>
      (municipality.settlements ?? []).filter((settlement) => atlasMatches(settlement.name, query)),
    );
    if (query.trim() !== "" && matches.length === 1) {
      setSelectedSettlementId(matches[0].id);
    }
  }, [municipalities, query]);

  if (loading) {
    return <SiteLayout><div className="container-news py-16 text-center text-muted-foreground">Učitavam atlas mjesta...</div></SiteLayout>;
  }

  if (error) {
    return (
      <SiteLayout>
        <div className="container-news py-16 text-center text-muted-foreground">
          Atlas trenutno nije moguće učitati. Pokušajte ponovo malo kasnije.
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="container-news pt-6 sm:pt-8">
        <div className="mb-6 border-b border-border/70 pb-5">
          <p className="mb-2 inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1 text-sm font-extrabold text-primary">
            <MapPinned className="h-4 w-4" /> Atlas mjesta
          </p>
          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">Naseljena mjesta Bosne i Hercegovine</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Atlas naseljenih mjesta Bosne i Hercegovine je u fazi proširenja. Trenutno su dostupni pilot podaci za Modriču i Šamac.
          </p>
        </div>

        <div className="mb-6">
          <AtlasMap
            selectedSettlementId={selectedSettlementId}
            onSelectedSettlementIdChange={setSelectedSettlementId}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="atlas-pretraga" className="mb-1.5 block text-sm font-bold">
            Pretraga naselja i opština
          </label>
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              id="atlas-pretraga"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="npr. Miloševac, Modriča, Šamac"
              className="h-11 w-full rounded-md border border-border/70 bg-card pl-10 pr-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map(({ municipality, settlements }) => (
            <article key={municipality.id} className="editorial-panel p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {municipality.admin_type_label}
                {municipality.entity ? ` · ${municipality.entity.name}` : ""}
              </p>
              <h2 className="mt-1 text-2xl font-extrabold">
                <Link to={municipality.path} className="hover:text-primary">{municipality.name}</Link>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {municipality.settlement_count} {municipality.settlement_count === 1 ? "naselje" : "naselja"}
                {municipality.population
                  ? ` · ${formatCensusPopulation(municipality.population.total, municipality.population.year)}`
                  : ""}
              </p>
              <Link to={municipality.path} className="action-link mt-4">
                {municipality.admin_type === "municipality" ? `Otvori opštinu ${municipality.name}` : `Otvori ${municipality.name}`}
              </Link>
              {query.trim() !== "" && settlements.length > 0 ? (
                <ul className="mt-4 space-y-1 border-t border-border/60 pt-3 text-sm">
                  {settlements.slice(0, 8).map((settlement) => (
                    <li key={settlement.id}>
                      <Link to={settlement.path} className="hover:text-primary">
                        {settlement.name}
                        {settlement.population ? ` · ${formatBsNumber(settlement.population.population)} (2013)` : ""}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="editorial-panel mt-4 py-10 text-center text-muted-foreground">Nema rezultata za unesenu pretragu.</p>
        ) : null}

        <div className="mt-8">
          <SourcePanel source={municipalities[0]?.source} />
        </div>
      </section>
    </SiteLayout>
  );
};

export default AtlasIndex;
