import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

export type CtaVariant = "arrow" | "text";
export type CtaTone = "dark" | "light" | "gradient" | "solid";

export interface CtaProps {
  label: string;
  href?: string;
  /** arrow = pill + expanding circle w/ looping arrow · text = plain nav pill */
  variant?: CtaVariant;
  /** which background the CTA sits on — drives colours */
  tone?: CtaTone;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  /** hero scroll cue — arrow points down and loops continuously */
  scrollCue?: boolean;
  className?: string;
  onClick?: ComponentPropsWithoutRef<"button">["onClick"];
}

/* ---- tone maps ---------------------------------------------------------- */
const toneContainer: Record<CtaTone, string> = {
  dark: "bg-teal-tint ring-1 ring-inset ring-teal-tint-strong",
  light: "bg-teal-tint ring-1 ring-inset ring-teal-tint-strong",
  gradient: "bg-glass-fill ring-1 ring-inset ring-glass-border",
  // solid teal at rest → navy circle expands to invert on hover
  solid: "bg-primary-blue",
};
const toneLabel: Record<CtaTone, string> = {
  dark: "text-surface-white",
  // teal fill sweeps in → flip navy label to white (same quick timing)
  light: "text-primary-navy group-hover:text-surface-white group-hover:delay-150",
  // fill is white on gradient → snap the label to navy quickly on hover
  gradient: "text-surface-white group-hover:text-primary-navy group-hover:delay-150",
  // navy fill sweeps in → flip navy label to white
  solid: "text-primary-navy group-hover:text-surface-white group-hover:delay-150",
};
const toneCircle: Record<CtaTone, string> = {
  dark: "bg-primary-blue",
  light: "bg-primary-blue",
  gradient: "bg-surface-white",
  solid: "bg-primary-navy",
};
const toneArrow: Record<CtaTone, string> = {
  dark: "text-surface-white",
  light: "text-surface-white",
  gradient: "text-primary-blue", // white circle → teal arrow (white would vanish)
  solid: "text-surface-white",
};
// scroll-cue bottom fade — matches the circle colour so the arrow dissolves into it
const toneFadeFrom: Record<CtaTone, string> = {
  dark: "from-primary-blue",
  light: "from-primary-blue",
  gradient: "from-surface-white",
  solid: "from-primary-navy",
};

const toneTextPill: Record<CtaTone, string> = {
  dark: "bg-teal-tint ring-1 ring-inset ring-teal-tint-strong text-surface-white hover:bg-primary-blue",
  light: "bg-teal-tint ring-1 ring-inset ring-teal-tint-strong text-primary-navy hover:bg-primary-blue hover:text-surface-white",
  gradient: "bg-glass-fill ring-1 ring-inset ring-glass-border text-surface-white hover:bg-surface-white hover:text-primary-navy",
  solid: "bg-primary-blue text-primary-navy hover:bg-primary-navy hover:text-surface-white",
};

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 14" fill="none" aria-hidden="true" className={cn("h-icon-sm w-icon-sm", className)}>
      <path d="M1 7h12M8.5 2l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("h-icon-sm w-icon-sm animate-spin rounded-full border-2 border-current border-t-transparent", className)}
    />
  );
}

/**
 * Primary CTA. The circle expands to fill the button on hover (spring in,
 * softer out) while the arrow loops continuously. Motion values are tokens;
 * exact choreography is finalised in Deliverable 6.
 */
export function Cta({
  label,
  href,
  variant = "arrow",
  tone = "dark",
  fullWidth = false,
  disabled = false,
  loading = false,
  scrollCue = false,
  className,
  onClick,
}: CtaProps) {
  const inert = disabled || loading;
  const isLink = !!href && !inert;

  /* ---- text (nav pill) variant ---- */
  if (variant === "text") {
    const cls = cn(
      "group inline-flex min-h-tap items-center justify-center rounded-full px-lg font-mono text-cta uppercase outline-none transition-colors duration-base ease-standard focus-visible:shadow-focus",
      toneTextPill[tone],
      fullWidth && "w-full",
      inert && "pointer-events-none opacity-40",
      className,
    );
    return isLink ? (
      <a href={href} className={cls}>{label}</a>
    ) : (
      <button type="button" disabled={inert} aria-busy={loading} onClick={onClick} className={cls}>{label}</button>
    );
  }

  /* ---- arrow variant ---- */
  const cls = cn(
    "group relative items-center gap-base overflow-hidden rounded-pill py-xs2 pl-lg pr-xs2 outline-none focus-visible:shadow-focus",
    toneContainer[tone],
    fullWidth ? "flex w-full justify-between" : "inline-flex w-fit",
    inert && "pointer-events-none opacity-40",
    className,
  );

  const inner = (
    <>
      {/* expanding fill — spring in on hover, softer out */}
      <span
        aria-hidden="true"
        className={cn("cta-fill absolute inset-0", toneCircle[tone])}
      />
      {/* label */}
      <span
        className={cn(
          "relative z-10 whitespace-nowrap font-mono text-cta uppercase transition-colors duration-base ease-standard",
          toneLabel[tone],
        )}
      >
        {label}
      </span>
      {/* circle + looping arrow (or spinner while loading) */}
      <span className={cn("relative z-10 grid h-cta w-cta place-items-center overflow-hidden rounded-full", toneCircle[tone])}>
        {loading ? (
          <Spinner className={toneArrow[tone]} />
        ) : scrollCue ? (
          // arrow points down, loops continuously (slow, smooth)
          <span className={cn("flex -translate-y-3xl flex-col animate-arrow-loop-down", toneArrow[tone])}>
            <span className="grid h-cta w-cta shrink-0 place-items-center"><ArrowRight className="rotate-90" /></span>
            <span className="grid h-cta w-cta shrink-0 place-items-center"><ArrowRight className="rotate-90" /></span>
          </span>
        ) : (
          <span className={cn("flex -translate-x-3xl group-hover:animate-arrow-loop", toneArrow[tone])}>
            <span className="grid h-cta w-cta shrink-0 place-items-center"><ArrowRight /></span>
            <span className="grid h-cta w-cta shrink-0 place-items-center"><ArrowRight /></span>
          </span>
        )}
        {scrollCue && !loading && (
          <span
            aria-hidden="true"
            className={cn("pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t to-transparent", toneFadeFrom[tone])}
          />
        )}
      </span>
    </>
  );

  return isLink ? (
    <a href={href} className={cls}>{inner}</a>
  ) : (
    <button type="button" disabled={inert} aria-busy={loading} onClick={onClick} className={cls}>{inner}</button>
  );
}

export default Cta;
