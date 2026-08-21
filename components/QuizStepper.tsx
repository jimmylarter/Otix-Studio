import { cn } from "@/lib/cn";

/**
 * QuizStepper — the quiz's progress indicator. INTRODUCED (not in Figma).
 *
 * A segment per question, not a single continuous bar. The difference matters: a
 * continuous bar answers "how far along am I", segments also answer "how many are
 * left", and the second question is the one someone deciding whether to start is
 * actually asking. Six short bars read as a small commitment; one long bar at 16%
 * reads as a big one.
 *
 * ── Accessibility ─────────────────────────────────────────────────────────────
 * ONE `role="progressbar"` for the whole strip, with `aria-valuetext` carrying the
 * human sentence. The segments themselves are `aria-hidden` decoration.
 *
 * The alternative — marking each segment up as a step — is the common mistake: it
 * makes a screen reader read six list items with no useful distinction between
 * them on every single step change. `aria-valuetext` says "Step 3 of 6" once.
 *
 * ⚠️ `aria-valuenow` is the step NUMBER, with min/max as 1 and the step count,
 * rather than a 0–100 percentage. Assistive tech reads the raw numbers when
 * `valuetext` is absent, and "3 of 6" is more use than "50".
 *
 * ── Motion ────────────────────────────────────────────────────────────────────
 * Each segment's fill is a `scale-x` transform on an inner span with a left origin,
 * NOT a width change — transform is composited, width is not, and this animates
 * while a whole step is transitioning beside it.
 *
 * `slow` + `smooth` is the site's "arriving" pair, the same one the Card rollover
 * and the CTA use. The brief asks for no new easing and there is none.
 */

export interface QuizStepperProps {
  /** 1-based. `0` means the start screen — nothing filled yet. */
  current: number;
  total: number;
  /** e.g. "Step 3 of 6" — authored in content so it can be translated. */
  valueText: string;
  className?: string;
}

export function QuizStepper({ current, total, valueText, className }: QuizStepperProps) {
  return (
    <div className={cn("flex flex-col gap-sm", className)}>
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={Math.max(1, current)}
        aria-valuetext={valueText}
        className="flex w-full gap-xs"
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="h-stepper flex-1 overflow-hidden rounded-full bg-neutral-200"
          >
            <span
              className={cn(
                "block size-full origin-left rounded-full bg-green-600",
                "transition-transform duration-slow ease-smooth",
                i < current ? "scale-x-100" : "scale-x-0",
              )}
            />
          </span>
        ))}
      </div>

      {/* Visible as well as announced. `aria-hidden` because the progressbar above
          already carries the same sentence in `aria-valuetext` — without this it is
          read out twice on every step change. */}
      <span aria-hidden="true" className="font-mono text-eyebrow uppercase text-ink-500">
        {valueText}
      </span>
    </div>
  );
}
