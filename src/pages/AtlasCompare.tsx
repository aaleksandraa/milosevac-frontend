import { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { AtlasBreadcrumbs } from "@/components/atlas/AtlasBreadcrumbs";
import { AtlasCompareHeader, AtlasCompareTable } from "@/components/atlas/AtlasCompareTable";
import { AtlasSettlementSelect } from "@/components/atlas/AtlasSettlementSelect";
import { useAtlasCompare, useAtlasMunicipalities } from "@/hooks/useAtlas";
import { comparePath, settlementOptionsFromMunicipalities } from "@/lib/atlas-ranking";

const AtlasCompare = () => {
  const { municipalityA, settlementA, municipalityB, settlementB } = useParams();
  const navigate = useNavigate();
  const { municipalities } = useAtlasMunicipalities();
  const { comparison, loading, error, notFound } = useAtlasCompare(municipalityA, settlementA, municipalityB, settlementB);
  const options = useMemo(() => settlementOptionsFromMunicipalities(municipalities), [municipalities]);
  const optionA = options.find((row) => row.municipalitySlug === municipalityA && row.settlementSlug === settlementA) ?? null;
  const optionB = options.find((row) => row.municipalitySlug === municipalityB && row.settlementSlug === settlementB) ?? null;

  useEffect(() => {
    if (!comparison) return;
    document.title = `${comparison.a.name} i ${comparison.b.name} — poređenje | Miloševac.com`;
    window.scrollTo({ top: 0 });
  }, [comparison]);

  if (loading) {
    return <SiteLayout><div className="container-news py-16 text-center text-muted-foreground">Učitavam poređenje...</div></SiteLayout>;
  }

  if (notFound) {
    return (
      <SiteLayout>
        <div className="container-news py-16 text-center text-muted-foreground">
          Jedno od naselja nije pronađeno u navedenoj opštini.
        </div>
      </SiteLayout>
    );
  }

  if (error || !comparison) {
    return (
      <SiteLayout>
        <div className="container-news py-16 text-center text-muted-foreground">Poređenje trenutno nije moguće učitati.</div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <AtlasBreadcrumbs
        items={[
          { label: "Početna", href: "/" },
          { label: "Mjesta", href: "/mjesta" },
          { label: "Poređenje" },
        ]}
      />
      <section className="container-news mt-4">
        <AtlasCompareHeader comparison={comparison} />
        <p className="mt-4 text-sm text-muted-foreground">
          Poređenje pojedinačnih pokazatelja, bez zbirne ocjene ili pobjednika. Nedostajući podatak nije nula.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
          <AtlasSettlementSelect
            id="compare-a"
            label="Naselje A"
            municipalities={municipalities}
            value={optionA}
            onChange={(option) => navigate(comparePath(option.municipalitySlug, option.settlementSlug, municipalityB ?? "", settlementB ?? ""))}
          />
          <button
            type="button"
            className="h-11 rounded-md border border-border/70 px-4 text-sm font-extrabold hover:bg-secondary"
            onClick={() => navigate(comparePath(municipalityB ?? "", settlementB ?? "", municipalityA ?? "", settlementA ?? ""))}
          >
            Zamijeni
          </button>
          <AtlasSettlementSelect
            id="compare-b"
            label="Naselje B"
            municipalities={municipalities}
            value={optionB}
            onChange={(option) => navigate(comparePath(municipalityA ?? "", settlementA ?? "", option.municipalitySlug, option.settlementSlug))}
          />
        </div>

        <div className="mt-8">
          <AtlasCompareTable comparison={comparison} />
        </div>

        <p className="mt-8 text-sm">
          <Link to={comparison.a.path} className="action-link mr-4">Stranica {comparison.a.name}</Link>
          <Link to={comparison.b.path} className="action-link">Stranica {comparison.b.name}</Link>
        </p>
      </section>
    </SiteLayout>
  );
};

export default AtlasCompare;
