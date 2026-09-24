import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-7 place-items-center rounded-lg bg-brand text-sm font-semibold text-brand-foreground shadow-sm",
        className,
      )}
    >
      S
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2 rounded-md font-semibold tracking-tight outline-none focus-visible:ring-[3px] focus-visible:ring-ring",
        className,
      )}
    >
      <LogoMark />
      <span>Sinapse</span>
    </Link>
  );
}
