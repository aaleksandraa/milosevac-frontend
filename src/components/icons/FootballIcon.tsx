import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export function FootballIcon({ className }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-5 w-5", className)}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2.5 13.8 7.2 18.8 7.8 15 11.1 16 16 12 13.8 8 16 9 11.1 5.2 7.8 10.2 7.2 12 2.5z" />
      <path d="M12 13.8V22" />
      <path d="M8 16 3.5 18" />
      <path d="M16 16l4.5 2" />
      <path d="M5.2 7.8 2 5" />
      <path d="M18.8 7.8 22 5" />
    </svg>
  );
}
