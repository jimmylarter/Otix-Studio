"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/Icon";

/**
 * ServiceNumerals — the oversized 01…06 timeline down the left of Services.
 * Figma: `Number container` (570×740) inside `SERVICES - 01…06`.
 *
 * The six Figma panels are REST STATES of one continuous reel, not six separate
 * layouts. Each shows a hairline, the active numeral, another hairline, then the
 * next numeral ghosted below. Scrolling slides the whole column upward so each
 * numeral rises into the active slot as the one before it leaves — the timeline
 * reading Jimmy asked for.
 *
 * ── Everything is `em`, nothing is px ─────────────────────────────────────────
 * The window, the pitch, the rule and the gaps are all multiples of the numeral's
 * own font size, which is the fluid `text-numeral` token. So the entire column
 * scales with the type at any viewport with no measurement, no resize listener and
 * no JS layout reads — the scroll handler only ever sets one number.
 *
 * Proportions, taken from the design (÷200, the numeral size):
 *   rule  120 -> 0.6em  ·  gap 16 -> 0.08em  ·  numeral 200 -> 1em
 *   pitch = 0.08 + 0.6 + 0.08 + 1 = 1.76em   (numeral centre to numeral centre)
 *
 * These are COMPOSITION proportions for one bespoke arrangement, not reusable
 * design tokens — same reasoning as `HeroArch`. Pushing them into the global scale
 * would pollute it for no reuse.
 *
 * ⚠️ The design's pitch is 327px (its "next" numeral is genuinely 150px, so it
 * occupies less layout). Here the smaller numeral is a `scale` TRANSFORM, which
 * does not affect layout, so the pitch is a constant 352px (1.76em). That is
 * deliberate: a constant pitch makes the reel move linearly with scroll. A pitch
 * that changed with the numeral's size would make the column drift and stutter.
 *
 * ── One colour, not two ───────────────────────────────────────────────────────
 * The design draws the active numeral in `accent-numeral` (#9CB0A8) and the next
 * one in the divider grey (#D3DAD5). Those are not really two colours: #9CB0A8 at
 * 45% over the warm page resolves to ≈#CED6D2, i.e. the divider grey. So this
 * interpolates ONE token's opacity and gets both design states exactly — which is
 * also the only way to render the continuous positions in between.
 *
 * The top and bottom fades are a mask over the whole column, which is what the
 * design approximates with a gradient fill on the first rule and the last numeral.
 * As a mask it applies to numerals and rules alike and needs no per-item state.
 *
 * ── Reduced motion (CLAUDE.md §5) ─────────────────────────────────────────────
 * The reel snaps to whole indices instead of gliding. The section still works —
 * you still see which service you are on — without a continuously moving element.
 */

/**
 * Slot to slot, in ems of the column's own type size.
 *
 * ⚠️ 2.2, up from the numerals' 1.76 (13 Aug), and it is ARITHMETIC not taste. A slot
 * has to hold everything stacked inside it:
 *
 *     RULE 0.6  +  GAP 0.2 above  +  GAP 0.2 below  +  glyph 1.0  =  2.0em
 *
 * At 1.76 that overflowed by 0.24em, which is why the rules ended up touching the
 * icons the moment `GAP` was raised. The numerals got away with 1.76 because a
 * numeral's glyph is far shorter than its em box; an icon fills its box exactly.
 *
 * ⚠️ **If `GAP`, `RULE` or the glyph size changes, check this sum again.** 2.2 leaves
 * 0.2em of slack. It is safe to grow — the reel still moves exactly one slot per unit
 * of progress, so a larger pitch only spaces the column out.
 */
const PITCH = 2.2;
/** Hairline between numerals. */
const RULE = 0.6;
/** Space either side of a rule. */
const GAP = 0.2;

/**
 * How far an off-centre glyph shrinks, as a fraction of its size.
 *
 * ⚠️ The numerals this column used to hold did not need it — type reads as smaller
 * simply by being further from the read line. An icon has a hard silhouette and does
 * not, so without this the entering and leaving glyphs sat at exactly the weight of
 * the active one and the column had no focus.
 */
const OFF_CENTRE_SHRINK = 0.3;
/**
 * Window height, in the same ems. Two pitches shows the active numeral, the one
 * arriving below it, and the tail of the one leaving above.
 */
const WINDOW = PITCH * 2;
/**
 * Where the active numeral sits in the window. The design puts it at 290/740 —
 * above centre, because the incoming numeral needs more room beneath it than the
 * outgoing one needs above.
 *
 * ⚠️ Both of these were briefly changed — window to `h-service-panel`, this to
 * 0.5 — to make the two columns fade identically. Reverted 12 Aug: matching the
 * copy column's geometry threw the numerals out of alignment, which is the more
 * visible problem of the two. The columns therefore have DIFFERENT window heights
 * and read lines by design; the shared `REEL_MASK` keeps the fade shape consistent
 * but it will not resolve to the same pixel distance on both sides.
 */
const ACTIVE_LINE = 0.39;

/**
 * The top/bottom fade, shared with the copy column in `sections/Services.tsx`.
 *
 * ⚠️ EXPORTED ON PURPOSE. The two columns are one gesture, and when each carried
 * its own stops they faded at visibly different moments. One constant means they
 * cannot drift again — if you retune the fade, both sides move together.
 */
export const REEL_MASK =
  "linear-gradient(to bottom, transparent 0%, #000 18%, #000 62%, transparent 100%)";

export interface ServiceNumeralsProps {
  /**
   * One icon per slot, in order — the same glyphs the cards used to carry.
   *
   * ⚠️ WAS `numerals: string[]` UNTIL 13 AUG. The column showed `01`…`07`; it now
   * shows the service icons at the same size, and the cards no longer carry one.
   *
   * ⚠️ **THIS COMPONENT IS NOW MISNAMED** and should become `ServiceReel`. The rename
   * is not done here because the agent sandbox cannot delete files, so a rename would
   * leave `ServiceNumerals.tsx` orphaned beside its replacement — worse than a name
   * that is merely out of date. CLAUDE.md §3: frame name = component name = file name.
   */
  icons: IconName[];
  /**
   * Continuous position in the list — 0 = first numeral centred, 1.5 = halfway
   * between the second and third. Driven by scroll progress by the section.
   */
  progress: number;
  /**
   * The largest value `progress` will reach, when that is MORE than the numerals
   * can account for. Defaults to `numerals.length - 1`.
   *
   * ⚠️ It exists because the reel has a slot the numerals deliberately do not label
   * — panel 07, the quiz card. Without it, `progress` is clamped to the last numeral
   * and the column parks on "06" while panel 07 is centred beside it, so a card that
   * is not a service sits next to a number that says it is the sixth one. Passing
   * the real travel lets the column keep sliding and simply run empty, which is the
   * honest answer.
   */
  travel?: number;
  className?: string;
}

export function ServiceNumerals({ icons, progress, travel, className }: ServiceNumeralsProps) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const last = Math.max(travel ?? icons.length - 1, 0);
  const raw = Math.min(Math.max(progress, 0), last);
  const p = reduced ? Math.round(raw) : raw;

  /**
   * ⚠️ NO trailing ghost, and the reel now has a REAL seventh slot that still does
   * not get one. The Figma frames carry an "07" that is not a service; an earlier
   * build rendered a continuation for the same reason and it was removed 12 Aug.
   * When the quiz card became panel 07 on 13 Aug it was briefly numbered, and that
   * was reverted the same day — it is not the seventh service, it is the thing after
   * the services, and numbering it said otherwise.
   *
   * So the column holds six numerals and travels seven slots (see `travel`): as the
   * quiz card arrives, the numerals simply run out. **The reel ends at the last real
   * service** even though the section does not.
   */
  const items = icons;

  return (
    <div
      className={cn("relative overflow-hidden text-numeral", className)}
      style={{
        height: `${WINDOW}em`,
        // Fades the column out top and bottom. A mask rather than per-item
        // opacity so the rules fade identically to the numerals.
        maskImage: REEL_MASK,
        WebkitMaskImage: REEL_MASK,
      }}
    >
      <div
        className="absolute inset-x-0"
        style={{
          // Park slot 0's centre on the active line, then slide by whole pitches.
          top: `calc(${ACTIVE_LINE * 100}% - ${PITCH / 2}em)`,
          transform: `translateY(${-p * PITCH}em)`,
        }}
      >
        {items.map((n, i) => {
          // Distance from the active slot, capped at 1: beyond one step away
          // everything looks the same and the mask has hidden it anyway.
          const d = Math.min(Math.abs(i - p), 1);
          return (
            <div
              key={n}
              className="flex flex-col items-center justify-end"
              style={{ height: `${PITCH}em` }}
            >
              <span
                aria-hidden="true"
                /* ⚠️ `green-600`, matching the numerals they sit between — they are
                   one element of the composition, not a divider between two. It went
                   `border-divider` → `border-on-dark` → here on 13 Aug: the divider
                   grey is a LIGHT-GROUND hairline and vanishes on the gradient, and
                   white @20% read as a UI rule rather than as part of the numeral
                   column. */
                className="w-px shrink-0 bg-green-600"
                style={{ height: `${RULE}em`, margin: `${GAP}em 0` }}
              />
              {/* ⚠️ SIZED IN `em`, NOT A TOKEN. The column carries `text-numeral`
                  (clamp 100 → 200) and everything else here — the pitch, the gap, the
                  rule — is already expressed in `em` against it. `1em` therefore makes
                  the glyph exactly the size the numeral it replaced was, at every
                  viewport, with one value governing both.

                  ⚠️ A fixed 50px token was tried and reverted the same day — that was
                  a misread of a note meant for the card TITLE, not for these.

                  ⚠️ `green-600`, and it is a tighter call than it looks. The ground is
                  `gradient-services`, green-900 → green-950: anything at or below
                  green-700 matches the ramp's own top and disappears there, and
                  anything above green-500 stops being a background mark and starts
                  competing with the cards.

                  Decorative — the card beside it names the service, so an accessible
                  name here would only repeat it (CLAUDE.md §5). */}
              <Icon
                name={n}
                className="shrink-0 text-green-600"
                /* ⚠️ `d` is the distance from the read line, 0…1 — the same value the
                   rules' colour interpolates on, so the glyph and its rule dim and
                   shrink together rather than on two curves. */
                style={{
                  width: "1em",
                  height: "1em",
                  transform: `scale(${1 - OFF_CENTRE_SHRINK * d})`,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
