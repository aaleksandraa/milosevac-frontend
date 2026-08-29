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

export function outageSortPriority(article: Article): number {
  const isMilosevac = article.places?.some((place) => place.isPrimary) ?? false;
  const status = article.outageStatus;

  if (isMilosevac && status === "active") return 4;
  if (isMilosevac && status === "upcoming") return 3;
  if (status === "active") return 2;
  if (status === "upcoming") return 1;
  return 0;
}

export function sortOutageArticles(articles: Article[]): Article[] {
  return [...articles].sort((a, b) => {
    const priorityDiff = outageSortPriority(b) - outageSortPriority(a);
    if (priorityDiff !== 0) return priorityDiff;

    const aStart = a.noticeStartsAt ? +new Date(a.noticeStartsAt) : 0;
    const bStart = b.noticeStartsAt ? +new Date(b.noticeStartsAt) : 0;
    return aStart - bStart;
  });
}

export function resolveOutageImage(article: Article): string | null {
  return resolveMediaUrl(article.image);
}

export function resolveOutageSrcSet(article: Article): string | null | undefined {
  return resolveSrcSet(article.imageSrcSet);
}
