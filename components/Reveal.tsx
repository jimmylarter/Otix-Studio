"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Reveal — fades and rises its child once, as it scrolls into view.
 *
 * ⚠️ **A NEW COMPONENT, flagged per CLAUDE.md §3** — but not an invented one. It is the
 * **D8 application step** that MOTION_SPEC §5.1 explicitly deferred: the hook and the
 * keyframe were built in D4/D6, and §5.1 says "D8 decides which blocks get `data-reveal`
 * and in what order". This is that decision made reusable rather than pasted into each
 * section.
 *
 * ── Why it observes itself rather than using `useRevealed` ────────────────────
 * `useRevealed` is a CONTAINER hook: one ref watches many `[data-reveal]` descendants
 * and answers `has(i)`. That shape is right when one component coordinates several of
 * its own internal beats — `StatChart` uses it exactly that way, and should keep it.
 *
 * It is the wrong shape here. The cards it wraps live in a SERVER component tree, so
 * there is no client parent to hold the ref or hand `has(i)` down, and forcing one would
 * mean making whole sections client components to animate their children.
 *
 * ⚠️ **This is deliberately a second mechanism, not a replacement.** Recorded rather
 * than quietly duplicated: if a third case turns up, the two should be consolidated into
 * one API — probably this one, with the hook kept only for internal choreography.
 *
 * ── The motion ────────────────────────────────────────────────────────────────
 * Fade + rise, the site's existing reveal language (`@keyframes reveal` in
 * `globals.css`), expressed as a TRANSITION rather than an animation so it can be
 * driven by state and staggered per instance.
 *
 * ⚠️ **`ease-standard` over `duration-measured` (560ms).** The run: `out-expo`/900 (a
 * snap) → `smooth`/1200 (slow) → `smooth`/640 (right speed, not smooth) →
 * `standard`/640 (smooth, a shade slow) → **`standard`/560**.
 *
 * ⚠️ The last step is a TRIM, not a correction — 640 → 560 is one rung on the scale and
 * about 13%. The curve was already right; easing in costs a little apparent pace at the
 * front, and this gives it back without touching what made it smooth.
 *
 * ⚠️ **THE ABRUPTNESS WAS THE START VELOCITY, NOT THE SPEED.** `smooth` is an ease-OUT:
 * it begins at full pace and decelerates, covering **14.4% of the travel in the first
 * 5%** of the duration. However long you make it, the card still *snaps into motion* —
 * which is what "not smooth" means here. `standard` eases in as well as out: 0.6% in
 * that same window. The card gathers pace instead of appearing to be thrown.
 *
 * ⚠️ It costs almost nothing in perceived speed, because the two curves converge by the
 * halfway mark (87% vs 78%) and are level by 75%. Only the first fifth differs, which
 * is exactly the part that was reading as harsh.
 *
 * ⚠️ **640 is "natural", 1200 is "cinematic", and a reveal is not a set piece.** A card
 * entering the viewport should catch up with the scroll, not perform. The reader is
 * already moving; anything that takes longer than the scroll gesture itself feels like
 * it is holding them up.
 *
 * The curves, measured as the fraction of the move completed at each fraction of the
 * duration:
 *
 *       curve           5%    10%    25%    50%    75%
 *       out-expo             49%    83%    97%   100%     ← pass 1
 *       smooth       14.4%   27%    58%    87%    98%     ← passes 2–3
 *       standard      0.6%    3%    24%    78%    96%     ← is (passes 4–5)
 *
 * `out-expo` puts **83% of the travel into the first quarter**, so at 900ms the visible
 * motion was over in about 225ms and the remaining 675 were spent on four invisible
 * pixels. Both of the others spread it properly; the difference between them is entirely
 * at the front.
 *
 * ⚠️ **THE THREE COMPLAINTS MAP TO THREE DIFFERENT PROPERTIES**, which is the whole
 * lesson of this component:
 *
 *       "too quick"    → the CURVE's front-loading (and a stagger that never ran)
 *       "too slow"     → the DURATION
 *       "not smooth"   → the CURVE's START VELOCITY
 *       "1 by 1"       → the STAGGER's grouping, which is the CALLER's decision
 *       "starts late"  → the observer's ROOT MARGIN, not the delay
 *
 * A long duration does not make a slow move, and a slow move is not a smooth one. The
 * duration decides how much time there is; the curve decides how it is spent AND how the
 * motion begins. Reaching for the duration first is the instinct every time and it was
 * right exactly once out of three.
 *
 * ⚠️ **32px of travel (`translate-y-3xl`)**, up from the keyframe's 16 and back down
 * from 40. 16 is right for a paragraph; on a 500px card it is barely perceptible. 40
 * belonged to the 1200ms version — **distance and duration move together**, and 40 over
 * 640ms reads as a lurch where 40 over 1200 read as a drift.
 *
 * ⚠️ **NO SCALE.** A card that grows into place fights `Card`'s own hover mechanic,
 * which animates the media's real dimensions — the two read as the same gesture and the
 * eye cannot tell which one it caused.
 *
 * ── The blur ──────────────────────────────────────────────────────────────────
 * ⚠️ **`blur-reveal` (6px) → sharp, ON THE SAME TRANSITION as the fade and rise.** This
 * is what makes the card read as RESOLVING INTO PLACE rather than sliding into place —
 * a fade+rise is a card moving, a fade+rise+sharpen is a card coming into focus.
 *
 * ⚠️ It is in the site's language already: the Services orbit uses blur for distance,
 * so "out of focus" consistently means "not the thing you are looking at yet".
 *
 * ⚠️ **A REAL FILTER, NOT A BACKDROP ONE.** It blurs the card's own type, image and
 * shadow — which is the point, and also why 6px is the ceiling. Past about 8 the copy
 * stops reading as copy and the entrance looks like a page failing to load rather than
 * something arriving.
 *
 * ⚠️ **ALL THREE PROPERTIES SHARE ONE TRANSITION.** Giving the blur its own duration is
 * how a card ends up sharp before it has stopped moving, which reads as two effects
 * instead of one arrival. `transitionProperty.reveal` carries all three.
 *
 * ⚠️ **THE COST IS REAL AND IS THE THING TO WATCH.** `filter` forces the element onto
 * its own layer and re-rasterises it every frame; four large cards blurring at once is
 * the heaviest moment in this section. There is deliberately NO `will-change: filter` —
 * that would hold four permanent layers for an animation that runs once. If it janks on
 * a mid-range machine, the blur is the first thing to drop, not the duration.
 */

/**
 * How far a card must be INTO the viewport before it reveals, as a bottom `rootMargin`.
 *
 * ⚠️ **−5%, DOWN FROM −15%** (Jimmy, 13 Aug: "make the top row start sooner"). This is
 * the TRIGGER, and it is a different lever from the delay — row one's cards were already
 * at 0 and 90ms, so nothing about the stagger could have made them start earlier. What
 * was late was the moment the observer fired.
 *
 * At a 900px viewport, −15% held the reveal until the card's top edge was 135px above
 * the fold; −5% is 45px. The card now starts moving as it appears rather than after it
 * has settled into view.
 *
 * ⚠️ **IT DELIBERATELY DIVERGES FROM `useRevealed`'s −15%.** That default is right for
 * the thing it serves — `StatChart`, a single graphic whose whole sequence should be on
 * screen before it begins. A card in a grid is not that: it is one of four, and waiting
 * makes it look like it forgot to animate.
 *
 * ⚠️ It cannot go far positive. A positive margin fires BEFORE the card is visible, so
 * the entrance would be over by the time you saw it — a reveal nobody sees is a fade-in
 * with extra machinery.
 */
const REVEAL_ROOT_MARGIN = "0px 0px -5% 0px";

export interface RevealProps {
  children: ReactNode;
  /**
   * Stagger, in ms. The caller owns it because only the caller knows what the groups
   * are — see `ROW_STAGGER` in `Work`.
   *
   * ⚠️ It is a TRANSITION DELAY, not a timer: the element is already in its start state
   * from first paint, so a delayed transition cannot flash unstyled content the way a
   * delayed animation can.
   */
  delayMs?: number;
  /**
   * ⚠️ Goes on the observed element itself, so grid placement (`lg:col-span-2`) must be
   * passed HERE rather than left on the child — this wrapper becomes the grid item.
   */
  className?: string;
}

export function Reveal({ children, delayMs = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /**
     * ⚠️ REDUCED MOTION SHOWS EVERYTHING IMMEDIATELY AND ATTACHES NOTHING. Content must
     * never be gated behind an animation that will not run — the same contract
     * `useRevealed` honours, restated here because this is a separate mechanism.
     */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }

    /**
     * ⚠️ See `REVEAL_ROOT_MARGIN` — the trigger point, and the lever for "it starts too
     * late". The stagger cannot fix that; a delay of 0 is still 0.
     *
     * ⚠️ `unobserve` on the first hit — it fires ONCE. A reveal that replays on every
     * pass turns a page into a slideshow, and re-hiding content the reader has already
     * seen is worse than never animating it.
     */
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        io.unobserve(entry.target);
      },
      { rootMargin: REVEAL_ROOT_MARGIN },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-reveal duration-measured ease-standard",
        shown
          ? "translate-y-0 opacity-100 blur-none"
          : "translate-y-3xl opacity-0 blur-reveal",
        className,
      )}
      /**
       * 🔴 ⚠️ THE DELAY IS ALWAYS APPLIED, AND CLEARING IT "ONCE SHOWN" IS A BUG.
       *
       * It was written as `shown ? undefined : { transitionDelay }` — remove the stagger
       * after the entrance so nothing later inherits it. That reasoning is fine and the
       * code is wrong: `shown` flipping to `true` is the SAME RENDER that swaps the
       * classes, so React commits the new opacity/transform and the removal of the delay
       * together. The transition then starts immediately and **the stagger never happens
       * at all** — all four cards reveal on the same frame.
       *
       * The symptom is not "the stagger is subtly off", it is "there is no stagger", and
       * it reads as the whole row snapping in at once — which is most of why this looked
       * too fast before the curve was touched.
       *
       * Nothing else transitions this element, so an inherited delay costs nothing.
       */
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}
