import { POI_FILTER_GROUPS } from "@/lib/atlas-poi-types";

export function AtlasPoiFilters({
  groupId,
  onGroupChange,
}: {
  groupId: string;
  onGroupChange: (id: string) => void;
}) {
  return (
    <fieldset className="atlas-map-controls atlas-poi-filters">
      <legend className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        Objekti
      </legend>
      <div className="flex flex-wrap gap-1.5">
        {POI_FILTER_GROUPS.map((group) => (
          <button
            key={group.id}
            type="button"
            aria-pressed={groupId === group.id}
            onClick={() => onGroupChange(group.id)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold leading-none ${
              groupId === group.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {group.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
