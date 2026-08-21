import { cn } from "@/lib/cn";

export interface PillProps {
  label: string;
  className?: string;
}

/**
 * Static service tag — navy fill, teal hairline border, mono uppercase CTA
 * text. Purely presentational (not a link); content comes in as `label`.
 */
export function Pill({ label, className }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex h-pill items-center rounded-pill border border-primary-blue bg-primary-navy px-lg font-mono text-cta uppercase text-surface-light",
        className,
      )}
    >
      {label}
    </span>
  );
}

export default Pill;
