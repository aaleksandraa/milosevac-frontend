export function AtlasMapEmptyState({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="atlas-map-fallback editorial-panel p-5 sm:p-6" role="status">
      <p className="font-extrabold">{title}</p>
      <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}
