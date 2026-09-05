import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { NetworkSection } from "./NetworkSection";
import { formatDistance, type TransportProfile, type ProximityResult } from "@/lib/atlas-network";

const source = { name: "OSM", attribution: "© OpenStreetMap contributors", license: "ODbL-1.0", url: "https://www.openstreetmap.org/copyright", osm_timestamp: "2026-05-06T00:00:00Z" };
const transport: TransportProfile = { mapped_road_length_km: 12.34, major_road_length_km: 0, mapped_road_density_km_per_km2: 1.25, road_length_by_group_km: {}, source, methodology: "OSM" };
const target: ProximityResult = { label: "Najbliža apoteka", target_name: null, distance_straight_m: 0, distance_route_m: null, travel_time_s: null, method: "WGS84_geodesic", origin_type: "geographic_centroid", source };

describe("M11 settlement presentation", () => {
  it("hides absent sections", () => { const { container } = render(<NetworkSection />); expect(container).toBeEmptyDOMElement(); });
  it("shows mapped lengths, valid zero, ODbL and source date", () => {
    render(<NetworkSection transport={transport} />);
    expect(screen.getByText("Putevi i povezanost")).toBeInTheDocument();
    expect(screen.getByText("12,3 km")).toBeInTheDocument();
    expect(screen.getByText("0 km")).toBeInTheDocument();
    expect(screen.getByText(/ODbL/)).toBeInTheDocument();
  });
  it("shows unnamed target with a generic label and straight-line zero", () => {
    render(<NetworkSection proximity={{ nearest_pharmacy: target }} />);
    expect(screen.getByText("Najbliža apoteka")).toBeInTheDocument();
    expect(screen.getByText("pravolinijski")).toBeInTheDocument();
    expect(screen.getByText(/geografski centroid/)).toBeInTheDocument();
    expect(screen.getByText(/0 m/)).toBeInTheDocument();
  });
  it("distinguishes boundary contact and hydrography from land cover", () => {
    render(<NetworkSection hydrography={{ waterway_length_km: 1, mapped_water_area_km2: 0, named_features: [{ name: "Bosna", osm_type: "way", osm_id: 1, feature_type: "river", relation: "touches_boundary" }], source, methodology: "OSM" }} />);
    expect(screen.getByText("Rijeke i vode")).toBeInTheDocument();
    expect(screen.getByText("Bosna")).toBeInTheDocument();
    expect(screen.getByText(/dodiruje granicu/)).toBeInTheDocument();
    expect(screen.getByText(/odvojeno od M10/)).toBeInTheDocument();
  });
  it("formats sensible metres and kilometres", () => {
    expect(formatDistance(340.1)).toBe("340 m"); expect(formatDistance(3238.741)).toBe("3,2 km"); expect(formatDistance(27001)).toBe("27 km");
  });
});
