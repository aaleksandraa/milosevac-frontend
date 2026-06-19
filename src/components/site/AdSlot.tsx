import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { apiUrl } from "@/lib/backend";
import { cookieConsentKey, cookieConsentUpdatedEvent } from "@/lib/cookie-consent";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdSlotProps {
  variant?: "inline" | "sidebar" | "banner";
  position?: string;
  className?: string;
  lazy?: boolean;
}

type AdsSettings = {
  enabled: boolean;
  clientId: string | null;
  slots: Record<string, { enabled: boolean; label?: string }>;
};

const variantFallbacks: Record<NonNullable<AdSlotProps["variant"]>, string> = {
  banner: "top_banner",
  inline: "article_inline",
  sidebar: "sidebar_primary",
};

function readMarketingConsent(): boolean {
  try {
    const consent = JSON.parse(localStorage.getItem(cookieConsentKey) || "null") as { marketing?: boolean } | null;
    return Boolean(consent?.marketing);
  } catch {
    return false;
  }
}

function loadAdsense(clientId: string) {
  if (document.querySelector("[data-google-ads-loader]")) return;

  const script = document.createElement("script");
  script.async = true;
  script.crossOrigin = "anonymous";
  script.dataset.googleAdsLoader = "true";
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`;
  document.head.appendChild(script);
}

async function fetchAdsSettings(): Promise<AdsSettings> {
  const response = await fetch(apiUrl("/ads"), {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("Ad settings API nije dostupan");

  return response.json() as Promise<AdsSettings>;
}

export function AdSlot({ variant = "banner", position, className, lazy = true }: AdSlotProps) {
  const adPosition = position ?? variantFallbacks[variant];
  const pushedRef = useRef(false);
  const [marketingConsent, setMarketingConsent] = useState(readMarketingConsent);
  const { data } = useQuery({
    queryKey: ["ads-settings"],
    queryFn: fetchAdsSettings,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const update = () => setMarketingConsent(readMarketingConsent());
    window.addEventListener(cookieConsentUpdatedEvent, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(cookieConsentUpdatedEvent, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const clientId = data?.clientId;
  const enabled = Boolean(data?.enabled && clientId && data.slots?.[adPosition]?.enabled && marketingConsent);

  useEffect(() => {
    if (!enabled || !clientId) return;

    loadAdsense(clientId);
    if (pushedRef.current) return;

    window.setTimeout(() => {
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        pushedRef.current = true;
      } catch {
        // AdSense can reject duplicate pushes while navigating; it will retry on the next mounted slot.
      }
    }, 0);
  }, [clientId, enabled]);

  if (!enabled) return null;

  return (
    <section
      className={cn(
        "ad-slot w-full overflow-hidden",
        variant === "sidebar" ? "min-h-[250px]" : "min-h-[90px]",
        `ad-slot-${variant}`,
        className,
      )}
      aria-label="Oglas"
    >
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-format="auto"
        data-full-width-responsive="true"
        data-adtest={import.meta.env.DEV ? "on" : undefined}
        data-ad-position={adPosition}
        {...(lazy ? { "data-ad-lazy": "true" } : {})}
      />
    </section>
  );
}
