import { useQuery } from "@tanstack/react-query";
import { apiUrl } from "@/lib/backend";

export type WeatherIconName = "sun" | "partly" | "cloud" | "rain" | "storm" | "snow";

export type WeatherPayload = {
  configured: boolean;
  source: string;
  location: string;
  updated_at?: string;
  message?: string;
  current: null | {
    temperature: number | null;
    feels_like: number | null;
    humidity: number | null;
    precipitation: number | null;
    pressure: number | null;
    uv_index: number | null;
    wind_speed: number | null;
    wind_direction: string | null;
    weather_text: string;
    icon: WeatherIconName;
  };
  hourly: Array<{
    datetime: string | null;
    time: string | null;
    temperature: number | null;
    real_feel: number | null;
    rain_probability: number | null;
    wind_speed: number | null;
    weather_text: string;
    icon: WeatherIconName;
  }>;
  daily: Array<{
    date: string | null;
    label: string | null;
    min: number | null;
    max: number | null;
    day_text: string;
    rain_probability: number | null;
    wind_speed: number | null;
    sunrise: string | null;
    sunset: string | null;
    icon: WeatherIconName;
  }>;
};

async function fetchWeather(): Promise<WeatherPayload> {
  const response = await fetch(apiUrl("/weather"), { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Vremenska prognoza trenutno nije dostupna.");
  return response.json() as Promise<WeatherPayload>;
}

/**
 * Shared forecast query. The header chip and the weather page mount at the same
 * time, so a single cache entry keeps it to one network request.
 */
export function useWeather() {
  const query = useQuery({
    queryKey: ["weather"],
    queryFn: fetchWeather,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return {
    forecast: query.data ?? null,
    loading: query.isPending,
    error: query.isError ? "Nije moguće učitati prognozu. Pokušajte ponovo malo kasnije." : null,
    refetch: query.refetch,
  };
}
