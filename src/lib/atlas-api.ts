import { apiUrl } from "@/lib/backend";
import type { GeoMunicipality, GeoSettlementDetail, GeoSettlementSummary } from "@/lib/atlas-types";

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
