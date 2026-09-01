import { useQuery } from "@tanstack/react-query";
import { type Article, type ArticlePlace } from "@/data/content";
import { apiUrl, resolveMediaUrl, resolveSrcSet } from "@/lib/backend";
import { normalizeApiArticle, type ApiArticle } from "@/hooks/usePortalContent";

export type OutageStatus = "upcoming" | "active" | "past";

export type OutagesResponse = {
  places: ArticlePlace[];
  outages: ApiArticle[];
};

type UseOutagesOptions = {
  place?: string;
  status?: OutageStatus;
  enabled?: boolean;
};

async function fetchOutages(place?: string, status?: OutageStatus): Promise<{ places: ArticlePlace[]; outages: Article[] }> {
  const params = new URLSearchParams();
  if (place) params.set("place", place);
  if (status) params.set("status", status);

  const response = await fetch(apiUrl(`/outages?${params}`), {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) throw new Error("Outages API nije dostupan");

  const payload = (await response.json()) as OutagesResponse;

  return {
    places: payload.places ?? [],
    outages: (payload.outages ?? []).map(normalizeApiArticle),
  };
}

export function useOutages(options: UseOutagesOptions = {}) {
  const { place, status, enabled = true } = options;

  const query = useQuery({
    queryKey: ["outages", place ?? "", status ?? ""],
    queryFn: () => fetchOutages(place, status),
    enabled,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });

  return {
    places: query.data?.places ?? [],
    outages: query.data?.outages ?? [],
    loading: enabled && query.isPending,
    error: query.isError,
    refetch: query.refetch,
  };
}

export function formatOutageWindow(startsAt?: string | null, endsAt?: string | null): string {
  if (!startsAt || !endsAt) return "";

  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const time = (date: Date) =>
    `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

  return `${time(start)}–${time(end)}`;
}

export function outageLocationLabel(article: Article): string {
  if (article.locationsRaw) return article.locationsRaw;
  if (article.places?.length) return article.places.map((place) => place.name).join(", ");
  return "";
}

function outageStatusRank(status?: OutageStatus | null): number {
  if (status === "active") return 0;
  if (status === "upcoming") return 1;
  if (status === "past") return 2;
  return 1;
}

function outageStartTimestamp(article: Article): number {
  if (article.noticeStartsAt) return +new Date(article.noticeStartsAt);
  if (article.date) return +new Date(article.date);
  return 0;
}

export function sortOutageArticles(articles: Article[]): Article[] {
  return [...articles].sort((a, b) => {
    const statusDiff = outageStatusRank(a.outageStatus) - outageStatusRank(b.outageStatus);
    if (statusDiff !== 0) return statusDiff;

    const aStart = outageStartTimestamp(a);
    const bStart = outageStartTimestamp(b);

    if (a.outageStatus === "past") {
      return bStart - aStart;
    }

    if (aStart !== bStart) {
      return aStart - bStart;
    }

    const aMilosevac = a.places?.some((place) => place.isPrimary) ? 1 : 0;
    const bMilosevac = b.places?.some((place) => place.isPrimary) ? 1 : 0;
    return bMilosevac - aMilosevac;
  });
}

export function resolveOutageImage(article: Article): string | null {
  return resolveMediaUrl(article.image);
}

export function resolveOutageSrcSet(article: Article): string | null | undefined {
  return resolveSrcSet(article.imageSrcSet);
}
