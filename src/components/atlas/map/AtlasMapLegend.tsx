import { formatAreaKm2, formatBsNumber, formatElevationM, formatPrecipitationMm, formatSlopeDeg, formatTemperatureC } from "@/lib/atlas-format";
import { legendStops, modeConfig } from "@/lib/atlas-map-style";
import type { AtlasMapFeature, AtlasThematicMode } from "@/lib/atlas-map-types";

export function AtlasMapLegend({
  mode,
  features,
}: {
  mode: AtlasThematicMode;
  features: AtlasMapFeature[];
}) {
  const config = modeConfig(mode);
  const stops = legendStops(mode, features);

  return (
    <aside className="atlas-map-legend" aria-label="Legenda karte">
      <p className="text-xs font-extrabold leading-snug">{config.legendTitle}</p>
      {mode === "boundaries" ? (
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          OSM administrativni poligoni. Nisu katastarske granice.
        </p>
      ) : stops.length === 0 ? (
        <p className="mt-1 text-[11px] text-muted-foreground">Nema vrijednosti za ovaj prikaz.</p>
      ) : (
        <div className="mt-2">
          <div className="flex h-2 overflow-hidden rounded-sm" aria-hidden="true">
            {stops.map((stop) => (
              <span key={stop.color} className="flex-1" style={{ background: stop.color }} />
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
            <span>{formatLegendValue(stops[0].value, config.unit)}</span>
            <span>{formatLegendValue(stops[stops.length - 1].value, config.unit)}</span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Skala je izvedena iz trenutno učitanih poligona (linearna interpolacija). Jedinica: {config.unit || "broj stanovnika"}.
            {config.legendNote ? ` ${config.legendNote}` : ""}
          </p>
        </div>
      )}
      <p className="mt-2 text-[11px] text-muted-foreground">Sivo: nema vrijednosti za izabrani sloj.</p>
    </aside>
  );
}

function formatLegendValue(value: number, unit: string): string {
  if (!Number.isFinite(value)) return "";
  if (unit === "m") return formatElevationM(value);
  if (unit === "°") return formatSlopeDeg(value);
  if (unit === "°C") return formatTemperatureC(value);
  if (unit === "mm") return formatPrecipitationMm(value);
  return formatBsNumber(Math.round(value));
}
