import { cn } from "@/lib/cn";
import { SectionHeader, type HeadingSegment } from "@/components/SectionHeader";
import { StatChart, type ChartSeries } from "@/components/StatChart";

/**
 * About — copy left, chart right. Figma: `ABOUT` (36:89).
 *
 * ⚠️ FLUSH, not containered (CLAUDE.md §0.1). About paints no surface — it sits
 * directly on the page background — so it is full-bleed and carries the whole 60px
 * itself. Figma confirms: the section is `x=0, w=1440` and `Section Title` starts
 * at x=60, where a containered section would be `x=10, w=1420` with content at 50.
 *
 * This shipped as `section-x` (50) first, which put the copy 10px inboard of every
 * other section on the page. The variant is decided by the SURFACE, not by whether
 * the section is the Hero.
 *
 * ⚠️ Two things in the Figma frame are NOT built, both on Jimmy's call (12 Aug):
 *   · the frame's heading reads "We don't just build websites. We build growth
 *     engines." — the existing "Design. Build. Dominate." is kept instead, so
 *     here the design is the stale side, not `content.ts`
 *   · the six-pill row and the photo are gone from v2 entirely
 *
 * The chart is `StatChart`, designed rather than exported — the one in the frame
 * is a placeholder. It was D3's single deferred component; it is now built.
 *
 * ── Responsive (RESPONSIVE_SPEC.md §5.2) ─────────────────────────────────────
 * Two columns at `lg`, stacked below it. The copy column is `max-w-measure` so it
 * never runs past a comfortable line length even when it has the full width to
 * itself — the one width cap CLAUDE.md §0 allows.
 */

export interface AboutProps {
  eyebrow: string;
  heading: HeadingSegment[];
  body: string;
  chart: {
    caption: string;
    stat: { value: number; suffix?: string; label: string };
    labels: string[];
    series: [ChartSeries, ChartSeries];
  };
  className?: string;
}

export function About({ eyebrow, heading, body, chart, className }: AboutProps) {
  return (
    <section
      id="about"
      className={cn("w-full px-section-x-flush py-section-y-flush", className)}
    >
      {/* `items-center` rather than `items-start`: the chart is shorter than the
          copy block, and hanging it from the top left it visually falling out of
          the section. `gap-col` is the token for exactly this gap. */}
      <div className="flex flex-col gap-block lg:flex-row lg:items-center lg:gap-col">
        <SectionHeader
          eyebrow={eyebrow}
          heading={heading}
          body={body}
          className="lg:w-1/2 lg:shrink-0"
        />

        <StatChart
          series={chart.series}
          labels={chart.labels}
          stat={chart.stat}
          caption={chart.caption}
          className="lg:flex-1"
        />
      </div>
    </section>
  );
}
