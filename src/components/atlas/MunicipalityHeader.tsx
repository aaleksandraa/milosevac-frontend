import type { GeoMunicipality } from "@/lib/atlas-types";

export function MunicipalityHeader({ municipality, kicker }: { municipality: GeoMunicipality; kicker?: string }) {
  const context = [municipality.admin_type_label, municipality.entity?.name, municipality.canton?.name]
    .filter(Boolean)
    .join(" · ");

  return (
    <header className="border-b border-border/70 pb-5">
      {kicker ? (
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">{kicker}</p>
      ) : null}
      <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">{municipality.name}</h1>
      {context ? <p className="mt-2 text-sm text-muted-foreground sm:text-base">{context}</p> : null}
    </header>
  );
}
