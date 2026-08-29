import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CloudSun, Menu, Search, X } from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";
import { useWeather } from "@/hooks/useWeather";

const navItems = [
  { label: "Naslovna", href: "/" },
  { label: "Vijesti", href: "/kategorija/vijesti" },
  { label: "Obavještenja", href: "/kategorija/vijesti?tag=obavjestenje" },
  { label: "Prekidi struje", href: "/prekidi-struje" },
  { label: "Sport", href: "/kategorija/sport" },
  { label: "FK Posavina", href: "/fk-posavina" },
  { label: "Vrijeme", href: "/vrijeme" },
  { label: "Kontakt", href: "/kontakt" },
];

function isActivePath(pathname: string, currentSearch: string, href: string) {
  const [path, search] = href.split("?");
  if (search) return pathname === path && currentSearch.includes(search);
  return pathname === path && currentSearch === "";
}

export function Header({ onSearchClick }: { onSearchClick: () => void }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { forecast } = useWeather();
  const temperature = forecast?.current?.temperature ?? null;

  useEffect(() => setOpen(false), [location.pathname, location.search]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-white/95 backdrop-blur-xl">
      <div className="container-news flex h-16 items-center justify-between gap-2 sm:h-20 sm:gap-4">
        <Logo />

        <nav className="hidden items-center gap-6 lg:flex xl:gap-8" aria-label="Glavna navigacija">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "text-sm font-extrabold uppercase tracking-[0.12em] text-slate-600 transition-colors hover:text-primary",
                isActivePath(location.pathname, location.search, item.href) && "text-primary",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/vrijeme"
            className="inline-flex h-11 items-center gap-1.5 rounded-md bg-secondary px-2.5 text-sm font-extrabold text-secondary-foreground transition hover:bg-muted hover:text-primary sm:px-3"
            aria-label="Trenutna temperatura i vremenska prognoza za Miloševac"
          >
            <CloudSun className="h-4 w-4 text-primary" />
            {temperature === null ? "--°" : `${Math.round(temperature)}°`}
          </Link>

          <button
            type="button"
            onClick={onSearchClick}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-ink px-3 text-sm font-bold text-white transition hover:bg-primary xl:px-5"
            aria-label="Pretraži vijesti"
          >
            <Search className="h-4 w-4" />
            <span className="hidden xl:inline">Pretraži</span>
          </button>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border/70 bg-card transition hover:bg-secondary lg:hidden"
            aria-label={open ? "Zatvori meni" : "Otvori meni"}
            aria-expanded={open}
            aria-controls="mobilna-navigacija"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobilna-navigacija" className="absolute inset-x-0 top-full border-b bg-white shadow-lg lg:hidden">
          <nav className="container-news py-2" aria-label="Mobilna navigacija">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex min-h-[48px] items-center border-b border-border/60 px-1 text-base font-semibold transition-colors last:border-b-0 hover:text-primary",
                  isActivePath(location.pathname, location.search, item.href) && "text-primary",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
