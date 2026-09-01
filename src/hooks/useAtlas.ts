import { useQuery } from "@tanstack/react-query";
import {
  AtlasNotFoundError,
  fetchAtlasMunicipalities,
  fetchAtlasMunicipality,
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
