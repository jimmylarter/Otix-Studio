import { cn } from "@/lib/cn";
import { SectionHeader, type HeadingSegment } from "@/components/SectionHeader";
import { StepCard } from "@/components/StepCard";
import { Icon, type IconName } from "@/components/Icon";

/**
 * Process — four steps on a staggered line. Figma: `PROCESS` (36:285).
 *
 * ⚠️ FLUSH (CLAUDE.md §0.1): no surface, `x=0, w=1440`, content at 60.
 *
 * ── The stagger and the connectors ───────────────────────────────────────────
 * Columns 2 and 4 sit 76px lower than 1 and 3 (Figma: padding-top 100 against 24).
 * Three lines run between the circle centres, zig-zagging with them.
 *
 * ⚠️ **The connectors are CURVED, 7px, `neutral-300` (13 Aug).** They were 2px
 * straight `border-divider` hairlines. The curve is a cubic with control points at the
 * midpoint on each end's own y, so it leaves one circle horizontally and arrives at the
 * next horizontally — a route rather than a diagonal.
 *
 * ⚠️ The connectors are a GRID matching the cards' grid — one box per gap, each
 * spanning exactly centre-to-centre. They are NOT one stretched SVG across the row.
 *
 * That was the first attempt and it was wrong in a way that only showed at some
 * widths: a `viewBox="0 0 1320 …"` with `preserveAspectRatio="none"` assumes
 * everything in the row scales with it, but the circle is a FIXED 120 at a FIXED
 * 24 padding — its centre is 84px from its column's left edge at every width.
 * Stretching moved the lines proportionally while the circles stayed put, so they
 * met only at exactly 1320 and drifted apart everywhere else.
 *
 * Matching the grid removes the assumption entirely: each connector's box is
 * `100% + gap` wide, which IS centre-to-centre, and the line runs corner to corner.
 * Its ends land on the two circle centres and are covered by the circles — which
 * is Figma's 22px tuck taken to its conclusion, with no trim arithmetic to drift.
 *
 * ── Responsive (RESPONSIVE_SPEC.md §5.7) ─────────────────────────────────────
 * 4-up at `lg` with the stagger and the connectors · 2-up at `md` · 1-up below.
 * **The connectors are dropped below `lg`, not wrapped** — a rule that continues
 * across a grid wrap draws a line to the wrong neighbour. The stagger goes with
 * them: it only means anything against a continuous line.
 */

export interface ProcessStep {
  icon: IconName;
  title: string;
  description: string;
}

export interface ProcessProps {
  eyebrow: string;
  heading: HeadingSegment[];
  steps: ProcessStep[];
  className?: string;
}

/**
 * The four numbers the connectors are built from. Each must stay in step with the
 * class doing the same job in the markup, since a connector is positioned against
 * the layout rather than measured from it:
 *
 *   PAD      `p-xl` on StepCard
 *   ICON     `h-step-icon` / `w-step-icon`
 *   COL_GAP  `gap-xl` on both grids
 *   STAGGER  `step-stagger`
 */
const PAD = 24;
const ICON = 120;
const COL_GAP = 24;
/**
 * The cards' vertical grid gap — `gap-xl`, mirrored here for the mobile connectors.
 *
 * ⚠️ It is the SAME token as `COL_GAP` and is named separately on purpose: they are two
 * different measurements that happen to share a value today. If the grid's row gap ever
 * differs from its column gap, one of these moves and the other does not.
 */
const ROW_GAP = 24;
/**
 * The connectors' stroke weight, mirroring the desktop `strokeWidth="7"`.
 *
 * ⚠️ **Mirrored, not shared** — the desktop value is an SVG attribute and this is a CSS
 * width, so there is no single place to put it. If the weight changes, change both; the
 * two lines are one device and a mismatch is immediately visible where the layout
 * switches.
 */
const CONNECTOR_W = 7;
const STAGGER = 76;

/**
 * Must match `animation.step-float` in tailwind.config.ts. Used only to space the
 * per-circle delays evenly across one cycle — if the durations disagree the wave
 * simply stops being evenly spaced, which is why this is a named constant rather
 * than a number inline.
 */
const FLOAT_MS = 7000;

export function Process({ eyebrow, heading, steps, className }: ProcessProps) {

  return (
    <section
      id="process"
      className={cn("w-full px-section-x-flush py-section-y-flush", className)}
    >
      <div className="flex flex-col gap-6xl">
        {/* ⚠️ Capped at 80% (13 Aug). This heading is a full sentence, not a
            two-or-three-word display line like Work's or Pricing's, so at full
            width it ran to a measure no one reads comfortably and filled the
            section edge to edge.
            80% and not `max-w-measure`: the cap is PROPORTIONAL, so the heading
            keeps its relationship to the four step columns beneath it at every
            width (CLAUDE.md §0). A ch-based cap would drift against them.
            `lg:` only — below that the column is already narrow enough. */}
        <SectionHeader eyebrow={eyebrow} heading={heading} className="lg:w-4/5" />

        <div className="relative">
          {/*
            Connectors, behind the cards.

            ⚠️ This is a GRID with the same columns and gap as the cards, not one
            stretched SVG. The previous version drew a single `viewBox="0 0 1320 …"`
            with `preserveAspectRatio="none"`, which assumes the row is 1320 wide
            and that everything in it scales. It does not: the circle is a fixed
            120 at a fixed 24 padding, so its centre is a fixed 84px from its
            column's left edge. Stretching the viewBox moved the lines
            proportionally while the circles stayed put, and they only met at
            exactly 1320.

            Matching the grid instead makes each connector's box span exactly
            centre-to-centre — its own column's circle to the next one's — at any
            width, with no measurement.
          */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden gap-xl lg:grid lg:grid-cols-4"
          >
            {steps.slice(0, -1).map((step, i) => {
              const down = i % 2 === 0;
              return (
                <div key={step.title} className="relative">
                  <span
                    className="absolute block"
                    style={{
                      // 84 = padding (24) + circle radius (60): the circle's centre
                      // within its column. Fixed, because the circle is.
                      left: `${PAD + ICON / 2}px`,
                      top: `${PAD + ICON / 2}px`,
                      // Centre-to-centre is one column plus one gap.
                      width: `calc(100% + ${COL_GAP}px)`,
                      height: `${STAGGER}px`,
                    }}
                  >
                    <svg
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      className="size-full overflow-visible"
                    >
                      {/* ══ THE CONNECTOR ═══════════════════════════════════════
                          Corner to corner — so the ends land exactly on the two circle
                          centres and are covered by the circles themselves. That is the
                          tuck, with no trim arithmetic to drift.

                          ⚠️ A CUBIC, NOT A LINE (13 Aug, Jimmy). Control points sit at
                          `x=50` on each end's own y, which gives HORIZONTAL TANGENTS at
                          both circles: the curve leaves one flat, bends once, and
                          arrives flat at the next. That is what makes it read as a
                          route between two points rather than a diagonal with a kink.

                          ⚠️ The tangents are also why the tuck still works. A straight
                          line met the circle at ~40°, so the last few pixels before it
                          disappeared were the visible ones; leaving flat means the ends
                          slide under the circle along its widest axis.

                          ⚠️ `fill="none"` is REQUIRED on a path where it was not on a
                          line — an unfilled `<path>` defaults to black fill, so the
                          S-curve would paint as a solid ink-coloured blob.

                          ⚠️ `preserveAspectRatio="none"` stretches this box (one column
                          + gap wide, 76 tall) non-uniformly, so the curve is squashed
                          vertically. Intentional: the geometry stays centre-to-centre at
                          every viewport with no measurement, and
                          `vector-effect="non-scaling-stroke"` keeps the 5px weight
                          honest through the stretch. */}
                      <path
                        d={`M 0 ${down ? 0 : 100} C 50 ${down ? 0 : 100}, 50 ${down ? 100 : 0}, 100 ${down ? 100 : 0}`}
                        fill="none"
                        vectorEffect="non-scaling-stroke"
                        strokeWidth="7"
                        strokeLinecap="round"
                        /* ⚠️ `neutral-300` (#E4E0D8), the dark cream — up from
                           `border-divider` (#CED6D0), the site's hairline grey.
                           Measured on the page (`neutral-100`): **1.22:1** against the
                           hairline's 1.37:1, so it is FAINTER per pixel and only reads
                           because it is now **7px** rather than 2. Weight and colour
                           moved together; dropping the weight back at this colour would
                           make the connectors all but disappear. Decorative and
                           `aria-hidden`, so no contrast minimum applies.

                           ⚠️ 7 is close to the practical ceiling. The connector is
                           tucked under a 120px circle, so the thicker it gets the more
                           of it shows past the circle's edge on the diagonal approach —
                           the horizontal tangents are what buy the headroom, and they
                           are already being spent. */
                        className="stroke-neutral-300"
                      />
                    </svg>
                  </span>
                </div>
              );
            })}
          </div>

          {/* ══ VERTICAL CONNECTORS — BELOW `md` ONLY ═══════════════════════════
              ⚠️ **RESTORED FOR MOBILE (Jimmy, 13 Aug), and they are a different shape
              from the desktop ones.** Those are curved cubics running diagonally
              between staggered circles; these are plain straight rules running DOWN a
              single column. Same colour and weight so they read as the same device.

              ⚠️ **A `<div>`, not an `<svg>`.** A straight vertical line needs no path,
              and a border-box rule scales with no `preserveAspectRatio` maths and no
              `non-scaling-stroke`. The desktop connectors are SVG only because they
              curve.

              ⚠️ **`md:hidden` — SINGLE COLUMN ONLY.** At `md` the grid is 2-up, and a
              rule that continues across a grid wrap draws a line to the wrong
              neighbour. That is the same reason the desktop connectors are dropped
              below `lg`; this is the mirror of it, not a new rule.

              ⚠️ It matches the CARDS' grid exactly — one box per gap, `steps.length - 1`
              of them — so each connector's own box IS one row plus one gap, and the
              line simply spans it. Measuring card heights would have been the
              alternative, and they vary per step.

              ⚠️ Geometry, all from the constants above: the line sits at the circle's
              centre (`PAD + ICON / 2` from the left, matching `StepCard`'s `p-xl` and
              the 120px disc) and runs from that same centre height down through the
              row gap into the next circle. Both ends are covered by the discs, which
              carry `z-10` for exactly this.

              ⚠️ `-z-10` on the layer: it must sit BEHIND the cards, or the line crosses
              the copy of any card whose text runs long. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 grid gap-xl md:hidden"
          >
            {steps.slice(0, -1).map((step) => (
              <div key={step.title} className="relative">
                <span
                  className="absolute block -translate-x-1/2 rounded-full bg-neutral-300"
                  style={{
                    left: `${PAD + ICON / 2}px`,
                    top: `${PAD + ICON / 2}px`,
                    width: `${CONNECTOR_W}px`,
                    // Centre-to-centre down the column is one row plus one gap — the
                    // same arithmetic the horizontal connectors use, turned 90°.
                    height: `calc(100% + ${ROW_GAP}px)`,
                  }}
                />
              </div>
            ))}
          </div>

          <div className="relative grid gap-xl md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <StepCard
                key={step.title}
                icon={<Icon name={step.icon} className="h-step-glyph w-step-glyph" />}
                title={step.title}
                description={step.description}
                // Each circle starts a quarter-cycle further along than the last,
                // so the row reads as one wave travelling through it rather than
                // four things bobbing in unison. Negative, so they begin already
                // spread out instead of all rising together on load.
                floatDelayMs={-i * (FLOAT_MS / steps.length)}
                // Stagger only where the connectors exist to justify it.
                className={cn(i % 2 === 1 && "lg:mt-step-stagger")}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
