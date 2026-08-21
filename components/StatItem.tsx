import { cn } from "@/lib/cn";

/**
 * StatItem — a single figure + label, used inside the featured Card.
 * Figma: `Stat Item` → `Stat Value` (26 Bold, green-600) + `Stat Label` (14, ink-600).
 *
 * The tone flips when the card rolls over and the copy lands on imagery.
 */

export interface StatItemProps {
  value: string;
  label: string;
  /**
   * `light` on a card surface · `dark` over imagery ·
   * `auto` follows the parent Card's rollover — light at rest, dark on hover.
   */
  tone?: "light" | "dark" | "auto";
  className?: string;
}

const VALUE_TONE = {
  light: "text-green-600",
  dark: "text-green-300",
  auto: "text-green-600 lg:group-hover:text-green-300",
} as const;

const LABEL_TONE = {
  light: "text-ink-600",
  dark: "text-green-100",
  auto: "text-ink-600 lg:group-hover:text-green-100",
} as const;

export function StatItem({ value, label, tone = "light", className }: StatItemProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <span className={cn("text-stat-value transition-colors duration-slow ease-smooth", VALUE_TONE[tone])}>
        {value}
      </span>
      <span className={cn("text-body-sm transition-colors duration-slow ease-smooth", LABEL_TONE[tone])}>
        {label}
      </span>
    </div>
  );
}
