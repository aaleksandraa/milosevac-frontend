import { useQuery } from "@tanstack/react-query";
import { fetchAtlasMapPlaces, fetchAtlasSettlementPlaces } from "@/lib/atlas-api";
import type { AtlasPoiCollection } from "@/lib/atlas-poi-types";

export function useAtlasPoiData(municipalitySlug?: string, enabled = true) {
  const query = useQuery({
    queryKey: ["atlas", "map-places", municipalitySlug ?? "all"],
    queryFn: () => fetchAtlasMapPlaces({ municipalitySlug }),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    collection: query.data as AtlasPoiCollection | undefined,
    loading: enabled && query.isPending,
    error: query.isError,
    refetch: query.refetch,
  };
}

export function useAtlasSettlementPlaces(municipalitySlug?: string, settlementSlug?: string) {
  const enabled = Boolean(municipalitySlug && settlementSlug);
  const query = useQuery({
    queryKey: ["atlas", "settlement-places", municipalitySlug ?? "", settlementSlug ?? ""],
    queryFn: () => fetchAtlasSettlementPlaces(municipalitySlug as string, settlementSlug as string),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    groups: query.data?.groups ?? [],
    count: query.data?.meta?.count ?? 0,
    coverageNote: query.data?.meta?.coverage_note,
    loading: enabled && query.isPending,
    error: query.isError,
  };
}
