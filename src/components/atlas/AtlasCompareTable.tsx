import { Link } from "react-router-dom";
import { compareBarWidths, formatMetricValue } from "@/lib/atlas-ranking";
import type { AtlasComparePayload, AtlasCompareRow } from "@/lib/atlas-ranking-types";

export function AtlasCompareTable({ comparison }: { comparison: AtlasComparePayload }) {
  return (
    <div className="space-y-8">
      {comparison.sections.map((section) => {
        const sharedCaveat = sectionCaveat(section.rows);
        return (
        <section key={section.code} aria-labelledby={`compare-${section.code}`}>
          <h2 id={`compare-${section.code}`} className="text-lg font-extrabold">
            {section.label}
          </h2>
          {sharedCaveat ? <p className="mt-1 text-sm text-muted-foreground">{sharedCaveat}</p> : null}
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-sm">
              <caption className="sr-only">{section.label}</caption>
              <thead>
                <tr className="border-b border-border/70 text-left">
                  <th scope="col" className="py-2 pr-3 font-bold">Metrik</th>
                  <th scope="col" className="py-2 pr-3 font-bold">{comparison.a.name}</th>
                  <th scope="col" className="py-2 pr-3 font-bold">{comparison.b.name}</th>
                  <th scope="col" className="py-2 font-bold">Razlika</th>
                </tr>
              </thead>
              <tbody>
                {section.rows.map((row) => (
                  <CompareRow key={row.metric} row={row} showCaveat={!sharedCaveat} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
        );
      })}
    </div>
  );
}

function sectionCaveat(rows: AtlasCompareRow[]): string | null {
  const first = rows[0]?.caveat;
  return rows.length > 1 && first && rows.every((row) => row.caveat === first) ? first : null;
}

function CompareRow({ row, showCaveat }: { row: AtlasCompareRow; showCaveat: boolean }) {
  const bars = compareBarWidths(row);
  return (
    <tr className="border-b border-border/50 align-top">
      <th scope="row" className="py-3 pr-3 font-bold">
        {row.label}
        {showCaveat && row.caveat ? <p className="mt-1 font-normal text-muted-foreground">{row.caveat}</p> : null}
      </th>
      <td className="py-3 pr-3">
        <CompareValue value={row.a.value} unit={row.unit} reason={row.a.unavailable_reason} width={bars?.a} />
      </td>
      <td className="py-3 pr-3">
        <CompareValue value={row.b.value} unit={row.unit} reason={row.b.unavailable_reason} width={bars?.b} />
      </td>
      <td className="py-3">
        {row.difference && row.comparable ? (
          <p>
            {row.difference.percentage_points != null
              ? `${formatMetricValue(row.difference.percentage_points, "pp")}`
              : formatMetricValue(row.difference.absolute, row.unit, 1)}
            {row.difference.percentage !== null ? ` (${formatMetricValue(row.difference.percentage, "%")})` : ""}
          </p>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
    </tr>
  );
}

function CompareValue({
  value,
  unit,
  reason,
  width,
}: {
  value: number | null;
  unit: string;
  reason?: string | null;
  width?: number;
}) {
  if (value === null) {
    return <span className="text-muted-foreground">{reason || "Nema dostupnog podatka"}</span>;
  }

  return (
    <div>
      <p className="font-bold">{formatMetricValue(value, unit)}</p>
      {width !== undefined ? (
        <div className="mt-1 h-2 w-full rounded-full bg-muted" aria-hidden="true">
          <div className="h-2 rounded-full bg-primary/70" style={{ width: `${width}%` }} />
        </div>
      ) : null}
    </div>
  );
}

export function AtlasCompareHeader({ comparison }: { comparison: AtlasComparePayload }) {
  return (
    <header className="grid gap-4 border-b border-border/70 pb-5 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Naselje A</p>
        <h1 className="text-3xl font-extrabold leading-tight">{comparison.a.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          <Link to={comparison.a.municipality?.path ?? `/mjesta/${comparison.a.municipality?.slug}`} className="hover:text-primary">
            {comparison.a.municipality?.name}
          </Link>
        </p>
      </div>
      <p className="hidden text-center text-sm font-extrabold uppercase tracking-wider text-muted-foreground sm:block">naspram</p>
      <div className="sm:text-right">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Naselje B</p>
        <h2 className="text-3xl font-extrabold leading-tight">{comparison.b.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          <Link to={comparison.b.municipality?.path ?? `/mjesta/${comparison.b.municipality?.slug}`} className="hover:text-primary">
            {comparison.b.municipality?.name}
          </Link>
        </p>
      </div>
    </header>
  );
}
