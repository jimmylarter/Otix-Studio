import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * StepCard — one step in the Process section.
 * Figma: `Icon Section` → `Icon Container` (120 circle) + `Text Section`.
 *
 * The icon sits in a gradient circle carrying `shadow-elevated`; the glyph is
 * stroked in green-100. Padding 24, gap 32 between circle and copy, 12 within it.
 *
 * ⚠️ The circle uses `gradient-green-lift` (green-700 → green-950), NOT the base
 * `gradient-green` it had until 13 Aug. The base ramp runs 900 → 950 — barely two
 * steps — which on a 120px circle has almost no falloff, so the disc read flat and
 * the shadow was doing all the work of making it a sphere. The lifted ramp gives
 * it a light top and a dark base, which is what a round object actually does.
 *
 * It is a RESTING fill here, not a rollover: these circles have no hover state.
 * Same token, two different jobs — see the note on it in tailwind.config.ts.
 *
 * There are three 1px `border-divider` rules behind the row in Figma, connecting
 * the circles. Those belong to the SECTION, not this component — they span between
 * cards and cannot live inside one (D8).
 */

export interface StepCardProps {
  /** 24px line icon. Stroked with `currentColor` so it inherits green-100. */
  icon: ReactNode;
  title: string;
  description: string;
  /**
   * Starts the circle's float at a point in its cycle, so a row of these forms a
   * travelling wave instead of moving as one block. **Negative**, which is what
   * makes each one begin already offset rather than all starting from rest.
   * Omit for a static circle.
   */
  floatDelayMs?: number;
  className?: string;
}

export function StepCard({
  icon,
  title,
  description,
  floatDelayMs,
  className,
}: StepCardProps) {
  /**
   * ⚠️ **ROW BELOW `lg`, COLUMN FROM `lg`** (Jimmy, 13 Aug: "have the copy sitting
   * to the right of the icon circles" on mobile). Stacked, a 120px circle above two
   * lines of copy costs most of a phone screen per step and four of them read as
   * four screens; beside the copy, a step is one glance.

   * ⚠️ `items-start`, not `items-center`: the circle aligns with the TITLE's first
   * line rather than with the middle of a copy block whose length varies per step.
   * Centred, the circles would sit at four different heights down the column and the
   * vertical connectors between them would visibly kink.

   * ⚠️ `gap-xl` (24) in the row against `gap-3xl` (32) in the column. A horizontal
   * gap and a vertical gap between the same two things are not the same measurement
   * — sideways, 32 pushed the copy past the comfortable measure on a 375 screen.

   * ⚠️ `relative` is load-bearing: it is what `Process`'s vertical connector
   * positions against. See the note there.
   */
  return (
    <article
      className={cn(
        "relative flex items-start p-xl",
        "flex-row gap-xl lg:flex-col lg:gap-3xl",
        className,
      )}
    >
      {/* Only the CIRCLE floats, never the copy — text that drifts while you read
          it is the difference between "alive" and "broken". The section's
          connector lines stay put, which works because they tuck 22px under each
          circle and the drift stays well inside that.

          ⚠️ `z-10`: the vertical connector on mobile is drawn behind the card and ENDS
          at the circle's centre, so the circle has to paint over the last 60px of it.
          Without this the line runs across the disc. */}
      <span
        style={floatDelayMs === undefined ? undefined : { animationDelay: `${floatDelayMs}ms` }}
        className={cn(
          "relative z-10 flex h-step-icon w-step-icon shrink-0 items-center justify-center rounded-full",
          "bg-gradient-green-lift text-green-100 shadow-elevated",
          floatDelayMs !== undefined && "animate-step-float",
        )}
      >
        {icon}
      </span>

      <div className="flex flex-col gap-md">
        <h3 className="text-h5 text-ink-900">{title}</h3>
        <p className="text-body text-ink-600">{description}</p>
      </div>
    </article>
  );
}
