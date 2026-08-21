import { cn } from "@/lib/cn";

/**
 * Eyebrow — the glass pill above every section heading.
 * Figma: `Overlay+Border` (15 uses, 8 sections).
 *
 * Spec: fill green-500 @20%, stroke green-500 @35%, radius 20, Geist Mono 13
 * uppercase. Only the TEXT COLOUR changes between contexts — the surface is
 * identical everywhere.
 *
 * ⚠️ The glass is an APPROXIMATION of Figma's GLASS material effect, which has no
 * CSS equivalent (CLAUDE.md §4.1). Verify against the render before sign-off.
 *
 * Text-only by design — there is no icon variant. The 50×50 glass circle in the
 * footer is part of `ContactRow`; see COMPONENTS.md §7 decision 1.
 */

export type EyebrowVariant = "light" | "dark";

export interface EyebrowProps {
  label: string;
  /** `light` = on the warm page (green-600). `dark` = on a dark surface (green-300). */
  variant?: EyebrowVariant;
  className?: string;
}

/**
 * ⚠️ THE TWO VARIANTS ARE NOT THE SAME COLOUR AT DIFFERENT LIGHTNESSES, and the
 * asymmetry is deliberate. `dark` went white → green-300 on 13 Aug so the pill
 * carries the brand tint on dark surfaces; `light` did NOT follow it, because it
 * cannot.
 *
 * Measured on the real ground (green-500 @20% composited over each background):
 *
 *   light  · green-600 on the warm page   → 5.44:1  ✅ (today)
 *   light  · green-300 on the warm page   → 1.39:1  ❌ effectively invisible
 *   dark   · white on green-950           → 14.96:1 (before)
 *   dark   · green-300 on green-950       → 7.67:1  ✅ AA with room to spare
 *   dark   · green-300 on green-900       → 6.47:1  ✅ (the gradient's light end)
 *
 * So if this ever looks inconsistent and someone reaches for "just make both
 * green-300": the light pill's label disappears at 1.39:1. Measure before
 * changing either value — the pill's translucent fill means neither ratio can be
 * read off the token names.
 */
const TEXT: Record<EyebrowVariant, string> = {
  light: "text-green-600",
  dark: "text-green-300",
};

export function Eyebrow({ label, variant = "light", className }: EyebrowProps) {
  return (
    <span
      className={cn(
        // `w-fit` so the pill always HUGS its label — without it a flex-col parent
        // stretches it to full width via the default `align-items: stretch`.
        //
        // ⚠️ It used to also carry `self-start`, which was redundant (a set width
        // already defeats the stretch) and actively wrong: it pinned the pill left
        // even inside a centred parent, so the Hero's eyebrow sat off to the side.
        // Alignment belongs to the parent's `items-*`, not to the pill.
        "inline-flex w-fit items-center rounded-xl border border-border-green bg-overlay-green-20 px-md py-sm",
        "font-mono text-eyebrow uppercase",
        "shadow-glass backdrop-blur-glass",
        TEXT[variant],
        className,
      )}
    >
      {label}
    </span>
  );
}
