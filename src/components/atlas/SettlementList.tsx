import { Link } from "react-router-dom";
import type { GeoSettlementSummary } from "@/lib/atlas-types";
import { formatBsNumber, formatCensusPopulation } from "@/lib/atlas-format";

export function SettlementList({
  settlements,
  municipalitySlug,
}: {
  settlements: GeoSettlementSummary[];
  municipalitySlug: string;
}) {
  if (settlements.length === 0) {
    return <p className="py-8 text-center text-muted-foreground">Nema naselja koja odgovaraju pretrazi.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[32rem] text-left text-sm">
        <caption className="sr-only">Naselja u opštini</caption>
        <thead>
          <tr className="border-b border-border/70 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <th scope="col" className="py-2 pr-4 font-bold">Naselje</th>
            <th scope="col" className="py-2 pr-4 font-bold">Stanovnici 2013.</th>
            <th scope="col" className="py-2 font-bold">Domaćinstva 2013.</th>
          </tr>
        </thead>
        <tbody>
          {settlements.map((settlement) => {
            const href = settlement.path || `/mjesta/${municipalitySlug}/${settlement.slug}`;
            return (
              <tr key={settlement.id} className="border-b border-border/50">
                <th scope="row" className="py-3 pr-4 font-extrabold">
                  <Link to={href} className="hover:text-primary">
                    {settlement.name}
                  </Link>
                </th>
                <td className="py-3 pr-4">
                  {settlement.population
                    ? formatCensusPopulation(settlement.population.population, settlement.population.year)
                    : "—"}
                </td>
                <td className="py-3 text-muted-foreground">
                  {settlement.population?.households === null || settlement.population?.households === undefined
                    ? "—"
                    : formatBsNumber(settlement.population.households)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
