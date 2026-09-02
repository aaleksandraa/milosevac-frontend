import { useId } from "react";
import { formatBsNumber } from "@/lib/atlas-format";
import { censusChartPoints } from "@/lib/atlas-population";
import type { GeoCensusRecord } from "@/lib/atlas-types";

export function PopulationChart({ records }: { records: GeoCensusRecord[] }) {
  const points = censusChartPoints(records);
  const titleId = useId();
  if (points.length < 2) return null;

  const years = points.map((row) => row.year);
  const values = points.map((row) => row.population);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const maxPop = Math.max(...values, 1);
  const minPop = 0;
  const width = 640;
  const height = 260;
  const pad = { top: 20, right: 24, bottom: 36, left: 56 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const xAt = (year: number) => pad.left + ((year - minYear) / (maxYear - minYear || 1)) * innerW;
  const yAt = (value: number) => pad.top + innerH - ((value - minPop) / (maxPop - minPop || 1)) * innerH;
  const line = points
    .map((row, index) => `${index === 0 ? "M" : "L"} ${xAt(row.year).toFixed(1)} ${yAt(row.population).toFixed(1)}`)
    .join(" ");

  return (
    <figure className="mt-4">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={titleId} className="h-auto w-full max-w-3xl">
        <title id={titleId}>
          Kretanje broja stanovnika prema popisima {years.join(", ")}
        </title>
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + innerH} stroke="currentColor" strokeOpacity="0.35" />
        <line x1={pad.left} y1={pad.top + innerH} x2={width - pad.right} y2={pad.top + innerH} stroke="currentColor" strokeOpacity="0.35" />
        <path d={line} fill="none" stroke="#9a3b45" strokeWidth="2.4" />
        {points.map((row) => (
          <g key={row.year}>
            <circle cx={xAt(row.year)} cy={yAt(row.population)} r="4" fill="#9a3b45">
              <title>{`${row.year}: ${formatBsNumber(row.population)} stanovnika`}</title>
            </circle>
            <text x={xAt(row.year)} y={height - 12} textAnchor="middle" fontSize="11" fill="currentColor">
              {row.year}
            </text>
          </g>
        ))}
        <text x={4} y={yAt(maxPop) + 4} fontSize="10" fill="currentColor">{formatBsNumber(maxPop)}</text>
        <text x={4} y={pad.top + innerH + 4} fontSize="10" fill="currentColor">0</text>
      </svg>
      <figcaption className="mt-2 text-sm text-muted-foreground">
        Tačke su službeni popisi, ne godišnje procjene. Razmak na osi X prati stvarni razmak godina.
      </figcaption>
    </figure>
  );
}
