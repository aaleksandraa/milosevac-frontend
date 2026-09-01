import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GeoMunicipality, GeoSettlementDetail } from "@/lib/atlas-types";
import { atlasMatches, normalizeAtlasQuery } from "@/lib/atlas-search";
import AtlasIndex from "./AtlasIndex";
import AtlasMunicipality from "./AtlasMunicipality";
import AtlasSettlement from "./AtlasSettlement";

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
  census: [{ census_year: 2013, population: 1366, households: 469, source }],
  neighbors: {
    previous: { name: "Kužnjača", slug: "kuznjaca", path: "/mjesta/modrica/kuznjaca" },
    next: { name: "Modriča", slug: "modrica", path: "/mjesta/modrica/modrica" },
  },
  source,
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

const hookState = {
  municipalities: municipalities as GeoMunicipality[],
  municipality: municipalities[0] as GeoMunicipality | undefined,
  settlement: milosevac as GeoSettlementDetail | undefined,
  loading: false,
  error: false,
  notFound: false,
};

vi.mock("@/components/site/SiteLayout", () => ({
  SiteLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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
  });

  it("filters settlements with diacritic-insensitive search", () => {
    render(
      <MemoryRouter>
        <AtlasIndex />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Pretraga naselja i opština"), { target: { value: "Milosevac" } });

    expect(screen.getByRole("link", { name: /Miloševac/ })).toHaveAttribute("href", "/mjesta/modrica/milosevac");
    expect(screen.queryByRole("link", { name: "Šamac" })).not.toBeInTheDocument();
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
    expect(screen.queryByText(/Elevation/)).not.toBeInTheDocument();
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
});
