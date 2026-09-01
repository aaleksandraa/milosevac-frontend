import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export type AtlasCrumb = {
  label: string;
  href?: string;
};

export function AtlasBreadcrumbs({ items }: { items: AtlasCrumb[] }) {
  return (
    <nav aria-label="Putanja" className="container-news pt-5 text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />}
              {item.href && !last ? (
                <Link to={item.href} className="hover:text-primary">
                  {item.label}
                </Link>
              ) : (
                <span className={last ? "text-foreground" : undefined}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
