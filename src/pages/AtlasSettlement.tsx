import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { AtlasBreadcrumbs } from "@/components/atlas/AtlasBreadcrumbs";
import { AtlasStatCard } from "@/components/atlas/AtlasStatCard";
import { PopulationTable } from "@/components/atlas/PopulationTable";
import { SourcePanel } from "@/components/atlas/SourcePanel";
import { AtlasMap } from "@/components/atlas/map/AtlasMap";
import { useAtlasSettlement } from "@/hooks/useAtlas";
import type { GeoGeography } from "@/lib/atlas-types";
import { formatAreaKm2, formatBsNumber, formatCensusHouseholds, formatCensusPopulation, formatElevationM, formatSlopeDeg } from "@/lib/atlas-format";

const AtlasSettlement = () => {
  const { municipalitySlug, settlementSlug } = useParams();
  const { settlement, loading, error, notFound } = useAtlasSettlement(municipalitySlug, settlementSlug);

  useEffect(() => {
    if (!settlement) return;
    document.title = `${settlement.name} – stanovništvo i podaci | Miloševac.com`;
    window.scrollTo({ top: 0 });
  }, [settlement]);

  if (loading) {
    return <SiteLayout><div className="container-news py-16 text-center text-muted-foreground">Učitavam naselje...</div></SiteLayout>;
  }

  if (notFound) {
    return (
      <SiteLayout>
        <div className="container-news py-16 text-center text-muted-foreground">
          Traženo naselje nije pronađeno u ovoj opštini.
        </div>
      </SiteLayout>
    );
  }

  if (error || !settlement) {
    return (
      <SiteLayout>
        <div className="container-news py-16 text-center text-muted-foreground">
          Podatke o naselju trenutno nije moguće učitati.
        </div>
      </SiteLayout>
    );
  }

  const municipality = settlement.municipality;
  const census = settlement.census ?? [];
  const facts = [
    municipality ? ["Jedinica lokalne samouprave", `${municipality.admin_type_label} ${municipality.name}`] : null,
    settlement.entity ? ["Entitet", settlement.entity.name] : null,
    municipality?.canton ? ["Kanton", municipality.canton.name] : null,
    settlement.statistical_code ? ["Statistička šifra", settlement.statistical_code] : null,
    settlement.population ? ["Stanovništvo", formatCensusPopulation(settlement.population.population, settlement.population.year)] : null,
    settlement.population && settlement.population.households !== null && settlement.population.households !== undefined
      ? ["Domaćinstva", formatCensusHouseholds(settlement.population.households, settlement.population.year)]
      : null,
  ].filter((item): item is [string, string] => item !== null);

  return (
    <SiteLayout>
      <AtlasBreadcrumbs
        items={[
          { label: "Početna", href: "/" },
          { label: "Mjesta", href: "/mjesta" },
          { label: municipality?.name ?? "Opština", href: municipality?.path ?? `/mjesta/${municipalitySlug}` },
          { label: settlement.name },
        ]}
      />

      <section className="container-news mt-4">
        <header className="border-b border-border/70 pb-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">Naseljeno mjesto</p>
          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">{settlement.name}</h1>
          {municipality ? (
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              {municipality.admin_type_label} {municipality.name}
              {settlement.entity ? ` · ${settlement.entity.name}` : ""}
            </p>
          ) : null}
        </header>

        {municipality ? (
          <div className="mt-6">
            <SettlementAtlasMap settlement={settlement} municipalitySlug={municipality.slug} />
          </div>
        ) : null}

        {facts.length > 0 ? (
          <section className="mt-6" aria-labelledby="kljucne-cinjenice">
            <h2 id="kljucne-cinjenice" className="text-lg font-extrabold">Ključni podaci</h2>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              {facts.map(([label, value]) => (
                <div key={label} className="editorial-panel p-4">
                  <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</dt>
                  <dd className="mt-1 font-extrabold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {settlement.population ? (
          <section className="mt-8" aria-labelledby="stanovnistvo">
            <h2 id="stanovnistvo" className="text-lg font-extrabold">Stanovništvo</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <AtlasStatCard
                label={`Popis ${settlement.population.year}.`}
                value={formatBsNumber(settlement.population.population)}
                hint={formatCensusPopulation(settlement.population.population, settlement.population.year)}
              />
              {settlement.population.households !== null && settlement.population.households !== undefined ? (
                <AtlasStatCard
                  label="Domaćinstva"
                  value={formatBsNumber(settlement.population.households)}
                  hint={formatCensusHouseholds(settlement.population.households, settlement.population.year)}
                />
              ) : null}
            </div>
          </section>
        ) : (
          <p className="editorial-panel mt-8 py-8 text-center text-muted-foreground">
            Za ovo naselje još nema uvezenih podataka o stanovništvu.
          </p>
        )}

        {census.length > 0 ? (
          <section className="editorial-panel mt-8 p-5 sm:p-6" aria-labelledby="popis-tabela">
            <h2 id="popis-tabela" className="text-lg font-extrabold">Podaci popisa</h2>
            <div className="mt-4">
              <PopulationTable records={census} />
            </div>
          </section>
        ) : null}

        <GeographySection geography={settlement.geography} />

        <div className="mt-8">
          <SourcePanel source={settlement.source} />
        </div>

        {municipality ? (
          <nav className="editorial-panel mt-8 p-5 sm:p-6" aria-labelledby="druga-naselja">
            <h2 id="druga-naselja" className="text-lg font-extrabold">Druga naselja u opštini</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Abecedni redoslijed unutar opštine {municipality.name}. Ovo nisu geografski susjedi.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold">
              {settlement.neighbors?.previous ? (
                <Link to={settlement.neighbors.previous.path} className="action-link">
                  ← {settlement.neighbors.previous.name}
                </Link>
              ) : null}
              <Link to={municipality.path} className="action-link">
                Sva naselja u opštini {municipality.name}
              </Link>
              {settlement.neighbors?.next ? (
                <Link to={settlement.neighbors.next.path} className="action-link">
                  {settlement.neighbors.next.name} →
                </Link>
              ) : null}
            </div>
          </nav>
        ) : null}
      </section>
    </SiteLayout>
  );
};

export default AtlasSettlement;

function SettlementAtlasMap({
  settlement,
  municipalitySlug,
}: {
  settlement: { id: number; name: string; geography?: GeoGeography };
  municipalitySlug: string;
}) {
  const hasGeometry = settlement.geography?.area_km2 !== undefined;
  const [selectedId, setSelectedId] = useState<number | null>(hasGeometry ? settlement.id : null);

  return (
    <AtlasMap
      municipalitySlug={municipalitySlug}
      selectedSettlementId={selectedId}
      onSelectedSettlementIdChange={setSelectedId}
      missingBoundaryName={hasGeometry ? null : settlement.name}
      fitSelected={hasGeometry}
    />
  );
}

function GeographySection({ geography }: { geography?: GeoGeography }) {
  if (!geography) return null;
  const terrain = geography.terrain;
  const hasCards = geography.area_km2 !== undefined || terrain !== undefined;
  if (!hasCards) return null;

  const cards: Array<{ label: string; value: string; hint?: string }> = [];
  if (geography.area_km2 !== undefined) {
    cards.push({
      label: "Površina",
      value: formatAreaKm2(geography.area_km2),
      hint: "Izvedeno iz poligona granice naselja",
    });
  }
  if (terrain && terrain.elevation_min_m !== undefined && terrain.elevation_min_m !== null) {
    cards.push({
      label: "Najniža tačka",
      value: formatElevationM(terrain.elevation_min_m),
      hint: "Prema Copernicus DEM modelu terena",
    });
  }
  if (terrain && terrain.elevation_max_m !== undefined && terrain.elevation_max_m !== null) {
    cards.push({
      label: "Najviša tačka",
      value: formatElevationM(terrain.elevation_max_m),
      hint: "Prema Copernicus DEM modelu terena",
    });
  }
  if (terrain && terrain.elevation_mean_m !== undefined && terrain.elevation_mean_m !== null) {
    cards.push({
      label: "Prosječna nadmorska visina prema DEM-u",
      value: formatElevationM(terrain.elevation_mean_m),
      hint: "Raster-izvedeno, nije službena visina naselja",
    });
  }
  if (terrain && terrain.elevation_median_m !== undefined && terrain.elevation_median_m !== null) {
    cards.push({
      label: "Medijalna nadmorska visina",
      value: formatElevationM(terrain.elevation_median_m),
      hint: "Prema Copernicus DEM modelu terena",
    });
  }
  if (terrain && terrain.elevation_range_m !== undefined && terrain.elevation_range_m !== null) {
    cards.push({
      label: "Visinska razlika",
      value: formatElevationM(terrain.elevation_range_m),
      hint: "Maksimum minus minimum unutar granice",
    });
  }
  if (terrain && terrain.slope_mean_deg !== undefined && terrain.slope_mean_deg !== null) {
    cards.push({
      label: "Prosječan nagib",
      value: formatSlopeDeg(terrain.slope_mean_deg),
      hint: "Horn 3×3 na DEM mreži",
    });
  }

  if (cards.length === 0) return null;

  return (
    <section className="mt-8" aria-labelledby="geografija-teren">
      <h2 id="geografija-teren" className="text-lg font-extrabold">Geografija i teren</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {cards.map((card) => (
          <AtlasStatCard key={card.label} label={card.label} value={card.value} hint={card.hint} />
        ))}
      </div>
      {geography.methodology ? (
        <div className="mt-6">
          <SourcePanel
            source={geography.terrain_source ?? geography.boundary_source}
            title="Metodologija geografije i terena"
          />
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{geography.methodology}</p>
        </div>
      ) : null}
    </section>
  );
}
