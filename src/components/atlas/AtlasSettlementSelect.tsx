import { useMemo, useState } from "react";
import { atlasMatches } from "@/lib/atlas-search";
import { settlementOptionsFromMunicipalities, type SettlementOption } from "@/lib/atlas-ranking";
import type { GeoMunicipality } from "@/lib/atlas-types";

export type { SettlementOption };

export function AtlasSettlementSelect({
  id,
  label,
  municipalities,
  value,
  onChange,
}: {
  id: string;
  label: string;
  municipalities: GeoMunicipality[];
  value: SettlementOption | null;
  onChange: (option: SettlementOption) => void;
}) {
  const [query, setQuery] = useState("");
  const options = useMemo(() => settlementOptionsFromMunicipalities(municipalities), [municipalities]);
  const filtered = useMemo(() => {
    return options.filter((option) =>
      atlasMatches(`${option.settlementName} ${option.municipalityName}`, query),
    );
  }, [options, query]);

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-bold">
        {label}
      </label>
      <input
        id={`${id}-search`}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Pretraga, npr. Milosevac"
        className="mb-2 h-10 w-full rounded-md border border-border/70 bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-controls={id}
      />
      <select
        id={id}
        value={value ? `${value.municipalitySlug}/${value.settlementSlug}` : ""}
        onChange={(event) => {
          const option = options.find((row) => `${row.municipalitySlug}/${row.settlementSlug}` === event.target.value);
          if (option) onChange(option);
        }}
        className="h-11 w-full rounded-md border border-border/70 bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="">Izaberite naselje</option>
        {(query.trim() === "" ? options : filtered).map((option) => (
          <option key={`${option.municipalitySlug}/${option.settlementSlug}`} value={`${option.municipalitySlug}/${option.settlementSlug}`}>
            {option.settlementName} · {option.municipalityName}
          </option>
        ))}
      </select>
    </div>
  );
}
