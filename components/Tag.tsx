import { cn } from "@/lib/cn";

/**
 * Tag — the small category pill on cards and banners.
 * Figma: `Muted` (8 uses — Work ×6, Banner 1, Banner 2).
 *
 * Spec: fill ink-100, radius full, padding 8/16, Manrope Medium 14 in ink-900.
 * Sentence case, NOT uppercase — this is what distinguishes it from `Eyebrow`.
 */

export type TagVariant = "light" | "dark" | "mint";

export interface TagProps {
  label: string;
  /**
   * `light` = pale chip on imagery/cards. `dark` = for use on light surfaces.
   * `mint` = the rolled-over card state, where the chip sits on the image.
   */
  variant?: TagVariant;
  className?: string;
}

const TONE: Record<TagVariant, string> = {
  light: "bg-ink-100 text-ink-900",
  dark: "bg-ink-900 text-neutral-0",
  // A real variant rather than a `bg-green-300` override from the parent: both
  // are single classes, so which one won would come down to the order the colour
  // scales happen to sit in `tailwind.config.ts` — and green is declared before
  // ink, so the override would have LOST. Label stays `ink-900`; mint is light
  // enough to carry dark text.
  mint: "bg-green-300 text-ink-900",
};

export function Tag({ label, variant = "light", className }: TagProps) {
  return (
    <span
      className={cn(
        // `w-fit` + `self-start` so the chip always HUGS its label — a flex-col
        // parent would otherwise stretch it via the default `align-items: stretch`.
        "inline-flex w-fit items-center self-start rounded-full px-base py-sm text-tag",
        TONE[variant],
        className,
      )}
    >
      {label}
    </span>
  );
}
