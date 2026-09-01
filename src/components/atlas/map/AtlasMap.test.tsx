import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AtlasMap } from "@/components/atlas/map/AtlasMap";
import { fetchAtlasMapPlaces, fetchAtlasMapSettlements } from "@/lib/atlas-api";
import { findMapFeature } from "@/lib/atlas-map-style";
import type { AtlasMapCollection } from "@/lib/atlas-map-types";

const mapState = vi.hoisted(() => ({
  collection: {
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
          elevation_min_m: 0,
          elevation_max_m: 119,
          elevation_range_m: 31,
          slope_mean_deg: 2.45,
        },
        geometry: { type: "Polygon", coordinates: [] },
      },
      {
        type: "Feature",
        id: 20,
        properties: {
          settlement_id: 20,
          settlement_name: "Njegoševo",
          settlement_slug: "njegosevo",
          municipality_name: "Šamac",
          municipality_slug: "samac",
          path: "/mjesta/samac/njegosevo",
          population_2013: 0,
          elevation_mean_m: 90,
        },
        geometry: { type: "Polygon", coordinates: [] },
      },
    ],
    meta: {
      coverage_note: "U pilotu Modriča + Šamac granica postoji za 37 od 45 uvezenih naselja.",
      boundary_note: "OSM",
      terrain_note: "Copernicus DEM GLO-30",
    },
  } as AtlasMapCollection,
  loading: false,
  error: false,
  webglFailed: false,
  municipalitySlug: undefined as string | undefined,
}));

vi.mock("@/hooks/useAtlasMapData", () => ({
  useAtlasMapData: (municipalitySlug?: string) => {
    mapState.municipalitySlug = municipalitySlug;
    return {
      collection: mapState.collection,
      loading: mapState.loading,
      error: mapState.error,
      refetch: vi.fn(),
    };
  },
}));

const poiState = vi.hoisted(() => ({
  collection: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        id: 501,
        properties: {
          id: 501,
          type: "pharmacy",
          family: "health",
          family_label: "Zdravstvo",
          type_label: "Apoteka",
          name: "Apoteka Centar",
          display_label: "Apoteka Centar",
          municipality_name: "Modriča",
          municipality_slug: "modrica",
          settlement_name: "Miloševac",
          settlement_slug: "milosevac",
          address: "Ulica 1",
          website: "https://example.test",
          phone: "+387 53 000",
        },
        geometry: { type: "Point", coordinates: [18.4, 44.99] },
      },
      {
        type: "Feature",
        id: 502,
        properties: {
          id: 502,
          type: "football_pitch",
          family: "sport",
          family_label: "Sport i rekreacija",
          type_label: "Fudbalski teren",
          name: null,
          display_label: "Fudbalski teren",
          name_is_generic: true,
          municipality_name: "Modriča",
          municipality_slug: "modrica",
          settlement_name: "Miloševac",
        },
        geometry: { type: "Point", coordinates: [18.41, 44.99] },
      },
    ],
    meta: {
      coverage_note: "Prikazani objekti su trenutno mapirani i uvezeni zapisi iz OpenStreetMap (ODbL).",
    },
  } as import("@/lib/atlas-poi-types").AtlasPoiCollection,
  error: false,
}));

vi.mock("@/hooks/useAtlasPoiData", () => ({
  useAtlasPoiData: () => ({
    collection: poiState.collection,
    loading: false,
    error: poiState.error,
    refetch: vi.fn(),
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

describe("atlas map", () => {
  beforeEach(() => {
    mapState.loading = false;
    mapState.error = false;
    mapState.webglFailed = false;
    poiState.error = false;
  });

  it("renders map container, legend and methodology", () => {
    render(
      <MemoryRouter>
        <AtlasMap selectedSettlementId={10} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("region", { name: "Karta naseljenih mjesta" })).toBeInTheDocument();
    expect(screen.getByLabelText("Prikaz")).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Miloševac" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Detalji o naselju" })).toHaveAttribute("href", "/mjesta/modrica/milosevac");
    expect(screen.getByText(/OpenStreetMap administrativnim poligonima/)).toBeInTheDocument();
    expect(screen.getByText(/Copernicus DEM GLO-30/)).toBeInTheDocument();
    expect(screen.getByText("Prosječna visina prema DEM-u")).toBeInTheDocument();
    expect(screen.getByText("96,4 m")).toBeInTheDocument();
    expect(screen.getByText("0,0 m – 119,0 m")).toBeInTheDocument();
  });

  it("changes legend with thematic mode", () => {
    render(
      <MemoryRouter>
        <AtlasMap />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Prikaz"), { target: { value: "elevation_mean" } });
    expect(screen.getByText("Prosječna nadmorska visina prema DEM-u")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Prikaz"), { target: { value: "population_2013" } });
    expect(screen.getByText("Stanovništvo — Popis 2013")).toBeInTheDocument();
  });

  it("displays population 0 in the selected card", () => {
    render(
      <MemoryRouter>
        <AtlasMap selectedSettlementId={20} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("dialog", { name: "Njegoševo" })).toBeInTheDocument();
    expect(screen.getByText("0 stanovnika")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Detalji o naselju" })).toHaveAttribute("href", "/mjesta/samac/njegosevo");
  });

  it("shows WebGL fallback without crashing", () => {
    mapState.webglFailed = true;
    render(
      <MemoryRouter>
        <AtlasMap />
      </MemoryRouter>,
    );

    expect(screen.getByText("Karta trenutno nije dostupna")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Karta naseljenih mjesta" })).not.toBeInTheDocument();
  });

  it("shows GeoJSON error without hiding the rest of the page chrome", () => {
    mapState.error = true;
    render(
      <MemoryRouter>
        <AtlasMap />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Granice naselja trenutno nisu učitane/)).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Karta naseljenih mjesta" })).toBeInTheDocument();
  });

  it("records municipality scope from the map data hook", () => {
    render(
      <MemoryRouter>
        <AtlasMap municipalitySlug="modrica" />
      </MemoryRouter>,
    );
    expect(mapState.municipalitySlug).toBe("modrica");
  });

  it("identifies features by settlement_id, not slug", () => {
    const twins: AtlasMapCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            settlement_id: 10,
            settlement_name: "Miloševac",
            settlement_slug: "milosevac",
            municipality_name: "Modriča",
            municipality_slug: "modrica",
            path: "/mjesta/modrica/milosevac",
          },
          geometry: { type: "Polygon", coordinates: [] },
        },
        {
          type: "Feature",
          properties: {
            settlement_id: 99,
            settlement_name: "Miloševac",
            settlement_slug: "milosevac",
            municipality_name: "Šamac",
            municipality_slug: "samac",
            path: "/mjesta/samac/milosevac",
          },
          geometry: { type: "Polygon", coordinates: [] },
        },
      ],
    };
    expect(findMapFeature(twins, 99)?.properties.municipality_slug).toBe("samac");
    expect(findMapFeature(twins, 10)?.properties.municipality_slug).toBe("modrica");
  });

  it("renders POI family filters and selected POI card", () => {
    render(
      <MemoryRouter>
        <AtlasMap selectedPoiId={501} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Objekti")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zdravstvo" })).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Apoteka Centar" })).toBeInTheDocument();
    expect(screen.getByText("Apoteka")).toBeInTheDocument();
    expect(screen.getByText("Ulica 1")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Veb stranica" })).toHaveAttribute("href", "https://example.test");
    expect(screen.getByText(/uvezeni zapisi iz OpenStreetMap/)).toBeInTheDocument();
  });

  it("uses a generic type label for unnamed POIs and hides missing optional fields", () => {
    render(
      <MemoryRouter>
        <AtlasMap selectedPoiId={502} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("dialog", { name: "Fudbalski teren" })).toBeInTheDocument();
    expect(screen.getByText(/bez vlastitog imena/)).toBeInTheDocument();
    expect(screen.queryByText("Veb stranica")).not.toBeInTheDocument();
    expect(screen.queryByText("Telefon")).not.toBeInTheDocument();
    expect(screen.queryByText("Adresa")).not.toBeInTheDocument();
  });

  it("keeps the boundary map when the POI API fails", () => {
    poiState.error = true;
    render(
      <MemoryRouter>
        <AtlasMap selectedSettlementId={10} />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Sloj objekata trenutno nije učitan/)).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Karta naseljenih mjesta" })).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Miloševac" })).toBeInTheDocument();
  });
});

describe("atlas map API client", () => {
  it("requests the GeoJSON endpoint with municipality scope", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ type: "FeatureCollection", features: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);
    await fetchAtlasMapSettlements("modrica");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/geo/map/settlements?municipality=modrica",
      expect.objectContaining({ headers: { Accept: "application/json" } }),
    );
    vi.unstubAllGlobals();
  });

  it("requests the POI GeoJSON endpoint with municipality scope", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ type: "FeatureCollection", features: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);
    await fetchAtlasMapPlaces({ municipalitySlug: "modrica", family: "health" });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/geo/map/places?municipality=modrica&family=health",
      expect.objectContaining({ headers: { Accept: "application/json" } }),
    );
    vi.unstubAllGlobals();
  });
});
