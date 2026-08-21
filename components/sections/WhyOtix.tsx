import { cn } from "@/lib/cn";
import { SectionHeader, type HeadingSegment } from "@/components/SectionHeader";
import { Quiz, type QuizContent } from "@/components/Quiz";

/**
 * WhyOtix — the second `neutral-200` panel. Figma: `WORK` (36:241).
 *
 * ⚠️ **The Figma frame is MISNAMED "WORK"** — it is this section, not the case
 * study grid at 36:148. Long-standing, recorded in CLAUDE.md §3. Measure against
 * 36:241 and do not conflate the two.
 *
 * ⚠️ CONTAINERED (CLAUDE.md §0.1): it paints `neutral-200` at radius 30, so it is
 * inset by the gutter and carries `section-x`. Same shell as Work.
 *
 * ── The card ──────────────────────────────────────────────────────────────────
 * ⚠️ REPLACED 13 Aug. This section used to render the Work section's own `tall`
 * and `featured` cards a second time — so a visitor met Aura Supplements and Miso
 * Kitchen twice on one page, which was the loudest thing making the build read as
 * unfinished.
 *
 * The frame now draws ONE card at 36:266 — 1320 × 650, a 470-wide image at a 5px
 * inset, and an 840-wide panel that Figma leaves empty. That panel is the
 * recommendation quiz (`Quiz`). The geometry lives in tokens: `h-quiz`,
 * `basis-quiz-media`.
 *
 * Header is `align="left"`: eyebrow, heading, body and CTA stacked in one column,
 * which is what the frame shows — unlike Work, whose header splits.
 *
 * ⚠️ The header IS the quiz's invitation now — "Find your fit" / "Not sure which
 * package you need?" — which is what let the quiz's own start screen be cut. Saying
 * the same sentence twice, forty pixels apart, was what made that screen read as a
 * toll booth in front of the questions rather than a way into them.
 */

export interface WhyOtixProps {
  eyebrow: string;
  heading: HeadingSegment[];
  body: string;
  quiz: QuizContent;
  className?: string;
}

export function WhyOtix({ eyebrow, heading, body, quiz, className }: WhyOtixProps) {
  return (
    <section
      id="why-otix"
      className={cn(
        "mx-gutter rounded-3xl bg-neutral-200 px-section-x py-section-y",
        className,
      )}
    >
      <div className="flex flex-col gap-6xl">
        {/* ⚠️ NO `action`. The section's "Start Project" CTA was removed 13 Aug:
            the card directly below it IS the call to action, and a button above
            competes with the thing it introduces. Every other section keeps its
            CTA — this one does not, and that is not an oversight. */}
        <SectionHeader eyebrow={eyebrow} heading={heading} body={body} />

        <Quiz content={quiz} />
      </div>
    </section>
  );
}
