import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import type { Map } from "maplibre-gl";
import { NetworkLayers } from "./NetworkLayers";

afterEach(() => vi.unstubAllGlobals());

describe("M11 optional network layers", () => {
  it("does not fetch on initial load and requests municipality-scoped layers on demand", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ type: "FeatureCollection", features: [] }) });
    vi.stubGlobal("fetch", fetcher);
    const map = { getLayer: vi.fn(), getSource: vi.fn(), addSource: vi.fn(), addLayer: vi.fn(), setLayoutProperty: vi.fn() };
    render(<NetworkLayers mapRef={{ current: map as unknown as Map }} ready municipalitySlug="modrica" />);
    expect(fetcher).not.toHaveBeenCalled();
    fireEvent.click(screen.getByLabelText("Vodotoci i vodene površine"));
    await waitFor(() => expect(map.addSource).toHaveBeenCalled());
    expect(fetcher.mock.calls[0][0]).toContain("/geo/map/hydrography?municipality=modrica");
    expect(map.addLayer.mock.calls.some(([layer]) => layer.type === "fill")).toBe(true);
    fireEvent.click(screen.getByLabelText("Glavni putevi"));
    await waitFor(() => expect(fetcher.mock.calls.some(([url]) => url.includes("/geo/map/roads?municipality=modrica"))).toBe(true));
  });
  it("allows selecting the pilot municipality without loading geometry", () => {
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    render(<NetworkLayers mapRef={{ current: null }} ready={false} />);
    fireEvent.change(screen.getByLabelText("Opština za puteve i vode"), { target: { value: "samac" } });
    expect(fetcher).not.toHaveBeenCalled();
  });
});
