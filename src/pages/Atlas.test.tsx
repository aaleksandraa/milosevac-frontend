import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GeoMunicipality, GeoSettlementDetail } from "@/lib/atlas-types";
import type { AtlasMapCollection } from "@/lib/atlas-map-types";
import { climateChartPoints } from "@/lib/atlas-climate";
import { censusChartPoints, censusDifferenceSentence } from "@/lib/atlas-population";
import { atlasMatches, normalizeAtlasQuery } from "@/lib/atlas-search";
import { comparePath, relativeFactSentence } from "@/lib/atlas-ranking";
import type { AtlasComparePayload, AtlasMetricDefinition, AtlasRankingTable } from "@/lib/atlas-ranking-types";
import AtlasIndex from "./AtlasIndex";
import AtlasMunicipality from "./AtlasMunicipality";
import AtlasSettlement from "./AtlasSettlement";
import AtlasCompare from "./AtlasCompare";
import AtlasRankings from "./AtlasRankings";

const source = {
  name: "Popis stanovništva, domaćinstava i stanova 2013. — naseljena mjesta",
  provider: "Agencija za statistiku BiH / Republički zavod za statistiku Republike Srpske",
  source_class: "A",
  source_class_label: "Službeni izvor",
  dataset_version: "2013",
  retrieval_date: "2026-09-01",
  methodology_note: "Normalizovani izvod tabela naseljenih mjesta. Izvor je prezentacija statistika.ba, a ne direktan BHAS datotečni izvod.",
};

const municipalities: GeoMunicipality[] = [
  {
    id: 1,
    name: "Modriča",
    slug: "modrica",
    admin_type: "municipality",
    admin_type_label: "Opština",
    path: "/mjesta/modrica",
    entity: { id: 2, name: "Republika Srpska", slug: "republika-srpska", kind: "republic" },
    settlement_count: 24,
    population: { year: 2013, total: 25720, households: 8439 },
    source,
    settlements: [
      { id: 10, name: "Miloševac", slug: "milosevac", path: "/mjesta/modrica/milosevac", indexable: true, population: { year: 2013, population: 1366, households: 469 } },
      { id: 11, name: "Garevac", slug: "garevac", path: "/mjesta/modrica/garevac", indexable: true, population: { year: 2013, population: 3221, households: 904 } },
    ],
  },
  {
    id: 2,
    name: "Šamac",
    slug: "samac",
    admin_type: "municipality",
    admin_type_label: "Opština",
    path: "/mjesta/samac",
    entity: { id: 2, name: "Republika Srpska", slug: "republika-srpska", kind: "republic" },
    settlement_count: 21,
    population: { year: 2013, total: 17273, households: 5861 },
    source,
    settlements: [
      { id: 20, name: "Njegoševo", slug: "njegosevo", path: "/mjesta/samac/njegosevo", indexable: true, population: { year: 2013, population: 0, households: 0 } },
      { id: 21, name: "Obudovac", slug: "obudovac", path: "/mjesta/samac/obudovac", indexable: true, population: { year: 2013, population: 2480, households: 820 } },
    ],
  },
];

const historicalSource = {
  name: "Popis stanovništva 1991. — uporedni podaci 1971, 1981. i 1991. (naseljena mjesta)",
  provider: "Federalni zavod za statistiku Federacije Bosne i Hercegovine",
  source_class: "A",
  source_class_label: "Službeni izvor",
  dataset_version: "bilten-265-1998",
  retrieval_date: "2026-09-02",
  methodology_note: "Uporedni podaci Popisa 1971, 1981. i 1991. Historijska opština je izvorni popisni kontekst.",
};

const milosevac: GeoSettlementDetail = {
  id: 10,
  name: "Miloševac",
  slug: "milosevac",
  statistical_code: "213942",
  path: "/mjesta/modrica/milosevac",
  indexable: true,
  municipality: municipalities[0],
  entity: municipalities[0].entity,
  population: { year: 2013, population: 1366, households: 469 },
  census: [
    { census_year: 2013, population: 1366, households: 469, comparability: "comparable", source },
    { census_year: 1991, population: 1735, comparability: "comparable", historical_settlement_name: "Miloševac", historical_municipality_name: "Modriča", source: historicalSource },
    { census_year: 1981, population: 1825, comparability: "comparable", source: historicalSource },
    { census_year: 1971, population: 1880, comparability: "comparable", source: historicalSource },
  ],
  population_changes: [
    { from_year: 1971, to_year: 1981, from_population: 1880, to_population: 1825, absolute_change: -55, percentage_change: -2.9, trend: "decline", comparability: "comparable" },
    { from_year: 1981, to_year: 1991, from_population: 1825, to_population: 1735, absolute_change: -90, percentage_change: -4.9, trend: "decline", comparability: "comparable" },
    { from_year: 1991, to_year: 2013, from_population: 1735, to_population: 1366, absolute_change: -369, percentage_change: -21.3, trend: "decline", comparability: "comparable" },
    { from_year: 1971, to_year: 2013, from_population: 1880, to_population: 1366, absolute_change: -514, percentage_change: -27.3, trend: "decline", comparability: "comparable" },
  ],
  neighbors: {
    previous: { name: "Kužnjača", slug: "kuznjaca", path: "/mjesta/modrica/kuznjaca" },
    next: { name: "Modriča", slug: "modrica", path: "/mjesta/modrica/modrica" },
  },
  relative_facts: [
    {
      metric: "population_2013",
      label: "Stanovništvo prema Popisu 2013.",
      short_label: "Popis 2013.",
      value: 1366,
      unit: "",
      rank: 18,
      eligible: 45,
      percentile_strictly_above: 60,
      percentile_strictly_below: 38,
      direction: "desc",
      scope: "pilot",
      scope_note: "među trenutno obrađenim naseljima (Modriča i Šamac)",
      eligibility_note: "Naselje ima uvezeni zapis Popisa 2013.",
      methodology: "Popis 2013.",
      source_family: "population",
    },
    {
      metric: "area_km2",
      label: "Površina granice naselja",
      short_label: "Površina",
      value: 17.42,
      unit: "km²",
      rank: 12,
      eligible: 37,
      percentile_strictly_above: 67,
      percentile_strictly_below: 32,
      direction: "desc",
      scope: "pilot",
      scope_note: "među trenutno obrađenim naseljima (Modriča i Šamac)",
      eligibility_note: "Naselje ima važeći OSM poligon.",
      methodology: "OSM",
      source_family: "geography",
    },
  ],
  source,
};

const rankingMetrics: AtlasMetricDefinition[] = [
  {
    code: "population_2013",
    label: "Stanovništvo prema Popisu 2013.",
    short_label: "Popis 2013.",
    unit: "",
    source_family: "population",
    category: "population",
    category_label: "Stanovništvo",
    default_direction: "desc",
    allows_both_directions: true,
    rankable: true,
    zero_is_valid: true,
    precision: 0,
    ranking_method: "competition",
    high_semantic_label: "najviše stanovnika",
    low_semantic_label: "najmanje stanovnika",
    percentage_difference_useful: true,
    methodology: "Popis 2013.",
    eligibility: "Uvezeni Popis 2013.",
    high_ranking_label: "Najviše stanovnika",
    low_ranking_label: "Najmanje stanovnika",
  },
  {
    code: "elevation_mean_m",
    label: "Prosječna nadmorska visina",
    short_label: "Prosječna visina",
    unit: "m",
    source_family: "terrain",
    category: "geography",
    category_label: "Geografija i teren",
    default_direction: "desc",
    allows_both_directions: true,
    rankable: true,
    zero_is_valid: true,
    precision: 1,
    ranking_method: "competition",
    high_semantic_label: "najviša",
    low_semantic_label: "najnija",
    percentage_difference_useful: false,
    methodology: "Copernicus DEM GLO-30.",
    eligibility: "Terenski profil.",
    high_ranking_label: "Najviša prosječna nadmorska visina",
    low_ranking_label: "Najniža prosječna nadmorska visina",
  },
  {
    code: "landcover_agricultural_pct",
    label: "Udio poljoprivrednih površina",
    short_label: "Poljoprivreda (CLC)",
    unit: "%",
    source_family: "landcover",
    category: "land_cover",
    category_label: "Pokrov zemljišta",
    default_direction: "desc",
    allows_both_directions: true,
    rankable: true,
    zero_is_valid: true,
    precision: 1,
    ranking_method: "competition",
    high_semantic_label: "najveći udio poljoprivrednih površina",
    low_semantic_label: "najmanji udio poljoprivrednih površina",
    percentage_difference_useful: false,
    percentage_point_difference: true,
    methodology: "CLC 2018 unutar atlas granice.",
    eligibility: "M10 CLC profil.",
    high_ranking_label: "Najveći udio poljoprivrednih površina",
    low_ranking_label: "Najmanji udio poljoprivrednih površina",
  },
];

const rankingTable: AtlasRankingTable = {
  metric: rankingMetrics[0],
  scope: "pilot",
  scope_label: "Trenutno obrađena naselja",
  scope_note: "među trenutno obrađenim naseljima (Modriča i Šamac)",
  direction: "desc",
  ranking_method: "competition",
  eligible: 45,
  missing: 0,
  universe: 45,
  limit: 10,
  entries: [
    {
      rank: 1,
      value: 9419,
      percentile_strictly_above: 0,
      percentile_strictly_below: 98,
      tie_count: 1,
      eligible: 45,
      settlement: { id: 11, name: "Modriča", slug: "modrica", path: "/mjesta/modrica/modrica", municipality: { name: "Modriča", slug: "modrica" } },
    },
    {
      rank: 2,
      value: 1366,
      percentile_strictly_above: 2,
      percentile_strictly_below: 96,
      tie_count: 2,
      eligible: 45,
      settlement: { id: 10, name: "Miloševac", slug: "milosevac", path: "/mjesta/modrica/milosevac", municipality: { name: "Modriča", slug: "modrica" } },
    },
    {
      rank: 2,
      value: 1366,
      percentile_strictly_above: 2,
      percentile_strictly_below: 96,
      tie_count: 2,
      eligible: 45,
      settlement: { id: 21, name: "Obudovac", slug: "obudovac", path: "/mjesta/samac/obudovac", municipality: { name: "Šamac", slug: "samac" } },
    },
  ],
};

const comparison: AtlasComparePayload = {
  a: { id: 10, name: "Miloševac", slug: "milosevac", path: "/mjesta/modrica/milosevac", municipality: { name: "Modriča", slug: "modrica", path: "/mjesta/modrica" } },
  b: { id: 30, name: "Šamac", slug: "samac", path: "/mjesta/samac/samac", municipality: { name: "Šamac", slug: "samac", path: "/mjesta/samac" } },
  sections: [
    {
      code: "population",
      label: "Stanovništvo",
      rows: [
        {
          metric: "population_2013",
          label: "Stanovništvo prema Popisu 2013.",
          short_label: "Popis 2013.",
          unit: "",
          a: { value: 1366 },
          b: { value: 5133 },
          difference: { absolute: -3767, percentage: -73.4 },
          comparable: true,
          source_family: "population",
          methodology: "Popis 2013.",
        },
        {
          metric: "population_change_1991_2013_pct",
          label: "Promjena broja stanovnika 1991–2013. (%)",
          short_label: "Promjena 1991–2013.",
          unit: "%",
          a: { value: -21.3 },
          b: { value: -17.7 },
          difference: { absolute: -3.6, percentage: null },
          comparable: true,
          caveat: "Istorijski podaci su povezani sa današnjim naseljem, ali administrativne ili statističke granice kroz vrijeme nisu nužno potpuno iste.",
          source_family: "population",
          methodology: "Popis.",
        },
      ],
    },
    {
      code: "climate",
      label: "Klima",
      rows: [
        {
          metric: "temperature_mean_annual_c",
          label: "Prosječna godišnja temperatura",
          short_label: "Prosječna temperatura",
          unit: "°C",
          a: { value: 11.6 },
          b: { value: null, unavailable_reason: "Nema dostupnog podatka" },
          comparable: false,
          source_family: "climate",
          methodology: "ERA5-Land.",
        },
      ],
    },
    {
      code: "land_cover",
      label: "Pokrov zemljišta",
      rows: [
        {
          metric: "landcover_agricultural_pct",
          label: "Udio poljoprivrednih površina",
          short_label: "Poljoprivreda (CLC)",
          unit: "%",
          a: { value: 60 },
          b: { value: 40 },
          difference: { absolute: 20, percentage: null, percentage_points: 20 },
          comparable: true,
          source_family: "landcover",
          methodology: "CLC 2018.",
        },
      ],
    },
  ],
};

const milosevacWithTerrain: GeoSettlementDetail = {
  ...milosevac,
  geography: {
    area_km2: 17.42,
    geographic_centroid: { lat: 44.9938, lng: 18.4062 },
    terrain: {
      elevation_min_m: 0,
      elevation_max_m: 92.5,
      elevation_mean_m: 86.1,
      elevation_median_m: 85.4,
      elevation_range_m: 92.5,
      slope_mean_deg: 1.8,
      dem_source: "Copernicus DEM GLO-30 Public",
      dem_resolution_m: 30,
      quality_flag: "ok",
    },
    terrain_source: {
      name: "Copernicus DEM GLO-30 Public",
      provider: "European Space Agency / European Commission",
      source_class: "B",
      source_class_label: "Javni naučni ili institucionalni skup",
      dataset_version: "2021_1",
      methodology_note: "Nadmorske visine su raster-izvedene iz Copernicus DEM GLO-30.",
    },
    methodology: "Nadmorske visine i nagib izračunati su iz Copernicus DEM GLO-30 (raster, ~30 m).",
  },
};

const climateMonthly = [
  { month: 1, temperature_mean_c: 0, temperature_mean_min_c: -4.1, temperature_mean_max_c: 4.2, precipitation_mean_mm: 0 },
  { month: 2, temperature_mean_c: 2.1, temperature_mean_min_c: -2.8, temperature_mean_max_c: 7.0, precipitation_mean_mm: 42 },
  { month: 3, temperature_mean_c: 6.4, temperature_mean_min_c: 1.2, temperature_mean_max_c: 11.8, precipitation_mean_mm: 55 },
  { month: 4, temperature_mean_c: 11.2, temperature_mean_min_c: 5.4, temperature_mean_max_c: 17.0, precipitation_mean_mm: 62 },
  { month: 5, temperature_mean_c: 16.1, temperature_mean_min_c: 10.0, temperature_mean_max_c: 22.2, precipitation_mean_mm: 78 },
  { month: 6, temperature_mean_c: 19.8, temperature_mean_min_c: 13.6, temperature_mean_max_c: 26.0, precipitation_mean_mm: 92 },
  { month: 7, temperature_mean_c: 21.4, temperature_mean_min_c: 15.0, temperature_mean_max_c: 28.1, precipitation_mean_mm: 71 },
  { month: 8, temperature_mean_c: 21.0, temperature_mean_min_c: 14.7, temperature_mean_max_c: 27.8, precipitation_mean_mm: 68 },
  { month: 9, temperature_mean_c: 16.4, temperature_mean_min_c: 10.5, temperature_mean_max_c: 22.6, precipitation_mean_mm: 64 },
  { month: 10, temperature_mean_c: 11.0, temperature_mean_min_c: 5.8, temperature_mean_max_c: 16.6, precipitation_mean_mm: 61 },
  { month: 11, temperature_mean_c: 6.2, temperature_mean_min_c: 1.8, temperature_mean_max_c: 10.9, precipitation_mean_mm: 70 },
  { month: 12, temperature_mean_c: 1.4, temperature_mean_min_c: -2.6, temperature_mean_max_c: 5.4, precipitation_mean_mm: 57 },
];

const milosevacWithClimate: GeoSettlementDetail = {
  ...milosevacWithTerrain,
  climate: {
    normal_period: "1991–2020",
    historical_period_start: "1950-01-01",
    historical_period_end: "2025-12-31",
    annual: {
      temperature_mean_c: 11.6,
      precipitation_mm: 780,
      coldest_month: 1,
      warmest_month: 7,
      temperature_mean_change_c: 0.7,
    },
    monthly: climateMonthly,
    indices: [
      { code: "hot_days_30c", value: 18.2, threshold: 30, definition: "dnevni Tmax ≥ 30 °C" },
      { code: "frost_days", value: 72.4, threshold: 0, definition: "dnevni Tmin < 0 °C" },
      { code: "precipitation_days_1mm", value: 110, threshold: 1, definition: "dnevne padavine ≥ 1 mm" },
    ],
    extremes: [
      {
        metric_code: "daily_tmax_max",
        value: 39.4,
        unit: "°C",
        occurred_on: "2007-07-24",
        period_start: "1950-01-01",
        period_end: "2025-12-31",
        wording: "Najviša dnevna maksimalna temperatura u analiziranom ERA5-Land nizu",
        kind: "gridded_reanalysis_extreme",
      },
    ],
    methodology: {
      text: "Vrijednosti su izvedene iz ERA5-Land reanalize (Copernicus C3S / ECMWF) za područje naselja.",
      timezone: "Europe/Sarajevo",
      temperature_dataset: "ERA5-Land",
      precipitation_dataset: "ERA5",
      quality_flag: "coarse_spatial_resolution",
    },
    source: {
      name: "Copernicus Climate Change Service — ERA5-Land",
      provider: "Copernicus Climate Change Service / ECMWF",
      source_class: "B",
      source_class_label: "Javni naučni ili institucionalni skup",
      methodology_note: "Klimatološki podaci su ERA5-Land reanaliza za područje naselja.",
    },
  },
};

const milosevacWithLandCover: GeoSettlementDetail = {
  ...milosevacWithClimate,
  land_cover: {
    reference_year: 2018,
    summary: {
      agricultural_pct: 70,
      forest_pct: 20,
      artificial_pct: 4,
      water_pct: 0,
      seminatural_pct: 0.05,
      dominant_group: { code: "agricultural", label: "Poljoprivredne površine", share_pct: 70 },
      groups: [
        { code: "agricultural", label: "Poljoprivredne površine", share_pct: 70 },
        { code: "forest", label: "Šumske površine", share_pct: 20 },
        { code: "artificial_surfaces", label: "Umjetne površine", share_pct: 4 },
        { code: "shrub_herbaceous_or_seminatural", label: "Žbunasta, zeljasta ili poluprirodna vegetacija", share_pct: 0.05 },
        { code: "water", label: "Vode", share_pct: 0 },
      ],
    },
    classes: [
      { code: "211", label: "Neirigirane oranice", atlas_group: "agricultural", atlas_group_label: "Poljoprivredne površine", area_km2: 7, share_pct: 70 },
      { code: "311", label: "Širokolisna šuma", atlas_group: "forest", atlas_group_label: "Šumske površine", area_km2: 2, share_pct: 20 },
    ],
    forest: {
      tree_cover_mean_pct: 18.4,
      tree_cover_wording: "Pokrivenost krošnjama / gustoća drvenastog pokrova prema Copernicus HRL Tree Cover Density 2018.",
    },
    imperviousness: {
      imperviousness_mean_pct: 2.1,
      wording: "Prosječna gustoća nepropusnosti prema Copernicus HRL Imperviousness Density 2018.",
    },
    methodology: {
      text: "Pokrov zemljišta izračunat je unutar trenutno dostupne atlas granice naselja.",
      temporal_note: "prema podacima za referentnu 2018. godinu",
    },
    source: {
      name: "Copernicus CORINE Land Cover 2018",
      provider: "European Environment Agency / Copernicus Land Monitoring Service",
      source_class: "B",
      source_class_label: "Javni naučni ili institucionalni skup",
      dataset_version: "v2020_20u1",
    },
  },
};

const njegosevo: GeoSettlementDetail = {
  id: 20,
  name: "Njegoševo",
  slug: "njegosevo",
  path: "/mjesta/samac/njegosevo",
  indexable: true,
  municipality: municipalities[1],
  entity: municipalities[1].entity,
  population: { year: 2013, population: 0, households: 0 },
  census: [{ census_year: 2013, population: 0, households: 0, source }],
  source,
};

const mapCollection: AtlasMapCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: 10,
      properties: {
        settlement_id: 10,
        settlement_name: "Miloševac",
        settlement_slug: "milosevac",
        municipality_name: "Modriča",
        municipality_slug: "modrica",
        path: "/mjesta/modrica/milosevac",
        area_km2: 17.42,
        population_2013: 1366,
        elevation_mean_m: 96.4,
        elevation_min_m: 88,
        elevation_max_m: 119,
        slope_mean_deg: 2.45,
        temperature_mean_annual_c: 11.6,
        precipitation_annual_mm: 780,
      },
      geometry: { type: "Polygon", coordinates: [] },
    },
  ],
  meta: {
    coverage_note: "U pilotu Modriča + Šamac granica postoji za 37 od 45 uvezenih naselja.",
    boundary_note: "Granice prikazane na karti zasnovane su na dostupnim OpenStreetMap administrativnim poligonima.",
    terrain_note: "Visinski podaci izvedeni su iz Copernicus DEM GLO-30 modela terena.",
  },
};

const mapState = vi.hoisted(() => ({
  collection: undefined as AtlasMapCollection | undefined,
  loading: false,
  error: false,
  webglFailed: false,
}));

const hookState = {
  municipalities: municipalities as GeoMunicipality[],
  municipality: municipalities[0] as GeoMunicipality | undefined,
  settlement: milosevac as GeoSettlementDetail | undefined,
  loading: false,
  error: false,
  notFound: false,
  placeGroups: [] as Array<{ family: string; family_label: string; places: Array<{
    id: number;
    display_label: string;
    name?: string | null;
    name_is_generic?: boolean;
    type_label?: string;
    address?: string | null;
    operator?: string | null;
    website?: string | null;
    phone?: string | null;
  }> }>,
  metrics: rankingMetrics,
  rankings: rankingTable as AtlasRankingTable | undefined,
  comparison: comparison as AtlasComparePayload | undefined,
};

vi.mock("@/components/site/SiteLayout", () => ({
  SiteLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/hooks/useAtlasMapData", () => ({
  useAtlasMapData: () => ({
    collection: mapState.collection,
    loading: mapState.loading,
    error: mapState.error,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/hooks/useAtlasPoiData", () => ({
  useAtlasPoiData: () => ({
    collection: { type: "FeatureCollection", features: [] },
    loading: false,
    error: false,
    refetch: vi.fn(),
  }),
  useAtlasSettlementPlaces: () => ({
    groups: hookState.placeGroups ?? [],
    count: (hookState.placeGroups ?? []).reduce((sum, group) => sum + group.places.length, 0),
    coverageNote: hookState.placeGroups?.length
      ? "U trenutno dostupnim podacima evidentirani su uvezeni OSM objekti."
      : undefined,
    loading: false,
    error: false,
  }),
}));

vi.mock("@/hooks/useMapLibre", () => ({
  useMapLibre: () => ({
    containerRef: { current: null },
    mapRef: { current: null },
    ready: false,
    webglFailed: mapState.webglFailed,
    basemapFailed: false,
  }),
}));

vi.mock("@/hooks/useAtlas", () => ({
  useAtlasMunicipalities: () => ({
    municipalities: hookState.municipalities,
    loading: hookState.loading,
    error: hookState.error,
    notFound: hookState.notFound,
  }),
  useAtlasMunicipality: () => ({
    municipality: hookState.municipality,
    loading: hookState.loading,
    error: hookState.error,
    notFound: hookState.notFound,
  }),
  useAtlasSettlement: () => ({
    settlement: hookState.settlement,
    loading: hookState.loading,
    error: hookState.error,
    notFound: hookState.notFound,
  }),
  useAtlasMetrics: () => ({ metrics: hookState.metrics, loading: false, error: false }),
  useAtlasRankings: () => ({
    rankings: hookState.rankings,
    loading: false,
    error: false,
  }),
  useAtlasCompare: () => ({
    comparison: hookState.comparison,
    loading: hookState.loading,
    error: hookState.error,
    notFound: hookState.notFound,
  }),
}));

describe("atlas search", () => {
  it("matches Bosnian diacritics in queries", () => {
    expect(normalizeAtlasQuery("Miloševac")).toBe("milosevac");
    expect(atlasMatches("Miloševac", "Milosevac")).toBe(true);
    expect(atlasMatches("Šamac", "Samac")).toBe(true);
    expect(atlasMatches("Modriča", "modrica")).toBe(true);
  });
});

describe("atlas pages", () => {
  beforeEach(() => {
    hookState.municipalities = municipalities;
    hookState.municipality = municipalities[0];
    hookState.settlement = milosevac;
    hookState.loading = false;
    hookState.error = false;
    hookState.notFound = false;
    hookState.placeGroups = [];
    hookState.metrics = rankingMetrics;
    hookState.rankings = rankingTable;
    hookState.comparison = comparison;
    mapState.collection = mapCollection;
    mapState.loading = false;
    mapState.error = false;
    mapState.webglFailed = false;
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders pilot municipalities on /mjesta", () => {
    render(
      <MemoryRouter>
        <AtlasIndex />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Naseljena mjesta Bosne i Hercegovine" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Modriča" })).toHaveAttribute("href", "/mjesta/modrica");
    expect(screen.getByRole("link", { name: "Šamac" })).toHaveAttribute("href", "/mjesta/samac");
    expect(screen.getByText(/u fazi proširenja/)).toBeInTheDocument();
    expect(screen.getByText(/statistika.ba/)).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Karta naseljenih mjesta" })).toBeInTheDocument();
    expect(screen.getByText(/OpenStreetMap administrativnim poligonima/)).toBeInTheDocument();
  });

  it("filters settlements with diacritic-insensitive search", () => {
    render(
      <MemoryRouter>
        <AtlasIndex />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Pretraga naselja, opština i objekata"), { target: { value: "Milosevac" } });

    expect(screen.getAllByRole("link", { name: /Miloševac/ })[0]).toHaveAttribute("href", "/mjesta/modrica/milosevac");
    expect(screen.queryByRole("link", { name: "Šamac" })).not.toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Miloševac" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Detalji o naselju" })).toHaveAttribute("href", "/mjesta/modrica/milosevac");
  });

  it("renders municipality settlements and source panel", () => {
    render(
      <MemoryRouter initialEntries={["/mjesta/modrica"]}>
        <Routes>
          <Route path="/mjesta/:municipalitySlug" element={<AtlasMunicipality />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Modriča" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Miloševac" })).toHaveAttribute("href", "/mjesta/modrica/milosevac");
    expect(screen.getByText("1.366 stanovnika prema Popisu 2013.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Izvor i metodologija" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Karta naseljenih mjesta" })).toBeInTheDocument();
    expect(screen.getByLabelText("Prikaz")).toBeInTheDocument();
  });

  it("renders settlement 2013 population and municipality-qualified links", () => {
    render(
      <MemoryRouter initialEntries={["/mjesta/modrica/milosevac"]}>
        <Routes>
          <Route path="/mjesta/:municipalitySlug/:settlementSlug" element={<AtlasSettlement />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Miloševac" })).toBeInTheDocument();
    expect(screen.getAllByText("1.366 stanovnika prema Popisu 2013.").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Izvor i metodologija" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sva naselja u opštini Modriča" })).toHaveAttribute("href", "/mjesta/modrica");
    expect(screen.getByRole("link", { name: "Modriča →" })).toHaveAttribute("href", "/mjesta/modrica/modrica");
    expect(screen.queryByRole("heading", { name: "Geografija i teren" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Nadmorska visina$/)).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Objekti i sadržaji" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Klima" })).not.toBeInTheDocument();
  });

  it("renders historical census series, chart years, change copy and source years", () => {
    render(
      <MemoryRouter initialEntries={["/mjesta/modrica/milosevac"]}>
        <Routes>
          <Route path="/mjesta/:municipalitySlug/:settlementSlug" element={<AtlasSettlement />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Kretanje broja stanovnika" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Kretanje broja stanovnika prema popisima 1971, 1981, 1991, 2013/ })).toBeInTheDocument();
    expect(censusChartPoints(milosevac.census ?? []).map((row) => row.year)).toEqual([1971, 1981, 1991, 2013]);
    expect(screen.getAllByText("1.880").length).toBeGreaterThan(0);
    expect(screen.getAllByText("1.825").length).toBeGreaterThan(0);
    expect(screen.getAllByText("1.735").length).toBeGreaterThan(0);
    expect(screen.getAllByText("-21,3%").length).toBeGreaterThan(0);
    expect(screen.getByText(censusDifferenceSentence(1991, 1735, 2013, 1366))).toBeInTheDocument();
    expect(screen.getByText(/U odnosu na Popis 1991, Popis 2013 bilježi 369 stanovnika manje/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Izvor popisa 1991." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Izvor i metodologija" })).toBeInTheDocument();
  });

  it("omits missing census years and keeps sourced zero", () => {
    hookState.settlement = {
      ...njegosevo,
      census: [{ census_year: 2013, population: 0, households: 0, comparability: "comparable", source }],
    };

    render(
      <MemoryRouter initialEntries={["/mjesta/samac/njegosevo"]}>
        <Routes>
          <Route path="/mjesta/:municipalitySlug/:settlementSlug" element={<AtlasSettlement />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getAllByText("0 stanovnika prema Popisu 2013.").length).toBeGreaterThan(0);
    expect(screen.queryByRole("rowheader", { name: "1971" })).not.toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /Kretanje broja stanovnika/ })).not.toBeInTheDocument();
  });

  it("shows comparability caveat when the series is comparable with caveat", () => {
    hookState.settlement = {
      ...milosevac,
      census: [
        { census_year: 2013, population: 1366, households: 469, comparability: "comparable", source },
        {
          census_year: 1991,
          population: 147,
          comparability: "comparable_with_caveat",
          reconciliation_note: "Isti identitet, ali granice nisu nužno iste.",
          source: historicalSource,
        },
      ],
      population_changes: [
        {
          from_year: 1991,
          to_year: 2013,
          from_population: 147,
          to_population: 1366,
          absolute_change: 1219,
          percentage_change: 829.3,
          trend: "growth",
          comparability: "comparable_with_caveat",
        },
      ],
    };

    render(
      <MemoryRouter initialEntries={["/mjesta/modrica/milosevac"]}>
        <Routes>
          <Route path="/mjesta/:municipalitySlug/:settlementSlug" element={<AtlasSettlement />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("note")).toHaveTextContent(/administrativne ili statističke granice/);
  });

  it("renders terrain section when geography data exists, including elevation 0", () => {
    hookState.settlement = milosevacWithTerrain;

    render(
      <MemoryRouter initialEntries={["/mjesta/modrica/milosevac"]}>
        <Routes>
          <Route path="/mjesta/:municipalitySlug/:settlementSlug" element={<AtlasSettlement />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Geografija i teren" })).toBeInTheDocument();
    expect(screen.getByText("Prosječna nadmorska visina prema DEM-u")).toBeInTheDocument();
    expect(screen.getByText("0,0 m")).toBeInTheDocument();
    expect(screen.getAllByText("17,42 km²").length).toBeGreaterThan(0);
    expect(screen.getByText("Metodologija geografije i terena")).toBeInTheDocument();
    expect(screen.getAllByText(/Copernicus DEM/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("1.366 stanovnika prema Popisu 2013.").length).toBeGreaterThan(0);
  });

  it("renders climate section with zeros, period, table, chart and reanalysis wording", () => {
    hookState.settlement = milosevacWithClimate;

    render(
      <MemoryRouter initialEntries={["/mjesta/modrica/milosevac"]}>
        <Routes>
          <Route path="/mjesta/:municipalitySlug/:settlementSlug" element={<AtlasSettlement />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Klima" })).toBeInTheDocument();
    expect(screen.getAllByText(/1991–2020/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("0,0 °C").length).toBeGreaterThan(0);
    expect(screen.getAllByText("0,0 mm").length).toBeGreaterThan(0);
    expect(screen.getAllByText("11,6 °C").length).toBeGreaterThan(0);
    expect(screen.getAllByText("780,0 mm").length).toBeGreaterThan(0);
    expect(screen.getByRole("table", { name: /Mjesečne klimatske normale/ })).toBeInTheDocument();
    expect(screen.getAllByText("januar").length).toBeGreaterThan(0);
    expect(screen.getByRole("img", { name: /Mjesečni klimatski dijagram/ })).toBeInTheDocument();
    expect(climateChartPoints(milosevacWithClimate.climate!)).toHaveLength(12);
    expect(screen.getByText(/Ekstremi u analiziranom ERA5-Land nizu/)).toBeInTheDocument();
    expect(screen.getByText(/Najviša dnevna maksimalna temperatura u analiziranom ERA5-Land nizu/)).toBeInTheDocument();
    expect(screen.queryByText(/Apsolutni rekord/)).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Metodologija klime" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Geografija i teren" })).toBeInTheDocument();
    expect(screen.getAllByText("1.366 stanovnika prema Popisu 2013.").length).toBeGreaterThan(0);
  });

  it("hides climate when the API omits the block", () => {
    hookState.settlement = milosevacWithTerrain;

    render(
      <MemoryRouter initialEntries={["/mjesta/modrica/milosevac"]}>
        <Routes>
          <Route path="/mjesta/:municipalitySlug/:settlementSlug" element={<AtlasSettlement />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Geografija i teren" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Klima" })).not.toBeInTheDocument();
  });

  it("renders land-cover section with chart, table, year and tiny-share formatting", () => {
    hookState.settlement = milosevacWithLandCover;

    render(
      <MemoryRouter initialEntries={["/mjesta/modrica/milosevac"]}>
        <Routes>
          <Route path="/mjesta/:municipalitySlug/:settlementSlug" element={<AtlasSettlement />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Pokrov i korištenje zemljišta" })).toBeInTheDocument();
    expect(screen.getAllByText(/referentnu 2018/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/trenutno dostupne atlas granice/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("70,0%").length).toBeGreaterThan(0);
    expect(screen.getAllByText("0,0%").length).toBeGreaterThan(0);
    expect(screen.getByText("<0,1%")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Sastav pokrova zemljišta/ })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: /Glavne grupe pokrova zemljišta/ })).toBeInTheDocument();
    expect(screen.getByText(/Pokrivenost krošnjama \/ gustoća drvenastog pokrova/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Prikaži detaljne CLC razrede/ }));
    expect(screen.getByText("Neirigirane oranice")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Klima" })).toBeInTheDocument();
    expect(screen.queryByText(/danas je/i)).not.toBeInTheDocument();
  });

  it("hides land-cover when the API omits the block", () => {
    hookState.settlement = milosevacWithClimate;

    render(
      <MemoryRouter initialEntries={["/mjesta/modrica/milosevac"]}>
        <Routes>
          <Route path="/mjesta/:municipalitySlug/:settlementSlug" element={<AtlasSettlement />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Klima" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Pokrov i korištenje zemljišta" })).not.toBeInTheDocument();
  });

  it("renders Njegoševo population 0 as sourced data", () => {
    hookState.settlement = njegosevo;

    render(
      <MemoryRouter initialEntries={["/mjesta/samac/njegosevo"]}>
        <Routes>
          <Route path="/mjesta/:municipalitySlug/:settlementSlug" element={<AtlasSettlement />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getAllByText("0 stanovnika prema Popisu 2013.").length).toBeGreaterThan(0);
    expect(screen.queryByText("Za ovo naselje još nema uvezenih podataka o stanovništvu.")).not.toBeInTheDocument();
    expect(screen.getByText(/Granica trenutno nije dostupna na karti za Njegoševo/)).toBeInTheDocument();
  });

  it("shows loading and error states", () => {
    hookState.loading = true;
    const loading = render(
      <MemoryRouter>
        <AtlasIndex />
      </MemoryRouter>,
    );
    expect(screen.getByText("Učitavam atlas mjesta...")).toBeInTheDocument();
    loading.unmount();

    hookState.loading = false;
    hookState.error = true;
    hookState.municipalities = [];
    render(
      <MemoryRouter>
        <AtlasIndex />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Atlas trenutno nije moguće učitati/)).toBeInTheDocument();
  });

  it("groups settlement POIs and hides empty families", () => {
    hookState.placeGroups = [
      {
        family: "education",
        family_label: "Obrazovanje",
        places: [
          { id: 1, display_label: "Osnovna škola Test", name: "Osnovna škola Test", type_label: "Osnovna škola" },
        ],
      },
      {
        family: "sport",
        family_label: "Sport i rekreacija",
        places: [
          { id: 2, display_label: "Fudbalski teren", name: null, name_is_generic: true, type_label: "Fudbalski teren" },
        ],
      },
      { family: "health", family_label: "Zdravstvo", places: [] },
    ];

    render(
      <MemoryRouter initialEntries={["/mjesta/modrica/milosevac"]}>
        <Routes>
          <Route path="/mjesta/:municipalitySlug/:settlementSlug" element={<AtlasSettlement />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Objekti i sadržaji" })).toBeInTheDocument();
    expect(screen.getByText("Osnovna škola Test")).toBeInTheDocument();
    expect(screen.getByText("Fudbalski teren")).toBeInTheDocument();
    expect(screen.getByText(/U trenutno dostupnim podacima/)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Zdravstvo" })).not.toBeInTheDocument();
  });

  it("shows settlement relative facts and compare launcher", () => {
    render(
      <MemoryRouter initialEntries={["/mjesta/modrica/milosevac"]}>
        <Routes>
          <Route path="/mjesta/:municipalitySlug/:settlementSlug" element={<AtlasSettlement />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Položaj među obrađenim naseljima" })).toBeInTheDocument();
    expect(screen.getByText(relativeFactSentence(milosevac.relative_facts![0]))).toBeInTheDocument();
    expect(screen.getByText(/12\. od 37 naselja/)).toBeInTheDocument();
    expect(screen.getByText(/nisu rangovi Bosne i Hercegovine/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Poređenje sa drugim naseljima" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Uporedi" })).toBeInTheDocument();
  });

  it("renders municipality-qualified compare headers, swap, missing climate and caveat", () => {
    render(
      <MemoryRouter initialEntries={["/uporedi/modrica/milosevac/samac/samac"]}>
        <Routes>
          <Route path="/uporedi/:municipalityA/:settlementA/:municipalityB/:settlementB" element={<AtlasCompare />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Miloševac" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Šamac" })).toBeInTheDocument();
    expect(screen.getAllByText("Modriča").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Zamijeni" })).toBeInTheDocument();
    expect(screen.getByText("Nema dostupnog podatka")).toBeInTheDocument();
    expect(screen.queryByText(/^0$/)).not.toBeInTheDocument();
    expect(screen.getByText(/granice kroz vrijeme nisu nužno potpuno iste/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pokrov zemljišta" })).toBeInTheDocument();
    expect(screen.getByText("20,0 pp")).toBeInTheDocument();
    expect(comparePath("modrica", "milosevac", "samac", "samac")).toBe("/uporedi/modrica/milosevac/samac/samac");
  });

  it("renders rankings with ties, eligible denominator and pilot wording", () => {
    render(
      <MemoryRouter initialEntries={["/rang-liste"]}>
        <AtlasRankings />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Rang-liste naselja" })).toBeInTheDocument();
    expect(screen.getAllByText(/trenutno obrađenim naseljima/).length).toBeGreaterThan(0);
    expect(screen.getByText(/nisu rang-liste Bosne i Hercegovine/)).toBeInTheDocument();
    expect(screen.getByText("1.")).toBeInTheDocument();
    expect(screen.getAllByText("2.").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/2\. od 45/).length).toBe(2);
    expect(screen.getAllByText(/izjednačeno/).length).toBe(2);
    expect(screen.getByLabelText("Pokazatelj")).toBeInTheDocument();
    expect(screen.getByText("Najveći udio poljoprivrednih površina")).toBeInTheDocument();
    expect(screen.getByLabelText("Obuhvat")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Obuhvat"), { target: { value: "municipality" } });
    expect(screen.getByLabelText("Opština")).toBeInTheDocument();
  });
});
