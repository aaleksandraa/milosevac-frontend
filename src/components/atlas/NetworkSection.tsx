import { formatDistance, formatNetworkKm, type TransportProfile, type HydroProfile, type ProximityResult, type NetworkSource } from "@/lib/atlas-network";

const relationLabels: Record<string, string> = { inside: "nalazi se unutar naselja", crosses: "prolazi kroz naselje", touches_boundary: "dodiruje granicu naselja" };
const waterLabels: Record<string, string> = { river: "rijeka", stream: "potok", canal: "kanal", drain: "odvodni kanal", ditch: "jarak", riverbank: "riječna površina", lake: "jezero", reservoir: "akumulacija", pond: "bara", basin: "bazen", other_water: "vodena površina" };

export function NetworkSection({ transport, hydrography, proximity }: { transport?: TransportProfile; hydrography?: HydroProfile; proximity?: Record<string, ProximityResult> }) {
  const targets = Object.entries(proximity ?? {});
  const hasHydro = hydrography && (hydrography.waterway_length_km > 0 || hydrography.mapped_water_area_km2 > 0 || hydrography.named_features.length > 0);
  if (!transport && !hasHydro && targets.length === 0) return null;
  return <div className="space-y-8">
    {transport || targets.length > 0 ? <section aria-labelledby="transport-title" className="rounded-lg border border-border/70 p-4 sm:p-6">
      <h2 id="transport-title" className="text-xl font-extrabold">Putevi i povezanost</h2>
      {transport ? <>
        <p className="mt-3">U trenutno dostupnim OSM podacima evidentirano je približno <strong>{formatNetworkKm(transport.mapped_road_length_km)}</strong> puteva unutar atlas granice naselja.</p>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          <div><dt className="text-sm text-muted-foreground">Mapirani glavni putevi</dt><dd className="font-bold">{formatNetworkKm(transport.major_road_length_km)}</dd></div>
          {transport.mapped_road_density_km_per_km2 != null ? <div><dt className="text-sm text-muted-foreground">Gustina mapirane putne mreže</dt><dd className="font-bold">{new Intl.NumberFormat("bs-BA", { maximumFractionDigits: 2 }).format(transport.mapped_road_density_km_per_km2)} km/km²</dd></div> : null}
        </dl>
      </> : null}
      {targets.length > 0 ? <>
        <h3 className="mt-5 font-bold">Pravolinijske udaljenosti</h3>
        <p className="mt-1 text-sm text-muted-foreground">Od referentne tačke naselja{targets.some(([, t]) => t.origin_type === "geographic_centroid") ? " (geografski centroid; nije nužno središte naseljenog dijela)" : ""}. Najbliži objekti u uvezenom skupu; ovo nisu putne udaljenosti ni vrijeme vožnje.</p>
        <dl className="mt-3 space-y-3">{targets.map(([code, t]) => <div key={code} className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-b border-border/40 pb-2">
          <dt>{t.label}{t.target_name ? <span className="block text-sm text-muted-foreground">{t.target_name}</span> : null}{t.target_in_country === false ? <span className="block text-sm text-amber-800 dark:text-amber-300">Cilj se nalazi izvan Bosne i Hercegovine (prema OSM državnoj granici).</span> : null}</dt>
          <dd className="font-bold">{formatDistance(t.distance_straight_m)} <span className="text-sm font-normal">pravolinijski</span></dd>
        </div>)}</dl>
      </> : null}
      <p className="mt-4 text-sm text-muted-foreground">Potpunost OSM mapiranja varira; ovo nije službeni inventar infrastrukture.</p>
      <NetworkSourceNote source={transport?.source ?? targets[0]?.[1].source} />
    </section> : null}
    {hasHydro ? <section aria-labelledby="hydro-title" className="rounded-lg border border-border/70 p-4 sm:p-6">
      <h2 id="hydro-title" className="text-xl font-extrabold">Rijeke i vode</h2>
      <p className="mt-3">Mapirani vodotoci unutar atlas granice: <strong>{formatNetworkKm(hydrography.waterway_length_km)}</strong>.</p>
      <p className="mt-2">Mapirane vodene površine: {new Intl.NumberFormat("bs-BA", { maximumFractionDigits: 3 }).format(hydrography.mapped_water_area_km2)} km².</p>
      {hydrography.named_features.length > 0 ? <ul className="mt-3 space-y-1">{Array.from(new Map(hydrography.named_features.map(f => [`${f.name}/${f.feature_type}/${f.relation}`, f])).values()).map(f => <li key={`${f.name}/${f.feature_type}/${f.relation}`}><strong>{f.name}</strong> ({waterLabels[f.feature_type] ?? "vodeni objekat"}) — {relationLabels[f.relation]}.</li>)}</ul> : null}
      <p className="mt-4 text-sm text-muted-foreground">OSM geometrijski objekti; odvojeno od M10 podataka o pokrovu zemljišta i udjelu vode. Potpunost mapiranja varira.</p>
      <NetworkSourceNote source={hydrography.source} />
    </section> : null}
  </div>;
}

function NetworkSourceNote({ source }: { source?: NetworkSource }) {
  if (!source) return null;
  return <p className="mt-3 text-xs text-muted-foreground"><a className="underline" href={source.url}>{source.attribution} · {source.license}</a>{source.osm_timestamp ? ` · stanje podataka ${source.osm_timestamp.slice(0, 10)}` : ""}</p>;
}
