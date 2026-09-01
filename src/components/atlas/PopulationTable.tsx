import type { GeoCensusRecord } from "@/lib/atlas-types";
import { formatBsNumber } from "@/lib/atlas-format";

export function PopulationTable({ records }: { records: GeoCensusRecord[] }) {
  if (records.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[28rem] text-left text-sm">
        <caption className="sr-only">Podaci popisa stanovništva</caption>
        <thead>
          <tr className="border-b border-border/70 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <th scope="col" className="py-2 pr-4 font-bold">Godina</th>
            <th scope="col" className="py-2 pr-4 font-bold">Stanovnici</th>
            <th scope="col" className="py-2 pr-4 font-bold">Domaćinstva</th>
            <th scope="col" className="py-2 font-bold">Izvor</th>
          </tr>
        </thead>
        <tbody>
          {records.map((row) => (
            <tr key={`${row.census_year}-${row.source?.name ?? "izvor"}`} className="border-b border-border/50">
              <th scope="row" className="py-3 pr-4 font-extrabold">{row.census_year}</th>
              <td className="py-3 pr-4">{formatBsNumber(row.population)}</td>
              <td className="py-3 pr-4">{row.households === null || row.households === undefined ? "—" : formatBsNumber(row.households)}</td>
              <td className="py-3 text-muted-foreground">{row.source?.name ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
