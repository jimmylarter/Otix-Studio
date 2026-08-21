"use client";

import { useRevealed } from "@/lib/useRevealed";
import { cn } from "@/lib/cn";

/**
 * StatChart — the growth graphic in About.
 *
 * ⚠️ DESIGNED, NOT EXPORTED. The Figma frame has a placeholder chart and the brief
 * was to beat it. Do not "correct" this back toward the frame.
 *
 * Paired bars in tracks, a trend line that CHASES up the primary series with a dot
 * landing on each peak as it passes, value labels, and a stat card that pops inside
 * the plot once the line arrives.
 *
 * ── The geometry problem, and why there is no `gap` between columns ───────────
 * The dots and the line have to sit exactly on the primary bar. Dots are DOM (a
 * circle in a stretched SVG would be squashed into an ellipse) and the line is
 * SVG (CSS cannot draw between points), so two different systems have to agree on
 * one x position.
 *
 * They can only agree if the columns tile the plot EXACTLY. A flex `gap` breaks
 * that: with gaps, column centres are no longer `(i + 0.5) / n` of the width, and
 * the line drifts a few px off the bars — worse at some widths than others, which
 * is the kind of bug that looks like a rendering glitch.
 *
 * So columns are `flex-1` with **no gap**, and all spacing is percentages INSIDE
 * each column. Every position below derives from these four numbers, which is why
 * they are constants and not literals sprinkled through the markup.
 *
 * ── Motion (MOTION_SPEC.md §5.1a) ─────────────────────────────────────────────
 * Bars fill on a stagger → the line draws left to right, chasing them → each dot
 * pops exactly as the line reaches it → the stat card lands and its number counts
 * up. The dot delays are derived from the line's duration, so the two cannot drift
 * apart if either is retimed.
 *
 * Reduced motion is covered on three independent paths: `useRevealed` reveals
 * immediately, the global rule (§7.2) drops `height`/`transform` from the
 * transition list, and the counter short-circuits to its final value.
 */

export interface ChartSeries {
  label: string;
  values: number[];
}

export interface StatChartProps {
  /** Exactly two. The first is primary: it drives the trend line and the stat. */
  series: [ChartSeries, ChartSeries];
  labels: string[];
  /**
   * The stat disc. ⚠️ AUTHORED, not derived from `series` — it used to be computed
   * from the first and last primary value so it could never contradict the bars.
   * That guarantee is gone; the figures are illustrative, but if they ever become
   * real numbers this should go back to being derived.
   */
  stat: { value: number; suffix?: string; label: string };
  /** Read by screen readers in place of the graphic. */
  caption: string;
  className?: string;
}

/* Column-internal geometry, as percentages of one column. See the note above. */
const BAR_W = 34;
const BAR_GAP = 10;
const PAIR_INSET = (100 - (BAR_W * 2 + BAR_GAP)) / 2;
/** Centre of the primary bar within its column — where the line and dots land. */
const PRIMARY_CX = PAIR_INSET + BAR_W / 2;
const SECOND_CX = PAIR_INSET + BAR_W + BAR_GAP + BAR_W / 2;

/**
 * Where the stat disc sits, in COLUMN UNITS from the left — 1.7 is a little left
 * of the Feb|Mar seam. Kept in column units rather than a raw percentage so it
 * holds its place against the bars if the series gains or loses a month.
 */
const DISC_SEAM = 1.7;
/**
 * How far down the plot the disc sits, as a % of plot height. A percentage rather
 * than a fixed offset so it keeps the same relationship to the bars as the plot
 * shrinks — a px offset would eat a much bigger share of a 220px mobile plot than
 * of a 320px desktop one.
 */
const DISC_TOP = 12;

/* Choreography, ms. */
/**
 * ⚠️ 64, DOWN FROM 80 (13 Aug, Jimmy: the graph should "grow slightly quicker"). It is
 * multiplied by the column index, so it compounds — with six columns the last bar used
 * to start 400ms after the first and now starts 320ms after it. The stagger is what
 * makes the bars read as a series rising rather than a block appearing, so it is
 * shortened rather than removed.
 *
 * ⚠️ It pairs with `duration-slow` (420ms, down from `duration-measured`'s 560) on the
 * bars themselves. Both had to move: a shorter stagger with the same long duration just
 * overlaps the bars more without making any single one feel faster.
 */
const BAR_STAGGER = 64;
const LINE_DELAY = 260;
const LINE_MS = 900;
/**
 * When the stat disc pops.
 *
 * ⚠️ IT NO LONGER WAITS FOR THE LINE TO FINISH. It was `LINE_DELAY + LINE_MS + 120` —
 * **1280ms**, a strict queue where nothing overlapped and the disc arrived after
 * everything else had settled. Then 45% of the wipe (665ms), now **25%** — Jimmy,
 * 13 Aug: "can come in slightly sooner as well".
 *
 * At 0.25 it lands at **485ms**, a quarter of the way through the line's travel. The
 * overlap is the point: the disc sits over the SHORT EARLY BARS, which are drawn by
 * ~400ms, so it has its space without waiting for the far end of the chart to catch up.
 * A queue reads as slow even when nothing in it is.
 *
 * ⚠️ It cannot go much below 0.2 — before that the bars underneath it are still
 * growing, and a disc popping onto something mid-move reads as a collision rather than
 * as an arrival.
 *
 * ⚠️ Expressed as a FRACTION of the wipe rather than a fixed number, so it keeps its
 * relationship if `LINE_MS` moves.
 */
const CARD_DELAY = LINE_DELAY + LINE_MS * 0.25;
/**
 * ⚠️ `COUNT_MS` WAS HERE AND IS DELETED (13 Aug). It was the count-up's duration —
 * 1100, then 900 when the disc started arriving earlier. The counter itself is gone;
 * see the note where its effect used to be.
 */

/**
 * Smooth path through the peaks — Catmull-Rom converted to cubic Béziers.
 *
 * ⚠️ It must pass through EVERY point exactly, because a DOM dot is sitting on
 * each one. An earlier version used midpoint quadratics, which only approximate
 * the points — the curve slid off the dots and left visible gaps between the two.
 * Catmull-Rom interpolates rather than approximates, so the line and the dots
 * cannot disagree.
 *
 * Control points are the neighbour delta over 6 — the standard conversion, and
 * the /6 is what keeps the curve from overshooting into loops on steep changes.
 */
function smoothPath(points: Array<{ x: number; y: number }>) {
  if (points.length < 2) return "";
  const f = (n: number) => n.toFixed(3);
  let d = `M ${f(points[0].x)} ${f(points[0].y)}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    d +=
      ` C ${f(p1.x + (p2.x - p0.x) / 6)} ${f(p1.y + (p2.y - p0.y) / 6)}` +
      ` ${f(p2.x - (p3.x - p1.x) / 6)} ${f(p2.y - (p3.y - p1.y) / 6)}` +
      ` ${f(p2.x)} ${f(p2.y)}`;
  }
  return d;
}

export function StatChart({ series, labels, stat, caption, className }: StatChartProps) {
  const { ref, has } = useRevealed("0px 0px -20% 0px");
  const shown = has(0);

  const [primary, secondary] = series;
  const n = primary.values.length;
  // Headroom above the tallest bar so the dots, labels and card have somewhere to
  // live. Without it the peak dot is clipped by the plot's top edge.
  const max = Math.max(...primary.values, ...secondary.values) * 1.18;

  const points = primary.values.map((v, i) => ({
    x: ((i + PRIMARY_CX / 100) / n) * 100,
    y: 100 - (v / max) * 100,
  }));

  /**
   * ⚠️ **THE COUNT-UP IS GONE (Jimmy, 13 Aug) — the figure renders at its value.**
   * It ran 0 → 60 on an rAF over `COUNT_MS`, starting when the disc landed.
   *
   * Two things it cost, and the second is the real one:
   *
   * · It made the disc's ENTRANCE compete with itself. The pop and the ticking number
   *   are both asking to be watched, in the same 40px circle, at the same moment —
   *   so neither won, and the pop was the half that mattered.
   * · **It put a rAF loop and a timeout in a component that otherwise has none.** rAF
   *   does not fire in a backgrounded tab; the reduced-motion branch and the cleanup
   *   existed only to make that safe. Removing the counter removed `useState`,
   *   `useRef`, `useEffect` and the whole React import from this file.
   *
   * The stat is now static content, which is also what it always was — a fact about
   * the studio, not a live reading.
   */

  return (
    <figure ref={ref} className={cn("flex w-full flex-col gap-lg", className)}>
      {/* `data-reveal` must be on a real box inside the figure — the hook searches
          descendants, and `display: contents` has no box for the observer. */}
      <div data-reveal={0} className="flex flex-col gap-lg">
        <div className="relative h-chart w-full">
          {/* Columns. NO GAP — see the note above. */}
          <div className="absolute inset-0 flex items-end">
            {labels.map((label, i) => (
              <div key={label} className="relative h-full flex-1">
                {series.map((s, si) => {
                  const pct = ((s.values[i] ?? 0) / max) * 100;
                  return (
                    <span
                      key={s.label}
                      aria-hidden="true"
                      className="absolute bottom-0 rounded-full bg-green-50"
                      style={{ left: `${si === 0 ? PAIR_INSET : PAIR_INSET + BAR_W + BAR_GAP}%`, width: `${BAR_W}%`, height: "100%" }}
                    >
                      {/* Track wraps the bar, so the fill can never escape it. */}
                      <span
                        className={cn(
                          "absolute inset-x-0 bottom-0 rounded-full",
                          si === 0 ? "bg-green-700" : "bg-green-200",
                          /* ⚠️ `duration-slow` (420), down from `duration-measured`
                             (560) — see `BAR_STAGGER`, which moved with it. */
                          "transition-size duration-slow ease-out-expo",
                        )}
                        style={{
                          height: shown ? `${pct}%` : "0%",
                          transitionDelay: `${i * BAR_STAGGER + si * 40}ms`,
                        }}
                      />
                    </span>
                  );
                })}

              </div>
            ))}
          </div>

          {/* The chasing line. Sits ABOVE the bars and BELOW the dots, which is why
              it is its own layer between them rather than living inside the columns.

              ⚠️ It draws with a CLIP WIPE, not `stroke-dashoffset`. The dash route
              is broken here: `vector-effect="non-scaling-stroke"` resolves dash
              lengths in SCREEN units while `pathLength="1"` normalises in USER
              units, and the two disagreeing is what rendered the line as dashes
              with real gaps in it. A wipe has no such interaction, and reveals
              strictly left-to-right, which is what "chasing" needs anyway.

              ⚠️ `ease-linear`, deliberately. The dots are timed off their own x
              position as a fraction of the wipe's duration, and that arithmetic is
              only true if the wipe travels at CONSTANT SPEED. Under `ease-out-expo`
              the wipe covered 90% of the width in the first third of its duration,
              so every dot arrived long after the line had passed it. Linear also
              reads better here — a pen drawing at a steady rate. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 transition-clip duration-slowest ease-linear"
            style={{
              clipPath: shown ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
              transitionDelay: `${LINE_DELAY}ms`,
            }}
          >
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="size-full overflow-visible"
            >
              <path
                d={smoothPath(points)}
                fill="none"
                vectorEffect="non-scaling-stroke"
                strokeWidth="2"
                strokeLinecap="round"
                className="stroke-border-divider"
              />
            </svg>
          </span>

          {/* Dots, on their own layer so they land ON TOP of the line — that is
              what lets the white ring read as a halo rather than a break. Same
              column maths as the bars, so they sit exactly on the path. */}
          <div className="pointer-events-none absolute inset-0 flex">
            {labels.map((label, i) => (
              <div key={label} className="relative h-full flex-1">
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute h-chart-dot w-chart-dot -translate-x-1/2 translate-y-1/2 rounded-full",
                    "border-2 border-neutral-0 bg-border-divider",
                    "transition-reveal duration-base ease-cta-expand",
                    shown ? "scale-100 opacity-100" : "scale-0 opacity-0",
                    i === n - 1 && "scale-150",
                  )}
                  style={{
                    left: `${PRIMARY_CX}%`,
                    bottom: `${((primary.values[i] ?? 0) / max) * 100}%`,
                    // Timed off the dot's OWN x position, not its index — so each
                    // one pops exactly as the wipe passes it. See the note on
                    // `ease-linear` above: this arithmetic only holds because the
                    // wipe travels at constant speed.
                    transitionDelay: `${LINE_DELAY + (points[i].x / 100) * LINE_MS}ms`,
                  }}
                />
              </div>
            ))}
          </div>

          {/* The stat disc, INSIDE the plot over the short early bars — the one
              region a rising series leaves empty. That is what makes it part of the
              graphic rather than a caption sitting above it.

              A circle on `gradient-green` with `shadow-elevated`, deliberately the
              same object family as the Process `step-icon` — the site already has
              a language for "a number in a green disc" and this joins it.

              It OVER-EXPANDS on arrival: `scale-50 → 100`.

              ⚠️ **`ease-out-back`, UP FROM `ease-cta-expand` (13 Aug, Jimmy: "more of
              an elastic expand, it really needs to pop").** Both overshoot; the
              difference is how far. Measured, `cta-expand` peaks at **1.098** and
              `out-back` at **1.221** — more than twice the overshoot. On a
              `scale-50 → 100` move that is the disc topping out at **1.11× its final
              size** against 1.05× before, which is the difference between a spring and
              a nudge.

              ⚠️ It is NOT a new curve: `out-back` is already the site's elastic settle,
              used by the CTA badge returning on roll-off and the label snapping to
              centre. The disc now joins that language instead of borrowing the milder
              expand curve.

              ⚠️ **`duration-slow` (420), UP FROM `duration-base` (280).** Counter to
              instinct, and the reason is that an overshoot needs TIME TO BE SEEN: the
              spring past 1 and back is roughly the last third of the curve, which at
              280ms is about 90ms and at 420 is about 140. Below ~250 a big overshoot
              stops reading as elastic and starts reading as a flicker.

              ⚠️ The pop is now the disc's ONLY job. The count-up that used to run
              inside it is gone — two things asking to be watched in one 40px circle
              meant neither won. */}
          <div
            className={cn(
              "absolute flex h-stat-badge w-stat-badge flex-col items-center justify-center gap-xxs",
              "-translate-x-1/2 rounded-full bg-gradient-green text-center shadow-elevated",
              "transition-reveal duration-slow ease-out-back",
              shown ? "scale-100 opacity-100" : "scale-50 opacity-0",
            )}
            style={{
              // Positioned in column units — see DISC_SEAM. Derived from the
              // column count so it holds its place if the series changes length.
              left: `${(DISC_SEAM / n) * 100}%`,
              top: `${DISC_TOP}%`,
              transitionDelay: `${CARD_DELAY}ms`,
            }}
          >
            {/* `stat-badge` — its own token, sized and weighted for this disc.
                See tailwind.config.ts for why it is not `h4` or `stat-display`.

                The trailing `+` follows the TierCard price lockup: a smaller
                `stat-symbol` in the secondary green, sitting on the figure's
                BASELINE via `items-end`. Aligning it to the box instead would let
                it drift as the numeral's size changes with the viewport. */}
            <p className="flex items-stretch gap-xxs" aria-label={`${stat.value}${stat.suffix ?? ""}+`}>
              <span aria-hidden="true" className="text-stat-badge tabular-nums text-neutral-0">
                {stat.value}
                {stat.suffix}
              </span>
              <span aria-hidden="true" className="flex items-end text-stat-symbol text-green-300">
                +
              </span>
            </p>
            <span className="text-body-sm text-green-100">{stat.label}</span>
          </div>
        </div>

        {/* Same `flex-1` and no gap as the columns, so labels centre for free. */}
        <div className="flex">
          {labels.map((label) => (
            <span key={label} className="flex-1 text-center text-body-sm text-ink-600">
              {label}
            </span>
          ))}
        </div>

        {/* Key, centred beneath the chart. Swatches are dots, matching the peak
            markers rather than the bars — the dots are the thing the eye has just
            been following. `flex-wrap` so it stacks rather than crushes on a
            phone. */}
        <div className="flex flex-wrap items-center justify-center gap-x-2xl gap-y-sm">
          {series.map((s, i) => (
            <span key={s.label} className="flex items-center gap-sm text-body-sm text-ink-600">
              <span
                aria-hidden="true"
                className={cn(
                  "h-chart-dot w-chart-dot rounded-full",
                  i === 0 ? "bg-green-600" : "bg-green-200",
                )}
              />
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <figcaption className="sr-only">{caption}</figcaption>
    </figure>
  );
}
