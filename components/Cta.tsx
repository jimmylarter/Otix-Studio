import { cn } from "@/lib/cn";

/**
 * Cta — the pill button: label + a circular arrow badge.
 * Figma: `Link` (8 uses, 4 sections).
 *
 * Geometry is IDENTICAL across every instance: height 44, radius full,
 * padding 4/4/4/24, gap 16, label Manrope SemiBold 14 uppercase, badge 36×36 circle.
 * Only the two surface colours change between tones — the arrow is ALWAYS white.
 *
 *   mint  — bg green-300, label green-950, badge green-900   (hero nav, footer, featured tier)
 *   ink   — bg ink-900,   label neutral-0, badge green-600   (Work, WhyOtix)
 *   green — bg green-600, label neutral-50, badge green-900  (standard tier)
 *
 * ── Rollover ──────────────────────────────────────────────────────────────────
 * On hover the badge bounces OFF the right edge and the label snaps to the centre;
 * on roll-off the badge springs back in and the label returns. Both use elastic
 * easing, and the two directions are deliberately asymmetric — the exit is quicker
 * and sharper (`cta-expand`), the return slower and springier (`out-back`).
 *
 * Why the label moves by exactly `base` (16px): the label box spans from the 24px
 * left padding to the badge, so its centre sits 16px left of the pill's true centre
 * — (badge 36 + gap 16 + right padding 4) / 2 − 4. Shifting it +16px lands it dead
 * centre once the badge has left. This holds at every width, which is why it is a
 * token and not a magic number.
 *
 * `overflow-hidden` clips the badge as it exits. Reduced motion is handled globally
 * in globals.css — the transitions collapse and the states simply swap.
 */

export type CtaTone = "mint" | "ink" | "green";

export interface CtaProps {
  label: string;
  href?: string;
  tone?: CtaTone;
  /** Stretch to the container; the label centres and the badge sits at the far edge. */
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  /**
   * Native button type. `submit` exists so a form can use the real CTA as its
   * submit control — the alternative is wrapping this in another `<button>`, which
   * is invalid HTML and breaks keyboard activation. Ignored when `href` is set.
   */
  type?: "button" | "submit";
  /**
   * Render as a NON-INTERACTIVE `<span>`: no link, no button, not focusable,
   * hidden from assistive tech.
   *
   * ⚠️ For when something ELSE owns the click — `TierCard` covers its whole card
   * with one stretched link and keeps this as the visual affordance. Without it
   * the card would carry two tab stops to the same destination and a screen reader
   * would announce the same link twice.
   *
   * ⚠️ A stretched `::after` on this component does NOT work as an alternative:
   * the root carries `overflow-hidden` to clip the badge as it exits, which clips
   * the pseudo-element to the pill as well.
   */
  decorative?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * ⚠️ `fill` IS THE ROLLOVER AND IT WAS MISSING UNTIL 13 AUG. `globals.css` has
 * carried a `.cta-fill` rule since D4 — a clip-path circle that expands from the
 * badge's position — and CLAUDE.md §7 lists "the CTA hover mechanic" as specified in
 * the brief. Nothing ever used the class. Every CTA on the site had only a flat
 * `hover:bg-*` swap.
 *
 * ⚠️ The hover COLOUR moved out of `root` and into `fill`. Keeping both would run the
 * two against each other — the background swapping instantly underneath a circle
 * trying to reveal the same colour, so the expansion would be invisible.
 */
const TONE: Record<CtaTone, { root: string; fill: string; label: string; badge: string }> = {
  mint: {
    root: "bg-green-300",
    fill: "bg-green-200",
    label: "text-green-950",
    badge: "bg-green-900",
  },
  ink: {
    root: "bg-ink-900",
    fill: "bg-ink-800",
    label: "text-neutral-0",
    badge: "bg-green-600",
  },
  green: {
    root: "bg-green-600",
    fill: "bg-green-700",
    label: "text-neutral-50",
    badge: "bg-green-900",
  },
};

/**
 * Exported because the Hero's scroll cue is the SAME arrow rotated 90° — that is
 * exactly what the design does (Figma reuses one svg asset in both places). It
 * lives here rather than in `Icon` because it belongs to the CTA language, not to
 * the service/process icon set.
 */
export function Arrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      /**
       * 🔴 ⚠️ THE SIZE IS ONLY A DEFAULT WHEN NOTHING ELSE IS PASSED, and `cn` cannot
       * enforce that — it is a plain `join`, not `tailwind-merge`, so a caller's
       * `h-icon-xl` does not REPLACE `h-icon-sm`, it sits alongside it and **CSS source
       * order decides the winner, not the order in the class attribute.**
       *
       * That bit us on 13 Aug: the Quiz's back arrow was set to `h-icon-lg` (32) and
       * rendered at **16**, because Tailwind emits `.h-icon-lg` BEFORE `.h-icon-sm` and
       * the later rule won. It read as "too small" and was tuned by eye for several
       * passes against a number that was never being applied.
       *
       * The `size` prop is the fix: one class, no collision, no dependence on the order
       * Tailwind happens to emit. **Do not add a size class back into this base.**
       * The same trap is documented on `Tag`'s mint variant in COMPONENTS.md — it is a
       * property of `cn`, so it applies anywhere a component has a default class a
       * caller might want to override.
       */
      className={className}
    >
      <path
        d="M5 12h13M12 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-icon-sm w-icon-sm animate-spin">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Cta({
  label,
  href,
  tone = "mint",
  fullWidth = false,
  disabled = false,
  loading = false,
  type = "button",
  decorative = false,
  onClick,
  className,
}: CtaProps) {
  const t = TONE[tone];
  const inert = disabled || loading;
  /** Loading holds the badge in place — it must stay visible to show the spinner. */
  const animate = !inert;

  const classes = cn(
    "group relative isolate inline-flex min-h-tap items-center gap-base overflow-hidden rounded-full py-xs pl-xl pr-xs",
    "transition-colors duration-base ease-smooth",
    "focus-visible:shadow-focus focus-visible:outline-none",
    fullWidth ? "w-full" : "w-auto",
    inert ? "pointer-events-none opacity-60" : t.root,
    inert && t.root,
    className,
  );

  const inner = (
    <>
      {/* ⚠️ The rollover. `cta-fill` lives in `globals.css` because a `clip-path`
          circle keyed to `calc(100% - 24px)` is one of the few things Tailwind cannot
          express (CLAUDE.md §4). It expands from the badge's centre, so the reveal
          reads as coming FROM the arrow rather than from an edge.

          ⚠️ `-z-10` and `isolate` on the root: without a stacking context of its own
          the fill paints over the label. `pointer-events-none` is in the CSS rule.

          ⚠️ Not rendered when inert — a disabled or loading CTA should not respond to
          hover at all, and the `pointer-events-none` on the root already stops it. */}
      {inert ? null : <span aria-hidden="true" className={cn("cta-fill absolute inset-0 -z-10", t.fill)} />}
      <span
        className={cn(
          // Return: slower, springier. Exit is overridden on hover below.
          "text-label uppercase transition-transform duration-slower ease-out-back",
          animate && "group-hover:translate-x-base group-hover:duration-slow group-hover:ease-cta-expand",
          fullWidth && "flex-1 text-center",
          t.label,
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "flex h-cta w-cta shrink-0 items-center justify-center rounded-full text-neutral-0",
          "transition-transform duration-slower ease-out-back",
          animate && "group-hover:translate-x-5xl group-hover:duration-slow group-hover:ease-cta-expand",
          t.badge,
        )}
      >
        {loading ? <Spinner /> : <Arrow className="h-icon-sm w-icon-sm" />}
      </span>
    </>
  );

  /* Something else owns the click — render the pill as pure decoration so the
     card around it can be the single link. `aria-hidden` because the stretched
     link already carries this label as its accessible name. */
  if (decorative) {
    return (
      <span aria-hidden="true" className={classes}>
        {inner}
      </span>
    );
  }

  if (href && !inert) {
    return (
      <a href={href} className={classes}>
        {inner}
      </a>
    );
  }

  return (
    <button type={type} className={classes} disabled={inert} aria-busy={loading} onClick={onClick}>
      {inner}
    </button>
  );
}
