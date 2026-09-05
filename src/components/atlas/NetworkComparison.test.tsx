import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AtlasCompareTable } from "./AtlasCompareTable";
import { rankingPresetOptions } from "@/lib/atlas-ranking";
import type { AtlasComparePayload, AtlasMetricDefinition } from "@/lib/atlas-ranking-types";
import comparison from "@/test/fixtures/m11-compare.json";
import metrics from "@/test/fixtures/m11-metrics.json";

describe("M11 ranking and comparison integration", () => {
  it("renders actual pilot comparison rows with explicit straight-line distance", () => {
    render(<AtlasCompareTable comparison={comparison as AtlasComparePayload} />);
    expect(screen.getByRole("heading", { name: "Povezanost i vode" })).toBeInTheDocument();
    expect(screen.getByText("Mapirani putevi")).toBeInTheDocument();
    expect(screen.getByText("Pravolinijski do opštinskog centra")).toBeInTheDocument();
  });
  it("offers neutral network rankings including nearest major road", () => {
    const options = rankingPresetOptions(metrics as AtlasMetricDefinition[]);
    expect(options.some(o => o.metric === "distance_to_nearest_major_road_km" && o.direction === "asc")).toBe(true);
    expect(options.some(o => o.label === "Najviše mapiranih puteva")).toBe(true);
  });
});
