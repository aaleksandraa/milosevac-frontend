import { useQuery } from "@tanstack/react-query";
import {
  AtlasNotFoundError,
  fetchAtlasCompare,
  fetchAtlasMetrics,
  fetchAtlasMunicipalities,
  fetchAtlasMunicipality,
  fetchAtlasRankings,
  fetchAtlasSettlement,
} from "@/lib/atlas-api";

const atlasQueryOptions = {
  staleTime: 5 * 60 * 1000,
  retry: (failureCount: number, error: Error) => {
    if (error instanceof AtlasNotFoundError) return false;
    return failureCount < 2;
  },
};

export function useAtlasMunicipalities(enabled = true) {
  const query = useQuery({
    queryKey: ["atlas", "municipalities"],
    queryFn: fetchAtlasMunicipalities,
    enabled,
    ...atlasQueryOptions,
  });

  return {
    municipalities: query.data ?? [],
    loading: enabled && query.isPending,
    error: query.isError,
    notFound: query.error instanceof AtlasNotFoundError,
  };
}

export function useAtlasMunicipality(slug: string | undefined) {
  const enabled = Boolean(slug);
  const query = useQuery({
    queryKey: ["atlas", "municipality", slug ?? ""],
    queryFn: () => fetchAtlasMunicipality(slug as string),
    enabled,
    ...atlasQueryOptions,
  });

  return {
    municipality: query.data,
    loading: enabled && query.isPending,
    error: query.isError,
    notFound: query.error instanceof AtlasNotFoundError,
  };
}

export function useAtlasSettlement(municipalitySlug: string | undefined, settlementSlug: string | undefined) {
  const enabled = Boolean(municipalitySlug && settlementSlug);
  const query = useQuery({
    queryKey: ["atlas", "settlement", municipalitySlug ?? "", settlementSlug ?? ""],
    queryFn: () => fetchAtlasSettlement(municipalitySlug as string, settlementSlug as string),
    enabled,
    ...atlasQueryOptions,
  });

  return {
    settlement: query.data,
    loading: enabled && query.isPending,
    error: query.isError,
    notFound: query.error instanceof AtlasNotFoundError,
  };
}

export function useAtlasMetrics() {
  const query = useQuery({
    queryKey: ["atlas", "metrics"],
    queryFn: fetchAtlasMetrics,
    ...atlasQueryOptions,
  });

  return {
    metrics: query.data?.metrics ?? [],
    loading: query.isPending,
    error: query.isError,
  };
}

export function useAtlasRankings(params: {
  metric?: string;
  scope?: "pilot" | "municipality";
  municipality?: string;
  direction?: "asc" | "desc";
  limit?: string | number;
  enabled?: boolean;
}) {
  const enabled = (params.enabled ?? true) && Boolean(params.metric);
  const query = useQuery({
    queryKey: ["atlas", "rankings", params.metric, params.scope, params.municipality, params.direction, params.limit],
    queryFn: () =>
      fetchAtlasRankings({
        metric: params.metric as string,
        scope: params.scope,
        municipality: params.municipality,
        direction: params.direction,
        limit: params.limit,
      }),
    enabled,
    ...atlasQueryOptions,
  });

  return {
    rankings: query.data,
    loading: enabled && query.isPending,
    error: query.isError,
  };
}

export function useAtlasCompare(
  municipalityA: string | undefined,
  settlementA: string | undefined,
  municipalityB: string | undefined,
  settlementB: string | undefined,
) {
  const enabled = Boolean(municipalityA && settlementA && municipalityB && settlementB);
  const query = useQuery({
    queryKey: ["atlas", "compare", municipalityA, settlementA, municipalityB, settlementB],
    queryFn: () =>
      fetchAtlasCompare(
        municipalityA as string,
        settlementA as string,
        municipalityB as string,
        settlementB as string,
      ),
    enabled,
    ...atlasQueryOptions,
  });

  return {
    comparison: query.data,
    loading: enabled && query.isPending,
    error: query.isError,
    notFound: query.error instanceof AtlasNotFoundError,
  };
}
