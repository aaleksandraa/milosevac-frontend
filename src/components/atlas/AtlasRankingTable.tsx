import { Link } from "react-router-dom";
import { formatMetricValue } from "@/lib/atlas-ranking";
import type { AtlasRankingTable } from "@/lib/atlas-ranking-types";

export function AtlasRankingTableView({ rankings }: { rankings: AtlasRankingTable }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] border-collapse text-sm">
        <caption className="sr-only">
          {rankings.metric.label}, {rankings.scope_note}
        </caption>
        <thead>
          <tr className="border-b border-border/70 text-left">
            <th scope="col" className="py-2 pr-3 font-bold">Rang</th>
            <th scope="col" className="py-2 pr-3 font-bold">Naselje</th>
            <th scope="col" className="py-2 pr-3 font-bold">Opština</th>
            <th scope="col" className="py-2 pr-3 font-bold">Vrijednost</th>
            <th scope="col" className="py-2 font-bold">Položaj</th>
          </tr>
        </thead>
        <tbody>
          {rankings.entries.map((entry) => (
            <tr key={entry.settlement.id} className="border-b border-border/50">
              <td className="py-2 pr-3 font-extrabold">{entry.rank}.</td>
              <th scope="row" className="py-2 pr-3 font-bold">
                <Link to={entry.settlement.path} className="hover:text-primary">
                  {entry.settlement.name}
                </Link>
              </th>
              <td className="py-2 pr-3">{entry.settlement.municipality?.name}</td>
              <td className="py-2 pr-3">{formatMetricValue(entry.value, rankings.metric.unit, rankings.metric.precision)}</td>
              <td className="py-2 text-muted-foreground">
                {entry.rank}. od {entry.eligible ?? rankings.eligible}
                {entry.tie_count > 1 ? ` · izjednačeno (${entry.tie_count})` : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
