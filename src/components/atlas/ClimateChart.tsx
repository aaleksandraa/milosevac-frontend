import { useId, useState } from "react";
import { formatPrecipitationMm, formatTemperatureC } from "@/lib/atlas-format";
import { climateChartPoints } from "@/lib/atlas-climate";
import type { GeoClimate } from "@/lib/atlas-types";

export function ClimateChart({ climate }: { climate: GeoClimate }) {
  const points = climateChartPoints(climate);
  const temps = points.map((row) => row.temperature).filter((value): value is number => value != null);
  const precips = points.map((row) => row.precipitation).filter((value): value is number => value != null);
  const [active, setActive] = useState<number | null>(null);
  const titleId = useId();

  if (points.length !== 12 || temps.length === 0 || precips.length === 0) {
    return null;
  }

  const tempMin = Math.min(0, ...temps);
  const tempMax = Math.max(0, ...temps);
  const precipMax = Math.max(20, ...precips);
  const width = 640;
  const height = 280;
  const pad = { top: 24, right: 48, bottom: 36, left: 48 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const barW = innerW / 12 * 0.58;
  const xAt = (index: number) => pad.left + (index + 0.5) * (innerW / 12);
  const yTemp = (value: number) => pad.top + innerH - ((value - tempMin) / (tempMax - tempMin || 1)) * innerH;
  const yPrecip = (value: number) => pad.top + innerH - (value / precipMax) * innerH;
  const line = points
    .map((row, index) => `${index === 0 ? "M" : "L"} ${xAt(index).toFixed(1)} ${yTemp(row.temperature ?? 0).toFixed(1)}`)
    .join(" ");
  const tooltip = active != null ? points[active] : null;

  return (
    <figure className="mt-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-labelledby={titleId}
        className="h-auto w-full max-w-3xl"
        onMouseLeave={() => setActive(null)}
      >
        <title id={titleId}>
          Mjesečni klimatski dijagram: temperatura u °C i padavine u mm, period {climate.normal_period}
        </title>
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + innerH} stroke="currentColor" strokeOpacity="0.35" />
        <line x1={width - pad.right} y1={pad.top} x2={width - pad.right} y2={pad.top + innerH} stroke="currentColor" strokeOpacity="0.35" />
        <line x1={pad.left} y1={pad.top + innerH} x2={width - pad.right} y2={pad.top + innerH} stroke="currentColor" strokeOpacity="0.35" />
        {yTemp(0) >= pad.top && yTemp(0) <= pad.top + innerH ? (
          <line x1={pad.left} y1={yTemp(0)} x2={width - pad.right} y2={yTemp(0)} stroke="currentColor" strokeOpacity="0.2" strokeDasharray="4 4" />
        ) : null}
        {points.map((row, index) => {
          const barH = pad.top + innerH - yPrecip(row.precipitation ?? 0);
          return (
            <rect
              key={`p-${row.month}`}
              x={xAt(index) - barW / 2}
              y={yPrecip(row.precipitation ?? 0)}
              width={barW}
              height={Math.max(barH, 0)}
              fill="#4c78a8"
              fillOpacity={active === index ? 0.95 : 0.72}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
            >
              <title>{`${row.label}: ${formatPrecipitationMm(row.precipitation ?? 0)}, ${formatTemperatureC(row.temperature ?? 0)}`}</title>
            </rect>
          );
        })}
        <path d={line} fill="none" stroke="#b42318" strokeWidth="2.4" />
        {points.map((row, index) => (
          <circle
            key={`t-${row.month}`}
            cx={xAt(index)}
            cy={yTemp(row.temperature ?? 0)}
            r={active === index ? 4.5 : 3.2}
            fill="#b42318"
            onMouseEnter={() => setActive(index)}
          />
        ))}
        {points.map((row, index) => (
          <text key={`l-${row.month}`} x={xAt(index)} y={height - 12} textAnchor="middle" fontSize="11" fill="currentColor">
            {row.short}
          </text>
        ))}
        <text x={pad.left} y={16} fontSize="11" fill="#b42318">°C</text>
        <text x={width - pad.right} y={16} textAnchor="end" fontSize="11" fill="#4c78a8">mm</text>
        <text x={4} y={yTemp(tempMax) + 4} fontSize="10" fill="currentColor">{formatAxisNumber(tempMax)}</text>
        <text x={4} y={yTemp(tempMin) + 4} fontSize="10" fill="currentColor">{formatAxisNumber(tempMin)}</text>
        <text x={width - 4} y={yPrecip(precipMax) + 4} textAnchor="end" fontSize="10" fill="currentColor">{formatAxisNumber(precipMax)}</text>
        <text x={width - 4} y={pad.top + innerH + 4} textAnchor="end" fontSize="10" fill="currentColor">0</text>
      </svg>
      <figcaption className="mt-2 text-sm text-muted-foreground">
        Stubovi: mjesečne padavine (mm, ERA5). Linija: srednja mjesečna temperatura (°C, ERA5-Land). Period {climate.normal_period}.
      </figcaption>
      <p className="sr-only" aria-live="polite">
        {tooltip
          ? `${tooltip.label}: ${formatTemperatureC(tooltip.temperature ?? 0)}, ${formatPrecipitationMm(tooltip.precipitation ?? 0)}`
          : "Prelazak preko mjeseca prikazuje tačne vrijednosti."}
      </p>
    </figure>
  );
}

function formatAxisNumber(value: number): string {
  return value.toLocaleString("bs-BA", { maximumFractionDigits: 0 });
}
