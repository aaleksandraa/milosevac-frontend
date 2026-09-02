import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { AtlasBreadcrumbs } from "@/components/atlas/AtlasBreadcrumbs";
import { AtlasStatCard } from "@/components/atlas/AtlasStatCard";
import { PopulationSection } from "@/components/atlas/PopulationSection";
import { ClimateSection } from "@/components/atlas/ClimateSection";
import { SourcePanel } from "@/components/atlas/SourcePanel";
import { AtlasMap } from "@/components/atlas/map/AtlasMap";
import { AtlasRelativeFacts } from "@/components/atlas/AtlasRelativeFacts";
import { AtlasSettlementSelect } from "@/components/atlas/AtlasSettlementSelect";
import { useAtlasMunicipalities, useAtlasSettlement } from "@/hooks/useAtlas";
import { useAtlasSettlementPlaces } from "@/hooks/useAtlasPoiData";
import type { GeoGeography } from "@/lib/atlas-types";
import type { AtlasPoiGroup } from "@/lib/atlas-poi-types";
import { poiDisplayLabel } from "@/lib/atlas-poi-types";
import { formatAreaKm2, formatCensusHouseholds, formatCensusPopulation, formatElevationM, formatSlopeDeg } from "@/lib/atlas-format";
import { comparePath, settlementOptionsFromMunicipalities } from "@/lib/atlas-ranking";

const AtlasSettlement = () => {
  const { municipalitySlug, settlementSlug } = useParams();
  const { settlement, loading, error, notFound } = useAtlasSettlement(municipalitySlug, settlementSlug);
  const { municipalities } = useAtlasMunicipalities();

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
  const changes = settlement.population_changes ?? [];
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

        <PopulationSection
          latest={settlement.population}
          census={census}
          changes={changes}
        />

        <GeographySection geography={settlement.geography} />

        <ClimateSection climate={settlement.climate} />

        {settlement.relative_facts && settlement.relative_facts.length > 0 ? (
          <AtlasRelativeFacts facts={settlement.relative_facts} />
        ) : null}

        {municipality && municipalitySlug && settlementSlug ? (
          <SettlementCompareLauncher
            municipalities={municipalities}
            municipalitySlug={municipalitySlug}
            settlementSlug={settlementSlug}
            settlementName={settlement.name}
          />
        ) : null}

        {municipality ? (
          <SettlementPlacesSection municipalitySlug={municipality.slug} settlementSlug={settlement.slug} />
        ) : null}

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
            headingId="geografija-metodologija"
          />
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{geography.methodology}</p>
        </div>
      ) : null}
    </section>
  );
}

function SettlementPlacesSection({
  municipalitySlug,
  settlementSlug,
}: {
  municipalitySlug: string;
  settlementSlug: string;
}) {
  const { groups, count, coverageNote, loading } = useAtlasSettlementPlaces(municipalitySlug, settlementSlug);
  const visibleGroups = groups.filter((group) => group.places.length > 0);
  if (loading || visibleGroups.length === 0) return null;

  return (
    <section className="mt-8" aria-labelledby="objekti-sadrzaji">
      <h2 id="objekti-sadrzaji" className="text-lg font-extrabold">Objekti i sadržaji</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {coverageNote ??
          `U trenutno dostupnim podacima evidentirano je ${count} ${count === 1 ? "objekat" : "objekata"}. To nije službeni niti iscrpan inventar.`}
      </p>
      <div className="mt-4 grid gap-4">
        {visibleGroups.map((group) => (
          <PoiFamilyGroup key={group.family} group={group} />
        ))}
      </div>
    </section>
  );
}

function PoiFamilyGroup({ group }: { group: AtlasPoiGroup }) {
  return (
    <div className="editorial-panel p-5 sm:p-6">
      <h3 className="text-base font-extrabold">{group.family_label}</h3>
      <ul className="mt-3 space-y-2 text-sm">
        {group.places.map((place) => {
          const details = [place.name_is_generic ? null : place.type_label, place.address, place.operator].filter(Boolean);
          return (
            <li key={place.id}>
              <p className="font-bold">{poiDisplayLabel(place)}</p>
              {details.length > 0 ? <p className="text-muted-foreground">{details.join(" · ")}</p> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SettlementCompareLauncher({
  municipalities,
  municipalitySlug,
  settlementSlug,
  settlementName,
}: {
  municipalities: ReturnType<typeof useAtlasMunicipalities>["municipalities"];
  municipalitySlug: string;
  settlementSlug: string;
  settlementName: string;
}) {
  const navigate = useNavigate();
  const options = useMemo(
    () =>
      settlementOptionsFromMunicipalities(municipalities).filter(
        (option) => !(option.municipalitySlug === municipalitySlug && option.settlementSlug === settlementSlug),
      ),
    [municipalities, municipalitySlug, settlementSlug],
  );
  const defaultOption = useMemo(
    () => options.find((option) => option.settlementSlug === "modrica") ?? options[0] ?? null,
    [options],
  );
  const [selected, setSelected] = useState(defaultOption);

  useEffect(() => {
    setSelected(defaultOption);
  }, [defaultOption]);

  if (!selected) return null;

  return (
    <section className="editorial-panel mt-8 p-5 sm:p-6" aria-labelledby="poredi-naselja">
      <h2 id="poredi-naselja" className="text-lg font-extrabold">Poređenje sa drugim naseljima</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Izaberite naselje za usporedbu s {settlementName}. Adresa ostaje opštinski kvalifikovana.
      </p>
      <div className="mt-4 max-w-md">
        <AtlasSettlementSelect
          id="settlement-compare-other"
          label="Drugo naselje"
          municipalities={municipalities}
          value={selected}
          onChange={setSelected}
        />
      </div>
      <button
        type="button"
        className="action-link mt-4"
        onClick={() => navigate(comparePath(municipalitySlug, settlementSlug, selected.municipalitySlug, selected.settlementSlug))}
      >
        Uporedi
      </button>
    </section>
  );
}
