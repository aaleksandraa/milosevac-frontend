import { AtlasStatCard } from "@/components/atlas/AtlasStatCard";
import { ClimateChart } from "@/components/atlas/ClimateChart";
import { SourcePanel } from "@/components/atlas/SourcePanel";
import { climateHasPublicValues, climateIndexLabel, climateMonthlyRows, monthLabel } from "@/lib/atlas-climate";
import { formatBsDecimal, formatPrecipitationMm, formatTemperatureC } from "@/lib/atlas-format";
import type { GeoClimate } from "@/lib/atlas-types";

const INDEX_ORDER = ["hot_days_30c", "frost_days", "precipitation_days_1mm", "tropical_nights", "ice_days", "very_hot_days_35c"];

export function ClimateSection({ climate }: { climate?: GeoClimate }) {
  if (!climateHasPublicValues(climate)) return null;

  const monthly = climateMonthlyRows(climate);
  const indices = [...(climate.indices ?? [])]
    .filter((item) => item.value != null)
    .sort((a, b) => INDEX_ORDER.indexOf(a.code) - INDEX_ORDER.indexOf(b.code))
    .slice(0, 4);
  const extremes = climate.extremes ?? [];

  return (
    <section className="mt-8" aria-labelledby="klima">
      <h2 id="klima" className="text-lg font-extrabold">Klima</h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        Prema ERA5-Land reanalizi za područje naselja, klimatološki normalni period {climate.normal_period}. To nisu mjerenja
        meteorološke stanice u naselju niti vremenska prognoza.
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <AtlasStatCard
          label="Prosječna godišnja temperatura"
          value={formatTemperatureC(climate.annual.temperature_mean_c ?? 0)}
          hint={`ERA5-Land reanaliza, ${climate.normal_period}`}
        />
        <AtlasStatCard
          label="Prosječne godišnje padavine"
          value={formatPrecipitationMm(climate.annual.precipitation_mm ?? 0)}
          hint={`ERA5 reanaliza, ${climate.normal_period}`}
        />
        {climate.annual.coldest_month ? (
          <AtlasStatCard
            label="Najhladniji mjesec"
            value={formatTemperatureC(monthly.find((row) => row.month === climate.annual.coldest_month)?.temperature_mean_c ?? 0)}
            hint={monthLabel(climate.annual.coldest_month)}
          />
        ) : null}
        {climate.annual.warmest_month ? (
          <AtlasStatCard
            label="Najtopliji mjesec"
            value={formatTemperatureC(monthly.find((row) => row.month === climate.annual.warmest_month)?.temperature_mean_c ?? 0)}
            hint={monthLabel(climate.annual.warmest_month)}
          />
        ) : null}
      </div>

      <ClimateChart climate={climate} />

      {monthly.length === 12 ? (
        <div className="editorial-panel mt-4 overflow-x-auto p-4 sm:p-5">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <caption className="mb-3 text-left text-sm font-bold">
              Mjesečne klimatske normale {climate.normal_period}
            </caption>
            <thead>
              <tr className="border-b border-border/70 text-xs uppercase tracking-wider text-muted-foreground">
                <th scope="col" className="py-2 pr-3 font-bold">Mjesec</th>
                <th scope="col" className="py-2 pr-3 font-bold">Srednja °C</th>
                <th scope="col" className="py-2 pr-3 font-bold">Min °C</th>
                <th scope="col" className="py-2 pr-3 font-bold">Max °C</th>
                <th scope="col" className="py-2 font-bold">Padavine mm</th>
              </tr>
            </thead>
            <tbody>
              {monthly.map((row) => (
                <tr key={row.month} className="border-b border-border/40">
                  <th scope="row" className="py-2 pr-3 font-bold capitalize">{monthLabel(row.month)}</th>
                  <td className="py-2 pr-3">{formatNullable(row.temperature_mean_c, formatTemperatureC)}</td>
                  <td className="py-2 pr-3">{formatNullable(row.temperature_mean_min_c, formatTemperatureC)}</td>
                  <td className="py-2 pr-3">{formatNullable(row.temperature_mean_max_c, formatTemperatureC)}</td>
                  <td className="py-2">{formatNullable(row.precipitation_mean_mm, formatPrecipitationMm)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {indices.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-base font-extrabold">Klimatski indeksi</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Prosječan broj dana godišnje u periodu {climate.normal_period}, ne tačan broj u svakoj godini.
          </p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {indices.map((index) => (
              <li key={index.code} className="editorial-panel p-4" title={index.definition}>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{climateIndexLabel(index)}</p>
                <p className="mt-1 text-xl font-extrabold">{formatBsDecimal(index.value ?? 0, 1)} dana/god.</p>
                <p className="mt-1 text-sm text-muted-foreground">{index.definition}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {extremes.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-base font-extrabold">Ekstremi u analiziranom ERA5-Land nizu</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            U analiziranom ERA5-Land klimatološkom nizu
            {climate.historical_period_start && climate.historical_period_end
              ? ` (${climate.historical_period_start.slice(0, 4)}–${climate.historical_period_end.slice(0, 4)})`
              : ""}
            . To nisu službeni rekordi meteorološke stanice.
          </p>
          <ul className="mt-3 grid gap-3">
            {extremes.map((item) => (
              <li key={item.metric_code} className="editorial-panel p-4">
                <p className="font-bold">
                  {item.wording ?? item.metric_code}: {formatExtremeValue(item.value, item.unit)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.occurred_on ? `Datum u nizu: ${item.occurred_on}. ` : ""}
                  {item.period_start && item.period_end ? `Period: ${item.period_start} – ${item.period_end}.` : ""}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {climate.annual.temperature_mean_change_c != null ? (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Razlika srednje godišnje temperature između ERA5-Land perioda 1991–2020 i 1961–1990:{" "}
          {formatSignedTemperature(climate.annual.temperature_mean_change_c)}. To nije izmjereni lokalni trend meteorološke stanice.
        </p>
      ) : null}

      <div className="mt-6">
        <SourcePanel
          source={climate.source}
          title="Metodologija klime"
          headingId="klima-metodologija"
        />
        {climate.methodology?.text ? (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{climate.methodology.text}</p>
        ) : null}
        <p className="mt-2 text-sm text-muted-foreground">
          ERA5-Land ima razmak mreže oko 9 km (CDS 0,1°). Mnoga naselja su manja od jedne ćelije, pa je vrijednost reprezentativna za
          šire područje, ne za dvorište ili središte naselja.
        </p>
      </div>
    </section>
  );
}

function formatNullable(value: number | null | undefined, format: (value: number) => string): string {
  if (value === null || value === undefined) return "—";
  return format(value);
}

function formatExtremeValue(value: number | null | undefined, unit: string): string {
  if (value === null || value === undefined) return "—";
  if (unit === "mm") return formatPrecipitationMm(value);
  return formatTemperatureC(value);
}

function formatSignedTemperature(value: number): string {
  const formatted = formatTemperatureC(Math.abs(value));
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `−${formatted}`;
  return formatted;
}
