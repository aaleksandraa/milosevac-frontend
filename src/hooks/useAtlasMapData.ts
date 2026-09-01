import { useQuery } from "@tanstack/react-query";
import { fetchAtlasMapSettlements } from "@/lib/atlas-api";
import type { AtlasMapCollection } from "@/lib/atlas-map-types";

export function useAtlasMapData(municipalitySlug?: string, enabled = true) {
  const query = useQuery({
    queryKey: ["atlas", "map", municipalitySlug ?? "all"],
    queryFn: () => fetchAtlasMapSettlements(municipalitySlug),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    collection: query.data as AtlasMapCollection | undefined,
    loading: enabled && query.isPending,
    error: query.isError,
    refetch: query.refetch,
  };
}
