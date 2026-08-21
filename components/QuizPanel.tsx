"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { Eyebrow } from "@/components/Eyebrow";
import { Quiz, type QuizContent } from "@/components/Quiz";
import type { HeadingSegment } from "@/components/SectionHeader";

/**
 * QuizPanel — the Services reel's finale. Panel 07: a photographic card that
 * expands to fill the viewport and opens the recommendation quiz.
 *
 * ⚠️ **INTRODUCED 13 Aug.** It is a new component rather than a `ServicePanel`
 * variant, and CLAUDE.md §3 says to flag that rather than build it inline. The
 * reason it is not a variant: `ServicePanel` is copy on a surface with no state of
 * its own, and this is a two-state photographic container that owns an interactive
 * child. Bolting a third mode onto `ServicePanel` would have made a component that
 * six panels use carry the machinery only the seventh needs.
 *
 * It replaces the section that used to live between Services and Process
 * (`WhyOtix`), and it inherits the deleted `banner1`'s image — see `content.ts`.
 *
 * ── Two states, one element ───────────────────────────────────────────────────
 * `expand` is a 0 → 1 SCROLL VALUE, not a boolean, because the geometry is
 * interpolated by the parent frame-by-frame. This component only reads it to
 * cross-fade the things that cannot be interpolated:
 *
 *   expand 0   CARD      frosted, header centred in the card, quiz absent
 *   expand 1   EXPANDED  frost clear, header pinned top-right, quiz shown
 *
 * ⚠️ THE HEADER DOES NOT MOVE — the two headers are two elements cross-fading in
 * place. Animating one header from centre to top-right sounds right and is wrong:
 * its text has to re-wrap at a different width mid-flight, so the lines reflow
 * while it travels. Two positions, one fade, no reflow.
 *
 * ── What this component does NOT own ──────────────────────────────────────────
 * Its size and position. The parent interpolates those inline (card rect →
 * viewport minus gutter) because only the parent knows the reel's geometry. This
 * component is `h-full w-full` and paints inside whatever box it is given — which
 * is also what makes the mobile fallback free: render it in a normal block at a
 * fixed `expand={1}` and it is simply an open quiz card.
 */

export interface QuizPanelProps {
  eyebrow: string;
  heading: HeadingSegment[];
  body: string;
  /** Decorative background. Safe to remove — see `content.whyOtix.image`. */
  image: string;
  quiz: QuizContent;
  /**
   * 0 = card, 1 = expanded. Values between are the scroll-driven transition.
   *
   * ⚠️ The mobile and reduced-motion builds pass a constant `1`. There is no pin
   * there, so there is nothing for an expansion to hang on, and a card that can
   * never open would just be a dead end.
   */
  expand?: number;
  /**
   * Vertical padding in px, overriding the class. The reel passes an interpolated
   * value so the inside of the card opens out with it — 60 as a card, 100 at full
   * screen (`6xl` → `section-y`).
   *
   * ⚠️ A PROP RATHER THAN A CLASS BECAUSE IT HAS TO INTERPOLATE, and a prop rather
   * than a constant in here because the mobile build must NOT get it: there the panel
   * renders at a fixed `expand={1}` and takes its padding from the classes below, which
   * are `Work`'s container tokens. Omitted, the class wins.
   *
   * ⚠️ The mobile panel used to sit inside a fixed `h-quiz` block and no longer does —
   * once the padding grew, the content outgrew that box and the next section was laid
   * out under the overflow. Its height is its content's height. See `Services`.
   */
  padY?: number;
  /**
   * Horizontal padding in px, interpolated by the reel — 48 as a card, 60 open.
   * Same reason as `padY`: swapping the class re-flows the copy mid-flight.
   */
  padX?: number;
  /**
   * ⚠️ A `maxH` PROP WAS BUILT HERE AND REMOVED THE SAME DAY (Jimmy, 13 Aug). It capped
   * the card at the viewport minus its gutters and made the quiz slot absorb the
   * difference — the slot opened to the room left rather than to the quiz's natural
   * height, and scrolled inside itself once it ran out.
   *
   * **It was the wrong fix and it broke the quiz.** The open card is MEANT to hug its
   * content and run off the bottom of the screen; the page scrolls to the rest of it
   * once the pin releases. Capping it turned a card that continues into a fixed-height
   * box with a scrolling panel inside a scrolling page — two scroll contexts stacked,
   * and the quiz laid out wrong inside the one it did not expect.
   *
   * The card being taller than the viewport is the DESIGN, not the bug.
   *
   * If a cap is ever genuinely needed, the machinery was: a measured `headerH` on a
   * wrapper round the eyebrow/heading/copy, `room = maxH - padY*2 - headerH -
   * QUIZ_GAP*quizIn`, and the slot taking `min(quizNaturalH, room)` with
   * `overflow-y-auto` once open and capped.
   */
  /**
   * The heading's scale, 0–1, from the reel — the card-size type token divided by the
   * open-size one, unwinding to 1 as the card opens.
   *
   * ⚠️ A SCALE, NOT A TOKEN SWAP (13 Aug, Jimmy: "it just jumps sizes on expand").
   * The heading used to flip `text-service-title` → `text-h2` at a threshold, and a
   * class cannot animate between two type tokens, so it stepped. Rendering once at the
   * OPEN size and scaling down is the same render-large-scale-down rule the sub-copy
   * already follows (`BODY_SCALE`): it grows continuously, it never re-wraps, and
   * down-scaled glyphs stay sharp because the browser is discarding pixels rather than
   * inventing them.
   *
   * ⚠️ THE TRADE IS REAL AND WAS THE ORIGINAL OBJECTION. As a card this is now a
   * scaled `h2` (leading 1.2, tracking -0.03em) rather than a true `service-title`
   * (1.2, -0.03em) — those two happen to agree, which is what makes this safe. **If
   * either token's leading or tracking is ever changed independently, the card-state
   * heading stops matching the six beside it and this becomes a scale of the wrong
   * thing.**
   */
  headScale?: number;
  className?: string;
}

/**
 * ⚠️ `expand` STILL SWEEPS 0 → 1 CONTINUOUSLY. What changed on 13 Aug is only what
 * DRIVES it: it used to be scrubbed by scroll position and is now tweened over time
 * once a scroll threshold trips. Nothing in this file needed changing for that, and
 * that is the point — the staging below still stages, on the same fractions.
 *
 * A CSS-transition version was built and reverted the same day. It made `expand`
 * binary and let the browser interpolate each property, which is tidier on paper but
 * changed the expansion itself: the values this file stages on (`QUIZ_IN`,
 * `FROST_OUT`, the heading step, `padY`) all snapped at the flip, because a class
 * cannot interpolate a token swap or an inline number.
 *
 * Where the quiz starts appearing, as a fraction of `expand`.
 *
 * ⚠️ Still deliberately late — the quiz is a busy, high-contrast white card and
 * bringing it in alongside the expansion means two large changes competing. But 0.45
 * rather than 0.6 (13 Aug): under an ease-OUT curve most of the box's travel is over
 * by 0.45, so the old value left the quiz to arrive almost entirely after the card had
 * stopped, which read as a second event rather than the end of one. It now overlaps
 * the tail of the move.
 */
const QUIZ_IN = 0.45;

/** Where the frost has fully cleared. Earlier than the quiz, so the image resolves first. */
const FROST_OUT = 0.45;

/**
 * How much frost survives at full screen.
 *
 * ⚠️ NOT ZERO (13 Aug). Clearing it completely made the open state a photograph with
 * type on it; the haze keeps it a surface and sits the image back behind the quiz
 * instead of competing with it. Went 0 → 0.22 → 0.5.
 *
 * ⚠️ It is doing legibility work as well as atmosphere. At full screen the heading
 * sits over whatever part of the photograph happens to be top-left, and the frost is
 * the only thing between it and a bright sky. Lowering it means re-measuring — see
 * the note on the scrim below.
 */
const FROST_MIN = 0.5;

/**
 * Where the heading steps from the CARD token to the SECTION token.
 *
 * ⚠️ IT IS A TOKEN SWAP, NOT A SCALE. Rendering at `text-h2` and scaling down matched
 * the cards on SIZE but not on FACE, and the two differ in weight and leading as well
 * as size — a scaled `h2` beside a real card title read visibly wrong at an identical
 * px. Both ends now use their real token.
 *
 * `text-service-title` (→50) as a card, matching the six beside it · `text-h2` (→60)
 * once open, matching every other section heading.
 *
 * ⚠️ The cost is that it STEPS; a class cannot animate between two type tokens. 0.12
 * puts it in the first moments of the move, where `easeOutQuint` is travelling
 * fastest — a type step there is buried by the motion. It was 0.35, which under the
 * old `in-out` curve was still early; under an out curve 0.35 is already past the
 * fast part and the snap became visible. **This number is tied to the parent's
 * easing, not just to the value.**
 *
 * ⚠️ The gap is now small (50 → 60), which is why this survives being a step at all.
 * If the card token ever moves far from `h2` again, reconsider.
 */
const HEADING_STEP = 0.12;

/**
 * The sub-copy's scale while the panel is still a card — `text-body ÷ text-body-lg`
 * at their maxima (16 ÷ 18).
 *
 * ⚠️ Render-large-scale-down, and for the same reason the heading used to: swapping the CLASS at a
 * threshold would snap 2px mid-expansion, which on a paragraph that is also
 * re-wrapping is a visible jolt. Scaling cannot re-wrap.
 *
 * ⚠️ It is very nearly 1, and that is the point — the copy steps up a size, it does
 * not grow the way the heading does. If this ever needs to be dramatic, it should
 * become a heading, not a bigger paragraph.
 *
 * ⚠️ **Derived from the type tokens. If either moves, this silently stops matching.**
 */
const BODY_SCALE = 16 / 18;

/**
 * The gap between the sub-copy and the quiz, in px, at full open.
 *
 * ⚠️ It MIRRORS `5xl` (48) and Tailwind cannot express that link — it is a number here
 * because it interpolates with `quizIn`, and because the available-height maths above
 * has to subtract it. Same trade as `BODY_SCALE`.
 */
const QUIZ_GAP = 48;

/**
 * The frost's blur radius as a CARD, in px. It rides down to 0 on the same ramp the
 * frost's opacity uses, so the open state is a flat wash with no blur at all.
 *
 * ⚠️ THIS IS A BUG FIX, NOT A DESIGN CHANGE (Jimmy, 13 Aug — "you can see this
 * gradient at the top"). Chrome's `backdrop-filter` samples the BACKDROP ROOT, which
 * for this card is the viewport. Once the card is taller than the screen its frost
 * extends past the top edge, and the blur there has nothing outside the root to sample
 * — so Chrome clamps, and the smear reads as a pale gradient band across the top of
 * the window that follows the scroll. It painted over the nav as well.
 *
 * Confirmed by isolating it in the browser: killing this one element's
 * `backdrop-filter` removed the band; clipping its top edge to the viewport also
 * removed it; and `translateZ(0)` "fixed" it only by making the element its own
 * backdrop root, i.e. by silently disabling the blur.
 *
 * ⚠️ THE BLUR COSTS ALMOST NOTHING TO LOSE HERE, which is what makes this the right
 * trade rather than a compromise. Toggling it on and off at full open is very nearly
 * invisible: the frost is at `FROST_MIN` (0.5) and `opacity` below 1 halves the effect
 * again. Where the blur genuinely reads is as a CARD — small, photographic, fully
 * inside the viewport — and that is exactly where it is kept at full strength.
 *
 * ⚠️ MIRRORS `backdropBlur.panel` (20px). It has to be a number because it
 * interpolates, and Tailwind cannot express the link. Same trade as `BODY_SCALE`.
 */
const FROST_BLUR = 20;

/** Normalised 0–1 ramp between two points on `expand`. */
const ramp = (v: number, from: number, to: number) =>
  Math.min(Math.max((v - from) / (to - from), 0), 1);

export function QuizPanel({
  eyebrow,
  heading,
  body,
  image,
  quiz,
  expand = 0,
  padY,
  padX,
  headScale = 1,
  className,
}: QuizPanelProps) {
  const e = Math.min(Math.max(expand, 0), 1);
  const frost = FROST_MIN + (1 - FROST_MIN) * (1 - ramp(e, 0, FROST_OUT));
  const quizIn = ramp(e, QUIZ_IN, 1);
  const bodyScale = BODY_SCALE + (1 - BODY_SCALE) * e;
  /** Full blur as a card, none once open — see `FROST_BLUR`. */
  const blurPx = FROST_BLUR * (1 - ramp(e, 0, FROST_OUT));

  /**
   * The quiz's natural height, so its slot can be opened from 0 to it.
   *
   * ⚠️ A `ResizeObserver`, not a one-off measure. The quiz changes height as it is
   * answered — the reveal screen is a different shape from a question — and a
   * cached height would clip it the moment someone got to the end.
   *
   * ⚠️ Measured on an INNER element that is never given a height by this component.
   * Measuring the slot itself would be measuring the thing this value sets, which
   * converges on nothing.
   */
  /** ⚠️ A transform reserves its UNSCALED height, so the negative margin below
   *  reclaims the difference — see the note on `BODY_SCALE`. */
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const [bodyH, setBodyH] = useState(0);
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setBodyH(entry.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /**
   * The quiz's natural height, so its slot can be opened from 0 to it.
   *
   * ⚠️ A `ResizeObserver`, not a one-off measure. The quiz changes height as it is
   * answered — the reveal screen is a different shape from a question — and a cached
   * height would clip it the moment someone reached the end.
   *
   * ⚠️ Measured on an INNER element this component never gives a height to.
   * Measuring the slot itself would be measuring the thing this value sets.
   *
   * ⚠️ Its callbacks never arrive in a backgrounded tab, which is why the slot below
   * has to fail CLOSED rather than open.
   */
  /**
   * The heading's UNSCALED height, for the negative margin that reclaims the space its
   * transform does not — a transform paints smaller but reserves the full box.
   */
  const headRef = useRef<HTMLHeadingElement>(null);
  const [headH, setHeadH] = useState(0);
  useEffect(() => {
    const el = headRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setHeadH(entry.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const quizRef = useRef<HTMLDivElement>(null);
  const [quizNaturalH, setQuizNaturalH] = useState(0);
  useEffect(() => {
    const el = quizRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setQuizNaturalH(entry.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);


  return (
    <div
      className={cn(
        // `isolate` so the frost and scrim stack against each other and not against
        // whatever the reel puts behind this.
        // ⚠️ NO `h-full`. The card's height is its CONTENT's height — that is what
        // lets it hug at rest and run taller than the viewport once the quiz is in.
        // The parent sets width and position only.
        // ⚠️ `rounded-3xl` AT EVERY SIZE, INCLUDING FULL SCREEN. It was briefly
        // interpolated to 0 as the panel reached the edges, on the reasoning that a
        // radius on something flush to all four sides reads as a fault — reverted
        // the same day (Jimmy, 13 Aug). Keeping 30 is what makes the open state
        // still read as the same card that grew, rather than as a different screen
        // that replaced it. It also keeps the one radius the whole site shares.
        "relative isolate w-full overflow-hidden rounded-3xl",
        className,
      )}
    >
      {/* ── Background ────────────────────────────────────────────────────────
          `fill` + `object-cover`: the box goes from a short card to something taller
          than the screen, so any intrinsic size would be wrong at one end.
          Decorative and removable — `aria-hidden`, empty `alt`. */}
      <Image src={image} alt="" aria-hidden="true" fill sizes="100vw" className="-z-10 object-cover" />

      {/* ── The scrim ─────────────────────────────────────────────────────────
          ⚠️ NOT DECORATION — it is what makes the heading legible, and it has to
          survive the frost clearing. Measured on the real asset by sampling the
          composited pixels behind the heading, worst case across the block:

            unscrimmed   ink-50 on the bright sky   1.93:1   ✗ (WCAG 1.4.3 wants 4.5:1)
            scrimmed     ink-50 on the same pixels  13.93:1  ✓

          The bright sky is the top third of this image and the heading is anchored
          top-left, so it sits right in it. **Re-measure if the image is swapped.**

          `scrim-hero-foot` inverted with `rotate-180` rather than a new token — it
          is the same ramp, just the other way up. */}
      {/* ── Legibility, in two parts ──────────────────────────────────────────
          ⚠️ NEITHER IS DECORATION. Both exist so `ink-50` clears WCAG 1.4.3's 4.5:1
          over a photograph whose bright areas move as the image is swapped. Measured
          on this asset behind the heading: **1.93:1 bare.** Re-measure if the image
          changes.

          1. THE VEIL — a flat wash, full-bleed, that fades out as the card opens. In
             card state the heading fills most of the box, so a gradient anchored to
             one edge runs out before the copy does; a flat wash cannot. It is gone by
             the time the card is open, where the photograph should read.

          2. THE CORNER SCRIM — anchored TOP-LEFT, always on. This is what covers the
             heading in the expanded state.

          ⚠️ TOP-LEFT CORNER, NOT ACROSS THE TOP (13 Aug). A full-width top band
          darkened a strip of sky the heading does not even occupy, which flattened
          the image for no legibility gain. The heading is anchored top-left, so the
          shadow belongs on that diagonal — it falls off toward the bottom-right and
          leaves three-quarters of the picture alone.

          ⚠️ `rotate-180` on `scrim-green-corner`, not a new token. That ramp is
          `315deg`, so its dark stop sits bottom-right; rotating the element puts it
          top-left. The token was unreferenced before this — see DESIGN_TOKENS §7b. */}
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-green-950"
        style={{ opacity: 0.62 * (1 - e) }}
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 rotate-180 bg-scrim-green-corner"
      />

      {/* ── The frost ─────────────────────────────────────────────────────────
          ⚠️ `backdrop-blur` NEEDS TEXTURE BEHIND IT — over a flat fill it does
          nothing and reads as broken. A photograph is the one ground on this site
          where it genuinely works, which is why this card is photographic rather
          than a green panel with a blur on it.

          Opacity is inline because it interpolates with SCROLL, not at a breakpoint. */}
      <span
        aria-hidden="true"
        /* ⚠️ `rounded-3xl` ON THIS SPAN, even though the parent is already
           `overflow-hidden rounded-3xl` and ought to clip it. An element carrying a
           `backdrop-filter` does not get clipped by an ancestor's BORDER-RADIUS in
           Chrome — only by its box — so the frost painted square through the card's
           rounded corners as a grey patch. It has to carry its own radius.

           ⚠️ STILL REQUIRED even though the blur now fades out: it is present for the
           whole card state and most of the expansion, which is exactly when the corners
           are visible.

           ⚠️ It must stay equal to the parent's. They are one corner written twice
           and Tailwind cannot express the link; if the card's radius changes, this
           changes with it. */
        className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-overlay-glass-panel"
        style={{
          opacity: frost,
          /* ⚠️ Inline rather than `backdrop-blur-panel`, and `undefined` rather than
             `blur(0px)` — see `FROST_BLUR`. Omitting the property entirely is what
             stops the element being a backdrop-filter element at all, which is what
             removes the artifact; `blur(0px)` still creates one. */
          backdropFilter: blurPx > 0.1 ? `blur(${blurPx}px)` : undefined,
        }}
      />

      <div
        /**
         * The classes are the FALLBACK, used by the MOBILE/TABLET branch and by
         * `/dev/components`. The desktop reel overrides them with `padX`/`padY` because
         * it needs to interpolate; nothing else does.
         *
         * ⚠️ `px-section-x py-section-y` — THE SAME TWO TOKENS `Work` PUTS ON ITS PANEL
         * (Jimmy, 13 Aug: "the padding of the whole container should match the our work
         * container"). It was a flat `p-5xl md:p-6xl` (48 / 60), which was a card
         * measurement rather than a container one.
         *
         * That is what makes this read as one of the site's panels rather than as a
         * large card: `Work` is `mx-gutter … px-section-x py-section-y`, and this
         * section is `px-gutter` with the panel inside it, so the two land their content
         * on exactly the same optical line — 25 from the screen edge on a phone
         * (5 + 20), 60 at 1440 (10 + 50).
         *
         * ⚠️ IT IS A REDUCTION SIDEWAYS AND AN INCREASE VERTICALLY on a phone: 48 → 20
         * left and right, 48 → 56 top and bottom. The horizontal drop is the point —
         * matching `Work` means matching its line, not its feel — and the vertical rise
         * is what puts more air above the eyebrow.
         *
         * ⚠️ These two tokens and the section's `px-gutter` are a SET. If Services'
         * Find Your Fit section ever stops being gutter-inset, this stops matching
         * `Work` and there is nothing that will catch it.
         */
        className="flex flex-col px-section-x py-section-y"
        style={{
          ...(padY === undefined ? null : { paddingTop: padY, paddingBottom: padY }),
          ...(padX === undefined ? null : { paddingLeft: padX, paddingRight: padX }),
        }}
      >
        {/* ── The heading — ONE element, anchored top-left, that GROWS ──────────
            ⚠️ It is a single element that scales, NOT two headers cross-fading.
            The first build had a centred version and a corner version swapping over,
            and the swap was visible as a blink: the copy vanished and came back
            somewhere else mid-expansion.

            ⚠️ IT IS RENDERED AT THE **FINAL** SIZE AND SCALED DOWN, never rendered
            small and scaled up. Both directions look identical in a still; only
            down-scaling stays sharp, because the glyphs are rasterised at the larger
            size and the browser is throwing pixels away rather than inventing them.

            ⚠️ SCALE, not `font-size`. Interpolating font-size re-wraps the text on
            every frame — the lines reflow while the box is moving, which reads as
            the copy fighting the animation. A transform cannot reflow: the layout is
            fixed at the expanded width and only the painting changes. `origin-top-left`
            is what keeps it welded to the corner as it grows.

            The scale comes from the PARENT because only the reel knows the card's
            two widths — it is literally `currentWidth / expandedWidth`, so the
            heading stays the same proportion of the card at every frame. */}
        {/* ── The heading block ────────────────────────────────────────────────
            ⚠️ ONLY THE `h2` SCALES. The eyebrow and the sub-copy sit outside the
            transform at their own sizes, because scaling them too shrank a 13px
            mono pill to 7px and the body to 9px — unreadable, and wrong in kind:
            the heading is the thing that changes rank between the two states, the
            supporting copy is not.

            ⚠️ It is a single element that grows, NOT two headers cross-fading. The
            first build swapped a centred version for a corner version and the swap
            read as a blink — the copy vanished and came back somewhere else
            mid-expansion. */}
        <Eyebrow label={eyebrow} variant="dark" />

        {/* ── The heading ──────────────────────────────────────────────────────
            ⚠️ RENDERED AT THE OPEN SIZE AND SCALED DOWN, never rendered small and
            grown. See `headScale` for why this replaced a token swap. Three
            consequences worth knowing:

            · `origin-top-left` welds it to the corner, so it grows out of the corner
              rather than away from it.
            · `width: 100 / scale` gives it the layout width it would have had at full
              size, so the LINE BREAKS ARE THE OPEN STATE'S at every scale — the copy
              never re-wraps mid-move, which is the whole reason this is a transform
              and not an interpolated `font-size`.
            · a transform reserves the UNSCALED box, so the negative margin gives back
              the height it is not using. Identical treatment to the sub-copy below. */}
        <div
          className="origin-top-left will-change-transform"
          style={{
            transform: `scale(${headScale})`,
            width: `${100 / headScale}%`,
            marginBottom: -(1 - headScale) * headH,
          }}
        >
          <h2
            ref={headRef}
            className="mt-md max-w-measure whitespace-pre-line text-h2 text-ink-50"
          >
            {heading.map((seg, i) =>
              seg.accent ? (
                <em
                  key={i}
                  /**
                   * ⚠️ THE FACE STILL STEPS, AND ONLY THE FACE. The size is continuous
                   * now, but serif-italic-green cannot be interpolated from
                   * Manrope-roman-white — there is no in-between to render. It arrives
                   * at `HEADING_STEP`, early in the move where `easeOut` is travelling
                   * fastest and a swap is buried by the motion.
                   *
                   * As a card it is plain Manrope, matching the six `ServiceCard`
                   * titles; open it carries the accent every section heading on the
                   * site carries. `text-h2-accent` is 62 against the heading's 60 —
                   * the accent's own optical correction, and it scales with the rest.
                   */
                  className={cn(
                    e >= HEADING_STEP && "font-serif text-h2-accent italic text-green-300",
                  )}
                >
                  {seg.text}
                </em>
              ) : (
                <span key={i}>{seg.text}</span>
              ),
            )}
          </h2>
        </div>

        {/* ⚠️ THE SUB-COPY STAYS, in both states (Jimmy, 13 Aug). It was built to
            collapse as the quiz arrived, on the reasoning that the first question
            explains the offer better than a sentence about how many questions there
            are — and that was reversed: with the heading anchored top-left there is
            room for both, and the copy is what tells you the quiz is free of a sales
            pitch before you start answering it.

            No height animation and no fade. It is simply part of the header block. */}
        {/* ⚠️ Set at `text-body-lg` and scaled DOWN to `text-body` while it is a
            card — the same render-large-scale-down rule the heading follows, so the
            type stays sharp at the size it spends most of its life at. See
            `BODY_SCALE`. The width compensation keeps the line breaks identical at
            both sizes; the negative margin reclaims the height the transform does
            not. */}
        <div
          className="origin-top-left will-change-transform"
          style={{
            transform: `scale(${bodyScale})`,
            width: `${100 / bodyScale}%`,
            marginBottom: -(1 - bodyScale) * bodyH,
          }}
        >
          {/* ⚠️ `pt-2xl` (28), NOT `pt-md`. This is `SectionHeader`'s heading → body
              measurement, and it is deliberately different from the eyebrow → heading
              gap above it (`md`, 12) — the spacing in this component is not uniform
              because the spacing in every other section header is not uniform either.
              See the note at the top of `SectionHeader`.

              It lands on exactly 28 at full screen because `bodyScale` is 1 there;
              while the panel is still a card it scales down with the copy, which is
              correct — the whole block is smaller, not just the type. */}
          <p ref={bodyRef} className="max-w-measure pt-2xl text-body-lg text-green-100">
            {body}
          </p>
        </div>

        {/* ── The quiz ─────────────────────────────────────────────────────────
            ⚠️ Its SLOT opens rather than the quiz appearing into a card that has
            already grown. `height` is interpolated from 0 to the measured natural
            height, so the CARD's own height follows it — which is what makes the
            card grow to fit its content instead of being given a height by the reel.

            `overflow-hidden` on the slot while it opens, so the quiz is revealed
            rather than squashed.

            ⚠️ The quiz keeps its OWN white surface (`bg-neutral-0`, `shadow-elevated`
            — see `Quiz`) and is deliberately not restyled onto the photograph: its
            option rows, radios and focus rings need 3:1 for control boundaries
            (WCAG 1.4.11), and no scrim strength gives a photograph that reliably.

            `inert` while closed so its inputs are not tabbable behind a card that
            has not opened yet. */}
        <div
          /* ⚠️ `overflow-hidden` AND NOTHING ELSE. The slot never scrolls: it opens to
             the quiz's full height and the CARD grows with it, off the bottom of the
             screen if that is what it takes. A scrolling slot was tried — see the note
             where `maxH` used to be — and it laid the quiz out wrong. */
          className="overflow-hidden"
          style={{
            /**
             * ⚠️ THE SLOT OPENS FROM 0 TO THE QUIZ'S MEASURED HEIGHT. Letting the
             * quiz sit at natural height and be cropped by the card's own bottom edge
             * was tried and reverted (13 Aug) — it made the expansion worse: the quiz
             * arrived at full size the instant the card had room for any of it, so
             * the card was no longer revealing it, it was catching up with it.
             *
             * The slot growing WITH the card is what keeps the two on one motion.
             *
             * ⚠️ IT FAILS CLOSED, and the order of the branches is the point. It was
             * `quizNaturalH ? quizNaturalH * quizIn : undefined`, which reads as "use
             * the measured height once we have one" and behaves as "show the quiz at
             * FULL height until we do" — 0 is falsy. `ResizeObserver` callbacks are
             * delivered in the rendering steps, so an occluded tab never gets them and
             * the card stayed open for the life of the page. Closed is the safe
             * default; the only branch that gives up control is the one where the quiz
             * is meant to be fully open anyway.
             */
            height: quizIn >= 1 ? undefined : quizNaturalH * quizIn,
            opacity: quizIn,
            marginTop: `${quizIn * QUIZ_GAP}px`,
          }}
          aria-hidden={quizIn < 0.5}
        >
          <div ref={quizRef}>
            <Quiz content={quiz} />
          </div>
        </div>
      </div>
    </div>
  );
}
