import { useQuery } from "@tanstack/react-query";
import { apiUrl } from "@/lib/backend";
import { fkPosavinaGalleryMatches, type FkPosavinaGalleryMatch } from "@/data/content";

type FkPosavinaPayload = {
  matches?: FkPosavinaGalleryMatch[];
  galleryMatches?: FkPosavinaGalleryMatch[];
};

async function fetchFkPosavina(): Promise<FkPosavinaPayload> {
  const response = await fetch(apiUrl("/fk-posavina"), { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("FK Posavina API nije dostupan");
  return response.json() as Promise<FkPosavinaPayload>;
}

/**
 * Club results shared by the FK Posavina page and the homepage block, so both
 * always show the same match and only one request is made.
 */
export function useFkPosavina() {
  const query = useQuery({
    queryKey: ["fk-posavina"],
    queryFn: fetchFkPosavina,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const apiMatches = query.data?.matches ?? [];
  const matches = apiMatches.length > 0 ? apiMatches : fkPosavinaGalleryMatches;

  return {
    matches,
    latestMatch: matches[0] ?? fkPosavinaGalleryMatches[0],
    isLive: apiMatches.length > 0,
    loading: query.isPending,
  };
}
