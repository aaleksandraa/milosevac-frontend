import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "header" | "footer";
  className?: string;
}

export function Logo({ variant = "header", className }: LogoProps) {
  const isFooter = variant === "footer";

  return (
    <Link
      to="/"
      className={cn("group flex shrink-0 items-center", className)}
      aria-label="Miloševac - naslovna strana"
    >
      <span
        className={cn(
          "font-serif font-bold tracking-tight",
          isFooter ? "text-2xl text-primary-foreground" : "text-xl text-ink sm:text-2xl lg:text-3xl",
        )}
      >
        Miloševac
      </span>
    </Link>
  );
}
