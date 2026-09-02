import { apiUrl } from "@/lib/backend";
import type { GeoMunicipality, GeoSettlementDetail, GeoSettlementSummary } from "@/lib/atlas-types";
import type { AtlasMapCollection } from "@/lib/atlas-map-types";
import type { AtlasPoiCollection, AtlasPoiGroup, AtlasPoiListItem } from "@/lib/atlas-poi-types";
import type { AtlasComparePayload, AtlasMetricDefinition, AtlasRankingTable, RankingDirectionCode, RankingScopeCode } from "@/lib/atlas-ranking-types";

export class AtlasNotFoundError extends Error {
  constructor(message = "Tražena atlas stranica nije pronađena.") {
    super(message);
    this.name = "AtlasNotFoundError";
  }
}

async function atlasFetch<T>(path: string): Promise<T> {
  const response = await fetch(apiUrl(path), {
    headers: { Accept: "application/json" },
  });

  if (response.status === 404) {
    throw new AtlasNotFoundError();
  }
  if (!response.ok) {
    throw new Error("Atlas API trenutno nije dostupan.");
  }

  return response.json() as Promise<T>;
}

export async function fetchAtlasMunicipalities(): Promise<GeoMunicipality[]> {
  const payload = await atlasFetch<{ municipalities: GeoMunicipality[] }>("/geo/municipalities");
  return payload.municipalities ?? [];
}

export async function fetchAtlasMunicipality(slug: string): Promise<GeoMunicipality> {
  const payload = await atlasFetch<{ municipality: GeoMunicipality }>(`/geo/municipalities/${slug}`);
  return payload.municipality;
}

export async function fetchAtlasSettlements(municipalitySlug: string): Promise<{
  municipality: GeoMunicipality;
  settlements: GeoSettlementSummary[];
}> {
  return atlasFetch(`/geo/municipalities/${municipalitySlug}/settlements`);
}

export async function fetchAtlasSettlement(municipalitySlug: string, settlementSlug: string): Promise<GeoSettlementDetail> {
  const payload = await atlasFetch<{ settlement: GeoSettlementDetail }>(
    `/geo/municipalities/${municipalitySlug}/settlements/${settlementSlug}`,
  );
  return payload.settlement;
}

export async function fetchAtlasMapSettlements(municipalitySlug?: string): Promise<AtlasMapCollection> {
  const query = municipalitySlug ? `?municipality=${encodeURIComponent(municipalitySlug)}` : "";
  return atlasFetch(`/geo/map/settlements${query}`);
}

export async function fetchAtlasMapPlaces(options?: {
  municipalitySlug?: string;
  settlementSlug?: string;
  family?: string;
  type?: string;
}): Promise<AtlasPoiCollection> {
  const params = new URLSearchParams();
  if (options?.municipalitySlug) params.set("municipality", options.municipalitySlug);
  if (options?.settlementSlug) params.set("settlement", options.settlementSlug);
  if (options?.family) params.set("family", options.family);
  if (options?.type) params.set("type", options.type);
  const query = params.toString() ? `?${params.toString()}` : "";
  return atlasFetch(`/geo/map/places${query}`);
}

export async function fetchAtlasSettlementPlaces(
  municipalitySlug: string,
  settlementSlug: string,
): Promise<{ groups: AtlasPoiGroup[]; places?: AtlasPoiListItem[]; meta?: { count: number; coverage_note?: string } }> {
  return atlasFetch(`/geo/municipalities/${municipalitySlug}/settlements/${settlementSlug}/places`);
}

export async function fetchAtlasMetrics(): Promise<{ metrics: AtlasMetricDefinition[] }> {
  return atlasFetch("/geo/metrics");
}

export async function fetchAtlasRankings(params: {
  metric: string;
  scope?: RankingScopeCode;
  municipality?: string;
  direction?: RankingDirectionCode;
  limit?: string | number;
}): Promise<AtlasRankingTable> {
  const search = new URLSearchParams();
  search.set("metric", params.metric);
  if (params.scope) search.set("scope", params.scope);
  if (params.municipality) search.set("municipality", params.municipality);
  if (params.direction) search.set("direction", params.direction);
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  return atlasFetch(`/geo/rankings?${search.toString()}`);
}

export async function fetchAtlasCompare(
  municipalityA: string,
  settlementA: string,
  municipalityB: string,
  settlementB: string,
): Promise<AtlasComparePayload> {
  return atlasFetch(`/geo/compare/${municipalityA}/${settlementA}/${municipalityB}/${settlementB}`);
}
