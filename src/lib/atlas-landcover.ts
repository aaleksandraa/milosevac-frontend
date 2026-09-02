import { formatBsDecimal } from "@/lib/atlas-format";
import type { GeoLandCover } from "@/lib/atlas-types";

export const LAND_COVER_GROUP_COLORS: Record<string, string> = {
  agricultural: "#c4a35a",
  forest: "#2f6b3a",
  shrub_herbaceous_or_seminatural: "#7aa35a",
  open_or_sparse: "#c9b896",
  artificial_surfaces: "#8a3b44",
  wetlands: "#4a7c6a",
  water: "#3b6ea8",
};

export function formatLandCoverPct(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "Nema dostupnog podatka";
  if (value > 0 && value < 0.1) return "<0,1%";
  return `${formatBsDecimal(value, 1)}%`;
}

export function landCoverHasPublicValues(landCover?: GeoLandCover | null): landCover is GeoLandCover {
  return Boolean(landCover && landCover.reference_year && (landCover.summary || landCover.classes?.length));
}

export function landCoverChartSegments(landCover: GeoLandCover): Array<{
  code: string;
  label: string;
  share_pct: number;
  color: string;
}> {
  const groups = landCover.summary?.groups ?? [];
  return groups
    .filter((group) => (group.share_pct ?? 0) > 0)
    .map((group) => ({
      code: group.code,
      label: group.label,
      share_pct: group.share_pct ?? 0,
      color: LAND_COVER_GROUP_COLORS[group.code] ?? "#6b7280",
    }));
}

export function dominantGroupSentence(landCover: GeoLandCover): string | null {
  const group = landCover.summary?.dominant_group;
  if (!group?.label || group.share_pct == null) return null;
  return `Najveći udio analizirane površine čine ${group.label.toLowerCase()} (${formatLandCoverPct(group.share_pct)}).`;
}
