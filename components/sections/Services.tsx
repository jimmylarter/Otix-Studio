"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { ServiceCard } from "@/components/ServiceCard";
import { Carousel } from "@/components/Carousel";
import { Logo } from "@/components/Logo";
import { Cta } from "@/components/Cta";
import { SectionHeader } from "@/components/SectionHeader";
import { QuizPanel } from "@/components/QuizPanel";
import type { QuizContent } from "@/components/Quiz";
import type { HeadingSegment } from "@/components/SectionHeader";

/**
 * Services — the pinned reel. Figma: `SERVICES` (36:214) plus the six panel
 * frames beside the homepage (`SERVICES - 01…06`).
 *
 * ⚠️ FLUSH (CLAUDE.md §0.1): no surface, so `x=0, w=1440` with content at 60.
 *
 * ⚠️ NO SECTION HEADER. Each panel carries its own eyebrow instead, so
 * `content.services.eyebrow`, `.heading`, `.body` and `.cta` are unused
 * (CMS_READINESS.md §3.10).
 *
 * ⚠️ Figma's `SERVICES TITLE` (170:2705) was built on 13 Aug and REVERTED the same
 * day (Jimmy's call). If it comes back: it must sit OUTSIDE the pin — before the
 * `wrapRef` div — so it scrolls away normally and only the reel locks. Inside the
 * sticky box it is held on screen for five viewport-heights while you read six
 * services under it. It costs the scroll maths nothing either way, because
 * `progress` is measured from the WRAPPER's own box, so anything above the wrapper
 * is not part of the travel.
 *
 * ── How the pin works ─────────────────────────────────────────────────────────
 * The outer wrapper is TALLER than the viewport; a `sticky` inner box holds the
 * reel still while that extra height scrolls past. Progress is
 * `distance scrolled ÷ distance available`, mapped to `0…n-1` and handed to both
 * columns — so the numerals and the copy run off ONE value and cannot desync.
 *
 * Scroll distance is `(n-1) × 80vh`, not `× 100vh`. A full viewport per service is
 * the usual choice and it makes six services cost five screens of scrolling before
 * the page moves on; 80% keeps the gesture unhurried while getting a third of that
 * back.
 *
 * ── Below `md`, and under reduced motion, there is NO PIN ─────────────────────
 * Hijacking scroll for several viewport-heights on a phone — where scroll is the
 * only navigation and momentum is expected — is the most hostile pattern
 * available, and a pinned section that ignores `prefers-reduced-motion` is worse
 * still.
 *
 * ⚠️ It is a SWIPEABLE CAROUSEL there, not a stack (13 Aug; supersedes
 * RESPONSIVE_SPEC.md §5.4, which describes the stack). Stacking all six panels
 * traded one long hijacked scroll for one long ordinary scroll — the same six
 * screens, just without the pin. The carousel keeps a service to a screen and
 * costs one swipe each.
 *
 * The oversized numerals are GONE on mobile: at `text-numeral` they stood taller
 * than the copy they were labelling. The eyebrow is fixed above the strip and only
 * the title, icon and copy move.
 *
 * The check is a `matchMedia` LISTENER, not a one-off read: rotating a tablet
 * crosses this boundary, and a stale answer leaves the page either pinned with no
 * handler or unpinned inside a wrapper still reserving five screens of height.
 */

export interface ServicesPanelContent {
  title: string;
  body: string[];
  /**
   * ⚠️ `icon: IconName` WAS HERE AND IS GONE (13 Aug). The desktop orbit dropped its
   * icon column when each card gained an image, and the mobile carousel followed when
   * it moved from `ServicePanel` to the same `ServiceCard` — so neither branch renders
   * a glyph any more. `SERVICE_ICONS` still exists in `Icon.tsx` and is still on
   * `/dev/components`; only the per-service binding is removed.
   */
  /**
   * The card's hook question — written in build, see `content.ts`.
   *
   * ⚠️ Singular. It replaced `tags: string[]` on 13 Aug; the shape change is the point,
   * not an incidental rename. Rendered on BOTH branches since 13 Aug — the phone
   * carousel runs the same `ServiceCard` in its `stacked` layout.
   */
  question: string;
  /** Decorative. Reuses the quiz's step renders — see `content.ts`. */
  image: string;
}

/**
 * Panel 07 — the reel's finale. Not a service: it is the recommendation quiz,
 * which used to be its own `WhyOtix` section between here and Process.
 */
export interface ServicesFinale {
  eyebrow: string;
  heading: HeadingSegment[];
  body: string;
  /** Decorative background — inherited from the deleted `banner1`. */
  image: string;
  quiz: QuizContent;
}

export interface ServicesProps {
  /**
   * The section header, above the pin.
   *
   * ⚠️ Optional, and its absence is a real case rather than defensive typing —
   * `/dev/components` renders this section without one. Built and reverted earlier on
   * 13 Aug before coming back; see `content.services`.
   */
  header?: {
    eyebrow: string;
    heading: HeadingSegment[];
    body: string;
    cta: { label: string; href: string };
  };
  panels: ServicesPanelContent[];
  /**
   * ⚠️ Optional. Without it the reel is six panels and behaves exactly as it did
   * before 13 Aug — which is what keeps `/dev/components` and any future page able
   * to use this section without dragging the quiz along.
   */
  finale?: ServicesFinale;
  className?: string;
}


/**
 * How far the title travels up as it leaves, and the reel rises, as a fraction of
 * the PANEL's height.
 *
 * ⚠️ IT IS RESOLVED TO PIXELS BEFORE USE, never written as a `%` in a transform. A
 * percentage in `translateY` resolves against the ELEMENT's own height, not its
 * parent's — so the reel row, whose height is just the numerals column, moved a few
 * dozen pixels instead of most of a screen, and the title moved by a fraction of
 * itself. Both looked broken in the same way and for the same reason.
 */
const INTRO_TRAVEL = 0.6;

/** Viewport-heights of scroll per service transition. */
const VH_PER_PANEL = 80;

/**
 * Viewport-heights of scroll spent EXPANDING panel 07 once it has arrived.
 *
 * ⚠️ Shorter than a panel transition on purpose. The expansion is a change of
 * state, not another thing to read: at a full 80 it felt like the page had stalled,
 * because nothing new arrives during it — the same card is simply getting bigger.
 *
 * ⚠️ Once this is spent the pin RELEASES (Jimmy, 13 Aug). The quiz needs unbounded
 * dwell time and the reel is scroll-driven, so holding the page while someone
 * answers five questions is the same hostile pattern that got the pin dropped on
 * mobile. Expanded, the card is an ordinary full-height block that scrolls away.
 *
 * ⚠️ 45, via 50 → 70 → 45, and IT MEANS SOMETHING DIFFERENT AGAIN. Under the tween it
 * was only the room a clock needed to finish in; with the scrub back it is once more
 * the literal scroll distance the expansion COSTS. This is the dial for how fast the
 * card opens per turn of the wheel — lower is faster, higher is slower.
 *
 * ⚠️ IT IS A TRADE, and both directions are real. LONGER is a more gradual open and
 * more room to stop part-way. SHORTER is a snappier open and less ground to scroll back
 * through before the card starts shrinking on the way up — under the scrub it begins
 * closing on the first pixel of upward scroll, so the return trip is now the full 45
 * rather than the tween's dead zone plus threshold.
 *
 * ⚠️ 70 (Jimmy, 13 Aug — "slower"). 45 was chosen against a clock that was doing half
 * the work, and it is the second half of that change; the first is the CURVE, which
 * moved from quint to cubic at the same time. Both were needed and the curve mattered
 * more — see `easeOut`. Measured, as scroll to reach a given openness:
 *
 *     quint @ 45   25% @ 2.5vh   50% @ 5.8vh   90% @ 16.6vh   ← was
 *     quint @ 70   25% @ 3.9vh   50% @ 9.1vh   90% @ 25.8vh
 *     cubic @ 70   25% @ 6.4vh   50% @ 14.4vh  90% @ 37.5vh   ← is
 *
 * The budget alone would have bought under 4vh at the front of the move, which is the
 * part that reads as speed.
 */
const VH_EXPAND = 70;

/**
 * Viewport-heights the card DWELLS, arrived and centred, before it starts to grow.
 *
 * ⚠️ **ZERO, and it is a real decision rather than a disabled feature.** It was 40,
 * added because the expansion looked like it started too early — but the actual
 * fault then was that the card did not rest CENTRED (it inherited the copy column's
 * top and sat high in the frame), so it appeared to grow before it had arrived.
 * Once the centring was fixed the hold had nothing left to solve, and 40vh of scroll
 * in which nothing at all happens reads as the page having stalled.
 *
 * It stays as a named constant, at 0, because it is the one dial for that beat: if
 * the expansion ever needs to land before it opens, this is the number, and the
 * arithmetic downstream already accounts for it.
 */
const VH_HOLD = 0;

/**
 * Viewport-heights the card holds FULLY OPEN before the pin releases.
 *
 * ⚠️ Without it the expansion finished and the page moved on in the same gesture, so
 * the open state was never actually seen at rest — it was a shape the card passed
 * through. A short beat is the difference between "it opened" and "it is open".
 *
 * ⚠️ 6, and the range is exhaustively explored — 25 → 60 → 35 → 25 → 12 → 6 in one
 * afternoon. The finding worth keeping is that this reads FAR longer than the number
 * suggests: 60 was plainly a wait and even 25 registered as one. A sixteenth of a
 * screen is enough for the open state to land as a stop.
 *
 * ⚠️ It should not go to 0. At 0 the expansion completes and the page moves on in the
 * same gesture, so the open state is a shape the card passes through rather than one
 * it reaches.
 *
 * ⚠️ If it is ever raised again, the ceiling is around a viewport. Past that the
 * pause stops being a beat and becomes a second pin — and the reason the reel
 * releases here at all is that the quiz needs unbounded dwell time, which a
 * scroll-driven section cannot give it.
 *
 * Holding someone in front of a card they have finished reading is the pattern this
 * section is built to avoid.
 */
const VH_SETTLE = 6;

/**
 * The copy column's fade. ⚠️ Deliberately NOT `REEL_MASK`.
 *
 * The numerals mask clears only 18%→62% of its window, which is right for a column
 * showing two numerals with the read line above centre. Applied to this column it
 * left a ~250px clear band against ~450px of copy, so a panel was partly faded
 * even while fully centred.
 *
 * This clears 10%→90% and fades only at the very edges. It pairs with
 * `h-service-panel`: the clear band is 80% of that height, and the panel height was
 * sized so the copy fits inside it with room to spare. Widen this fade or shrink
 * that height and the copy starts fading mid-read again.
 */
const PANEL_MASK =
  "linear-gradient(to bottom, transparent 0%, #000 10%, #000 90%, transparent 100%)";

/**
 * The spine's travelling thumb, in px.
 *
 * A LOCAL constant rather than a token, on the same reasoning as `PITCH`/`RULE` in
 * `ServiceNumerals` (deleted): it is a proportion inside one bespoke composition, not a size
 * anything else will ever reuse, and pushing it into the global scale would pollute
 * it for no reuse (CLAUDE.md §1).
 *
 * ⚠️ It appears TWICE in the markup below — as the thumb's own height and inside
 * the `top` calc that keeps it from overshooting the end of the track. One
 * constant, so they cannot drift.
 */
const SPINE_THUMB = 30;

/**
 * ── The orbit ────────────────────────────────────────────────────────────────
 * Geometry for the arc the cards travel on. LOCAL CONSTANTS, not tokens, on the
 * same reasoning as `SPINE_THUMB`, and as `PITCH` in the deleted `ServiceNumerals`: these are
 * proportions inside one bespoke composition, nothing else will ever reuse them,
 * and pushing them into the global scale would pollute it (CLAUDE.md §1).
 *
 * ⚠️ Every one is a FRACTION OF THE PANEL, never a pixel — the panel is the full
 * viewport minus the gutter and the site has no fixed widths (CLAUDE.md §0).
 */

/**
 * Degrees between one card and the next.
 *
 * ⚠️ 40, down from 52 (13 Aug). It is coupled to `ORBIT_R`: moving the active card
 * left meant a bigger radius, and a bigger radius throws the neighbours further for
 * the same angle — they swung almost entirely off the panel and the glimpse of what
 * is coming and going was lost. Widen the radius again and this has to come down
 * again with it.
 */
const ORBIT_STEP_DEG = 40;

/**
 * The wheel's centre, as a fraction of the panel's width and height.
 *
 * ⚠️ `1.02` puts it just OFF the right edge, which is what makes the arc read as
 * part of a much larger circle rather than as three cards on a curve. It must stay
 * greater than 1 or the centre lands inside the panel and the cards swing around a
 * visible pivot.
 */
const ORBIT_CX = 1.02;
const ORBIT_CY = 0.5;

/**
 * Radius, as a fraction of panel width. `ORBIT_CX − ORBIT_R` is where the ACTIVE
 * card's centre lands, so this is the dial for how far left the card reads:
 * 1.02 − 0.45 = 0.57 of the way across, near enough the middle of the screen.
 *
 * ⚠️ 0.37 first, which put the card at 0.65 — visually parked right of centre.
 * ⚠️ It cannot grow much further. The card is `ORBIT_CARD_W` (0.42) wide, so at
 * 0.45 its left edge sits at 0.36 — just clear of the numerals column, which takes
 * roughly the first third of the panel. Push the radius past ~0.48 and the card
 * starts overlapping the numerals rather than sitting beside them.
 */
const ORBIT_R = 0.45;

/** Card width, as a fraction of panel width. */
const ORBIT_CARD_W = 0.42;

/**
 * How the neighbours read. Applied on the DISTANCE from the active slot, so they
 * ease in continuously rather than switching at a threshold.
 */
const ORBIT_NEIGHBOUR_SCALE = 0.82;

/**
 * ⚠️ THERE IS NO OPACITY ON THE CARDS, AND THAT IS A HARD CONSTRAINT RATHER THAN A
 * PREFERENCE. Do not reintroduce one.
 *
 * `opacity` below 1 makes an element a GROUP: the browser renders it in isolation
 * and then composites the result. A `backdrop-filter` inside that group has nothing
 * behind it to sample, because the thing it would sample is outside the group — so
 * the frost silently evaluates to nothing.
 *
 * The symptom was precise and misleading: the frost appeared on the first card and
 * vanished the moment you scrolled. At rest the active card sits at exactly opacity
 * 1, which is not a group; one pixel of scroll makes `progress` fractional, every
 * card drops below 1, and every frost switches off at once. It reads as the blur
 * being broken rather than as the opacity doing it.
 *
 * Depth is carried by SCALE and by the panel edge cropping the neighbours. That is
 * also what the numerals do, so the section keeps speaking one language. It went
 * 0.32 → 0.55 → gone.
 */
const ORBIT_NEIGHBOUR_SCALE_ONLY = true;

/**
 * How far from the active slot a card is still rendered.
 *
 * ⚠️ 1.75, up from 1.15 (13 Aug). It has to be far enough that a card is genuinely
 * OFF the panel before it is unmounted, and 1.15 was not: at `ORBIT_STEP_DEG` 40 that
 * is only 46° round the arc, where a card is still partly on screen at the top of the
 * wheel — so it vanished mid-view rather than leaving.
 *
 * ⚠️ **It is coupled to `ORBIT_STEP_DEG` and `ORBIT_R`.** Narrow the step or widen the
 * radius and cards travel less distance per unit, so this has to grow with them. The
 * test is simple: at the limit, is the card's near edge past the panel edge? If not,
 * it will disappear in front of someone.
 *
 * It must also stay above 1 by a margin — at exactly 1 a neighbour pops out of the
 * DOM on the frame it reaches its resting place, which flickers.
 */
const ORBIT_RENDER_LIMIT = 1.75;

/**
 * Degrees the background mark turns per service.
 *
 * ⚠️ It is driven by `progress`, the same value the numerals and the spine run off,
 * which is what gives it scroll DIRECTION for free — scroll back and `progress`
 * falls, so the mark unwinds. No listener, no velocity tracking, and it cannot
 * desync from the reel.
 *
 * ⚠️ 24 rather than something that lands on a neat total. A four-fold mark looks
 * identical every 90, so any multiple of 90 across the reel would make it appear to
 * snap back to where it started; 24 x 6 = 144 never repeats a position.
 */
const MARK_DEG_PER_PANEL = 24;

/** Linear interpolation. `t` is already clamped everywhere it is used here. */
const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

/**
 * The two heading tokens, in px at a given viewport width — `text-service-title` and
 * `text-h2` from `tailwind.config.ts`, transcribed.
 *
 * ⚠️ TRANSCRIBED, WHICH MEANS THEY CAN GO STALE. They exist because panel 07's heading
 * SCALES between the two tokens rather than swapping classes, and a scale needs both
 * sizes as numbers — CSS can hold a `clamp()` but cannot divide one by another. Ratios
 * matter, not absolutes: 0.75 at 768 (the pin's narrowest), 0.67 at 1440.
 *
 * **Change a token, change these.** There is no test that will catch it; the heading
 * will simply render at slightly the wrong size while it is a card.
 */
const TITLE_PX = (w: number) => Math.min(Math.max(23.8 + 0.0113 * w, 28), 40);
const H2_PX = (w: number) => Math.min(Math.max(24.9 + 0.0244 * w, 34), 60);

/**
 * ── The expansion is a SCRUB, not a latch (13 Aug, Jimmy) ────────────────────
 * `expand` is a continuous 0 → 1 read straight off the scroll position across
 * `VH_EXPAND`, and the card is exactly as open as you have scrolled.
 *
 * ⚠️ THIS IS THE THIRD CONTROL TYPE AND IT IS THE ONE THAT SHIPS. The full run:
 *
 *   1. SCRUB — the original. Replaced because the card could come to rest half-open.
 *   2. CSS-TRANSITION LATCH — `expand` binary, browser interpolates. Reverted within
 *      the hour: the things staged on this value include a TYPE TOKEN SWAP and an
 *      inline padding number, and a CSS transition cannot interpolate either, so they
 *      snapped while the box glided.
 *   3. TIMED TWEEN — a latch tripping an `EXPAND_MS` clock, with a scroll FLOOR to
 *      stop a hard flick outrunning it.
 *   4. SCRUB again — here.
 *
 * ⚠️ WHAT WAS ACTUALLY WRONG WITH THE TWEEN was not its feel, it was that a clock and
 * a wheel are two different drivers and nothing makes the wheel wait. Every hard case
 * — flick past the trigger, reverse mid-flight, over-scroll the end — is the same bug
 * wearing a different hat, and the floor, the two thresholds and the hand-over were
 * three separate patches for it. On a scrub none of those cases exist, because there is
 * only one driver. About sixty lines of machinery went with it.
 *
 * ⚠️ THE CURVE IS UNCHANGED — still `easeOutQuint`, still applied ONCE where `expand`
 * is set, so the shape of the move is identical to the tween's. Only what advances `t`
 * has moved, from `performance.now()` back to scroll position.
 *
 * ⚠️ THE HALF-OPEN REST STATE IS BACK, and it is handled rather than prevented. The
 * `snap-start` marker further down sits exactly where `expand` reaches 1, so a scroll
 * that stops mid-expansion is pulled to the open state — CSS doing the job the latch
 * was invented for, without a second driver. It is `proximity` snapping, so a
 * deliberate stop early in the move is still allowed to stand.
 *
 * ⚠️ `VH_EXPAND` IS A REAL LEVER AGAIN. It is now the scroll distance the expansion
 * costs, not the room a clock needs to finish in — raise it and the card opens more
 * slowly for the same wheel movement.
 *
 * ⚠️ GONE WITH THE TWEEN, and listed so they are not reintroduced piecemeal:
 * `OPEN_AT` / `CLOSE_AT` (the two latch thresholds, which had to stay in that order or
 * the latch ping-ponged), `EXPAND_MS`, `SCROLL_FLOOR`, `FLOOR_TAKEOVER`, `tweenTo`,
 * and the `expandRef` / `tweenRef` / `targetRef` / `floorRef` refs. None of them mean
 * anything without a clock.
 */

/**
 * Ease-out quint — decisive start, long decelerating settle.
 *
 * ⚠️ IT WAS `in-out-quint` AND THAT WAS THE MAIN THING MAKING IT FEEL ABRUPT. An
 * in-out curve is slow at BOTH ends, so after the threshold tripped the card sat
 * almost still for the first ~150ms — a hesitation between the scroll and the
 * response, which reads as lag rather than as ease. An out curve leaves immediately
 * and spends its time arriving, so the move answers the scroll and then settles.
 *
 * ⚠️ It cannot be a CSS easing token. Nothing CSS-transitionable is being animated —
 * the value is a NUMBER that a dozen interpolations read, and several of them (a type
 * token swap, an inline padding) CSS cannot interpolate at all.
 *
 * The nearest token is `ease-out-expo`; this is a fifth-power version of the same
 * shape, slightly less extreme at the start.
 */
const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);

/**
 * ⚠️ THIS IS THE ONE PANEL 07 USES. It took the job back from `easeOutQuint` when the
 * expansion went back to being scrubbed: quint spends about two-thirds of the move in
 * the first fifth of the scroll, which is decisive on a CLOCK — it covers the latency
 * of a threshold being crossed — but on a WHEEL there is no latency to cover and that
 * front-loading is simply speed. Cubic reaches half-open at 0.21 of the scroll where
 * quint is there by 0.13.
 *
 * `easeOutQuint` is kept, unused, as the sharper alternative; swapping them back is a
 * one-line change at the single application point in `measure`.
 *
 * Ease-out cubic.
 *
 * ⚠️ IT IS CORRECTING FOR AREA, not adding polish. Mapped linearly to scroll, the
 * card's WIDTH grows at a constant rate — but what the eye reads is AREA, which grows
 * with the square, so the same scroll delta covers far more visible change at the end
 * than at the start. Linear in scroll therefore *looks* like it accelerates, and the
 * last third arrives in a rush.
 *
 * Decelerating the value cancels that: most of the growth happens early, and the card
 * settles into full screen rather than snapping into it.
 *
 * ⚠️ Applied ONCE, where `expand` is set, so every consumer downstream — geometry,
 * frost, the quiz slot, the header scale — eases together. Easing them individually
 * is how they drift apart.
 */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export function Services({ header, panels, finale, className }: ServicesProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);
  const [progress, setProgress] = useState(0);
  /** 0–1 across the mobile carousel. Separate from `progress`, which is the reel. */
  const [swipe, setSwipe] = useState(0);
  /**
   * 0–1 across panel 07's expansion, which begins only once the reel has run out.
   * Separate from `progress` because they are different units — `progress` counts
   * PANELS, this counts one transition — and collapsing them into a single value
   * meant every consumer had to know where the panel count stopped and the
   * expansion started.
   */
  /**
   * 0 → 1 across panel 07's expansion, SCRUBBED BY SCROLL — see the long note above
   * `easeOutQuint` for why this is a scrub again and what went with the tween.
   *
   * ⚠️ Every consumer still receives the same continuous 0 → 1 sweep and stages on the
   * same fractions. The curve is the same one. Only the driver changed.
   *
   * ⚠️ No companion ref any more. `measure` used to need `expandRef` because the tween
   * wrote the value outside React and the latch had to read the CURRENT one; nothing
   * writes it now except the scroll handler itself, from a number it just derived.
   */
  const [expand, setExpand] = useState(0);
  /**
   * True once the pin's scroll budget is spent.
   *
   * ⚠️ Panel 07 is `fixed` while pinned, and `fixed` does not stop being fixed when
   * its section scrolls away — without this the expanded card would stay welded to
   * the viewport over Process, Pricing and everything after it. At the moment this
   * flips, the sticky box is sitting at the wrapper's bottom, so the absolute
   * position below resolves to exactly where the fixed one was painting and the
   * handover is invisible.
   */
  const [released, setReleased] = useState(false);
  /** The open card's height, so the section can reserve document space under it. */
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelH, setPanelH] = useState(0);
  /** The card's box at `expand = 0`. See the geometry note below. */
  const cardSlotRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const [cardRect, setCardRect] = useState<{
    top: number;
    left: number;
    /**
     * The slot's left edge in VIEWPORT coordinates.
     *
     * ⚠️ Separate from `left`, which is relative to the sticky box and is 0 (the slot
     * is `inset-0` of it). Panel 07 is `fixed`, so it needs the viewport number — and
     * the slot is inset by `section-x-flush` while the viewport is not, which is
     * exactly the 60px that used to make 07 arrive wider and further left than the six
     * cards beside it.
     *
     * ⚠️ Safe to take raw from `getBoundingClientRect()` where `top` is not: horizontal
     * position does not move with scroll, so this is correct whether or not the section
     * is pinned when it is measured.
     */
    viewLeft: number;
    width: number;
    height: number;
  } | null>(null);



  const n = panels.length;
  const hasFinale = Boolean(finale);
  /**
   * Slots in the reel — the six services plus panel 07 when it is present.
   *
   * ⚠️ `slots`, not `n`, drives EVERY piece of reel arithmetic from here down: the
   * wrapper height, the progress mapping, the numerals, and the spine's thumb. `n`
   * now means only "how many services are there", which is what the mobile
   * carousel's dots still want.
   */
  const slots = n + (hasFinale ? 1 : 0);
  /**
   * Viewport box and the page gutter, for panel 07's expansion target.
   *
   * ⚠️ The gutter is READ FROM THE CSS CUSTOM PROPERTY rather than hard-coded at
   * 10, because `globals.css` steps it to 5 below 640 and this has to follow
   * (CLAUDE.md §0). It is state rather than a render-time read so the first paint
   * is not a server/client mismatch — `window` does not exist during SSR.
   */
  const [{ vw, vh, gutterPx }, setViewport] = useState({ vw: 0, vh: 0, gutterPx: 10 });
  /**
   * ⚠️ `slots`, so panel 07 IS numbered. This went `slots` → `n` → `slots` across
   * 13 Aug: the quiz card was numbered, then unnumbered on the grounds that it is
   * not the seventh service, then numbered again once it joined the orbit — on the
   * wheel it is plainly the seventh thing, and an unlabelled stop reads as a gap
   * rather than as a distinction. `travel` stays passed so the two cannot disagree
   * if they ever diverge again.
   */

  useEffect(() => {
    /**
     * ⚠️ `1024px`, RAISED FROM 768 (Jimmy, 13 Aug: "this needs to be the same for
     * tablet as well"). The pinned orbit is a DESKTOP composition and always was: the
     * section title is fixed in the left third while six cards swing through the right
     * two-thirds on a 0.45-of-viewport radius. At 800px there is not enough width for
     * those to be two separate regions — the arc runs under the title and the copy
     * collides with the cards.
     *
     * So a tablet now gets what a phone gets: header, swipe strip, wheel behind it,
     * Find Your Fit as its own section. The design does not change between them, only
     * the width it is drawn at.
     *
     * ⚠️ This is the section's ONLY breakpoint and it is in JS, not CSS, because the
     * two branches are different DOM rather than different styling. It must stay in
     * step with `RESPONSIVE_SPEC.md` §5.4 — there is nothing that will catch a drift.
     */
    const wide = window.matchMedia("(min-width: 1024px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPinned(wide.matches && !reduced.matches);
    update();
    wide.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      wide.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!pinned) return;
    const el = wrapRef.current;
    if (!el) return;
    let raf = 0;

    function measure() {
      const box = el!.getBoundingClientRect();
      // Total scrollable distance is the wrapper's overhang beyond one viewport.
      const total = el!.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const scrolled = Math.min(Math.max(-box.top, 0), total);

      /**
       * ⚠️ THE BUDGET IS NO LONGER UNIFORM, which is why this is not simply
       * `scrolled / total * (n - 1)` any more. The wrapper's overhang is now
       * `(slots - 1) × VH_PER_PANEL + VH_EXPAND` — a run of equal panel
       * transitions followed by ONE SHORTER expansion — so the two segments have
       * to be measured separately or the expansion silently steals a slice of the
       * last panel's travel.
       *
       * `travelVh` is the panel run; past it comes the hold, the expansion, then the
       * settle — see those constants. Only the expansion maps to a value; the hold
       * and the settle are simply scroll in which nothing changes.
       */
      const travelVh = (slots - 1) * VH_PER_PANEL;
      /** Nothing happens between arriving and expanding — see `VH_HOLD`. */
      const expandFromVh = travelVh + VH_HOLD;
      const totalVh = travelVh + (hasFinale ? VH_HOLD + VH_EXPAND + VH_SETTLE : 0);
      const vh = (scrolled / total) * totalVh;

      /**
       * ⚠️ ONLY WHEN THE OBSERVER HAS NOT REPORTED. This used to read `offsetHeight`
       * on EVERY frame as belt-and-braces against `ResizeObserver` never firing — and
       * that made it a cause of the very jitter it was insuring against: reading
       * `offsetHeight` forces a synchronous reflow, and doing it on the element that
       * is mid-animation forces a full layout every frame of the expansion.
       *
       * The observer is still the instrument. This is now a one-off backstop for the
       * case where its callbacks never arrive (a backgrounded tab, or attaching before
       * the panel mounted), which is a 0 that will otherwise never correct itself.
       */
      if (!panelH && panelRef.current) setPanelH(panelRef.current.offsetHeight);

      setProgress(Math.min(Math.max(vh / VH_PER_PANEL, 0), slots - 1));

      /**
       * ── The expansion ──────────────────────────────────────────────────────
       * The whole thing, in two lines. `t` is raw position through the expand
       * segment; the curve shapes it; `expand` is the result. There is no state
       * machine because there is no second driver to reconcile with.
       *
       * ⚠️ THE EASE IS APPLIED HERE AND NOWHERE ELSE. A dozen things read `expand` —
       * the card's box, the frost, the quiz slot, the type step, the padding — and
       * easing any of them individually is how they drift out of step.
       *
       * ⚠️ `t` runs from the START of the segment, with no dead zone. The tween needed
       * one (`OPEN_AT`) because a threshold has to be crossed decisively; a scrub must
       * answer the very first pixel or it reads as lag.
       */
      if (hasFinale) {
        const t = Math.min(Math.max((vh - expandFromVh) / VH_EXPAND, 0), 1);
        /* ⚠️ `easeOut` (cubic), NOT `easeOutQuint` — see both. Quint was the tween's
           curve and it is right on a clock, where a decisive start hides the latency of
           a threshold. On a scrub there is no latency to hide and its front-loading is
           just speed: two-thirds of the move in the first fifth of the scroll. */
        setExpand(easeOut(t));
      }
      setReleased(hasFinale && -box.top >= total);
    }

    /**
     * rAF-coalesced: scroll fires far more often than the screen repaints.
     *
     * ⚠️ CANCEL-AND-RESCHEDULE, not a `ticking` boolean latch. The latch version
     * could deadlock permanently: it set `ticking = true`, scheduled a frame, and
     * only cleared the flag inside the callback — but rAF does not fire in a
     * BACKGROUNDED TAB. Switch away mid-scroll and the frame is never delivered, so
     * `ticking` stayed true and every later scroll early-returned. Come back to the
     * tab and the reel was frozen for good; only a resize or a reload recovered it.
     * Found 13 Aug while the test browser was occluded.
     *
     * This form cannot latch — each scroll cancels the stale frame and books a
     * fresh one, so the worst a hidden tab costs is that nothing updates while it
     * is hidden, which is correct.
     */
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    }

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pinned, slots, hasFinale]);

  /**
   * ── The card's resting box ──────────────────────────────────────────────────
   * Panel 07 grows from the copy column's box to the whole viewport, and only the
   * browser knows what the first of those is — it is a `flex-1`/`basis-1/2` column
   * inside a fluid row (CLAUDE.md §0 bans hard-coding it).
   *
   * ⚠️ It is measured from an EMPTY SIBLING that occupies the slot, never from the
   * panel itself. Measuring the panel would be measuring the thing whose size this
   * calculation sets — the classic feedback loop, where a half-expanded card
   * reports a half-expanded rect and the expansion converges on nonsense.
   *
   * ⚠️ Re-measured on resize, and NOT on scroll. The box only changes when the
   * layout does, and doing it per frame would force a synchronous reflow on every
   * scroll event.
   */
  /**
   * Where the card sits once the pin has been spent. The sticky box is then at the
   * wrapper's bottom, so this is exactly where the `fixed` version was painting at
   * that scroll position — which is what makes the handover invisible.
   */
  /**
   * A card's box on the arc, given its distance from the active slot.
   *
   * Returns `null` beyond `ORBIT_RENDER_LIMIT` so far-off cards are not in the DOM
   * at all — with seven panels that is five fewer surfaces for the compositor on
   * every frame.
   *
   * ⚠️ `force` OPTS OUT OF THAT, AND THE SIX SERVICE CARDS USE IT — for SEO, not for
   * looks. Each card's title is an `<h3>`, and culling the far ones meant only TWO of
   * the six service headings existed in the rendered DOM at any moment. Measured on the
   * live page: all six are in the SERVER HTML (the mobile branch renders them), and
   * four vanish on hydration when the desktop orbit takes over. Google indexes the
   * RENDERED DOM, so four of this studio's six services were invisible to it.
   *
   * The cost is small and the compositor absorbs it: an off-arc card is positioned far
   * outside the sticky box, which is `overflow-hidden`, so it is clipped and never
   * painted.
   *
   * ⚠️ PANEL 07 KEEPS THE LIMIT. It is the only one that mounts a whole interactive
   * quiz, and its content is a form rather than a heading — nothing there needs
   * indexing early.
   *
   * ⚠️ `panelW`/`panelBoxH` are the PANEL's box, not the viewport's. The panel is
   * inset by the gutter, and using viewport numbers here put every card ~10px out
   * and the drift grew with the radius.
   */
  const orbitBox = (d: number, force = false) => {
    if (!force && Math.abs(d) > ORBIT_RENDER_LIMIT) return null;
    const panelW = Math.max(vw - gutterPx * 2, 0);
    const panelHBox = Math.max(vh - gutterPx * 2, 0);
    const theta = (d * ORBIT_STEP_DEG * Math.PI) / 180;
    const r = ORBIT_R * panelW;
    const near = Math.min(Math.abs(d), 1);
    return {
      x: ORBIT_CX * panelW - r * Math.cos(theta),
      y: ORBIT_CY * panelHBox + r * Math.sin(theta),
      scale: 1 - (1 - ORBIT_NEIGHBOUR_SCALE) * near,
      /* The active card sits above its neighbours; without this the one entering
         from below paints over the card being read. */
      z: Math.round((1 - near) * 10),
    };
  };

  /**
   * Panel 07's own place on the arc — the slot after the last service.
   *
   * ⚠️ Derived from `slots - 1`, the same index the numerals label "07", so the card
   * and its number cannot disagree about where the seventh stop is.
   */

  const finaleBox = hasFinale ? orbitBox(slots - 1 - progress) : null;

  /**
   * ⚠️ `+ gutterPx` (13 Aug). It used to be bare, on the correct reasoning at the time
   * that the open card was edge-to-edge and therefore released at 0. The card now keeps
   * the gutter on its top edge, so the `fixed` version is painting `gutterPx` down the
   * viewport at the moment of release — and the handover is only invisible if the
   * `absolute` version lands on exactly the same pixel. Without this the card jumped up
   * by the gutter the instant the pin let go.
   */
  /**
   * ⚠️ A `fitScale` LIVED HERE AND WAS REMOVED THE SAME DAY (13 Aug). It shrank panel
   * 07 just enough to fit a short viewport, on the diagnosis that "cropped at the
   * bottom" meant the card was taller than the window.
   *
   * That diagnosis was wrong. The six service cards are cropped by the window too —
   * that is simply what a card arriving from below the fold looks like — and the real
   * complaint was the 10px of CREAM showing beneath 07, which came from the frame's
   * clip. A card that is smaller than its six neighbours is a worse answer than one
   * that runs off the screen like they do.
   */
  const releasedTop =
    ((slots - 1) * VH_PER_PANEL + VH_HOLD + VH_EXPAND + VH_SETTLE) * (vh / 100) + gutterPx;

  /**
   * The open card's own height, so the section can reserve document space under it.
   *
   * ⚠️ `cardRect` IS IN THE DEPENDENCIES AND IS NOT OPTIONAL. Panel 07 does not
   * mount until `cardRect` has been measured, and `cardRect` is set by a *later*
   * effect — so on the pass where this one first ran, `panelRef.current` was still
   * `null` and the observer bailed out and never attached. `panelH` then sat at 0
   * for the life of the page, the section reserved no space for the open card, and
   * the card's bottom edge butted straight into the next section. Listing `cardRect`
   * re-runs this the moment the panel actually exists.
   *
   * Observed rather than measured once: the quiz changes height as it is answered.
   */
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setPanelH(entry.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, [pinned, hasFinale, cardRect]);

  useEffect(() => {
    if (!pinned || !hasFinale) return;
    const read = () => {
      const el = cardSlotRef.current;
      const sticky = stickyRef.current;
      if (el && sticky) {
        /**
         * ⚠️ RELATIVE TO THE STICKY BOX, never to the viewport. Both rects are
         * viewport-relative and both move together as the page scrolls, so the
         * DIFFERENCE between them is scroll-independent — which is the whole point:
         * it can be measured at any scroll position, including before the section
         * is anywhere near the screen, and it is still right.
         *
         * Measuring the column's raw `getBoundingClientRect()` instead was the
         * first attempt and it was wrong in a way that looked plausible: on mount
         * the section is far down an unpinned page, so the card's resting `top` was
         * recorded as ~776 and the panel arrived most of a screen too low.
         */
        const c = el.getBoundingClientRect();
        const box = sticky.getBoundingClientRect();
        setCardRect({
          top: c.top - box.top,
          left: c.left - box.left,
          viewLeft: c.left,
          width: c.width,
          height: c.height,
        });
      }
      const g = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--space-gutter"),
      );
      setViewport({
        vw: window.innerWidth,
        vh: window.innerHeight,
        gutterPx: Number.isFinite(g) ? g : 10,
      });
    };
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, [pinned, hasFinale]);

  /**
   * ⚠️ `Ellipse 4` (36:215) — the green wash bleeding off the left edge — is NOT
   * built. Removed 12 Aug (Jimmy: it did not read on the page), and deliberately
   * NOT brought back on 13 Aug when a dark ground was trialled here.
   *
   * The reason it failed is worth keeping: at 60% over `neutral-100`, a soft green
   * wash on a warm light page has no edge and no relationship to anything, so it
   * registers as a smudge rather than as light. That is a failure of GROUND, not of
   * the idea — it works on `green-950`, which is exactly why it is not available on
   * this section. **Do not re-add it while Services is light.**
   *
   * The `glow-services` token is kept; restoring it is one span:
   *
   *   <span aria-hidden className="pointer-events-none absolute left-0 top-1/2
   *     aspect-square w-arch-glow -translate-x-1/2 -translate-y-1/2
   *     bg-glow-services" />
   *
   * placed as the FIRST child of the sticky container (and of the stacked section),
   * so it paints under the content.
   */
  const glow = null;

  /* ── Mobile, and anyone who asked for less motion ─────────────────────────
     A SWIPEABLE CAROUSEL, not a stack (13 Aug).

     ⚠️ It replaces a vertical list of all six panels, each with its own oversized
     numeral above it. That was six full screens of scrolling on a phone before the
     page moved on — the pinned reel's problem reproduced without the pin, and the
     numerals were the worst of it: at `text-numeral` they were taller than the copy
     they labelled. They are gone here entirely.

     ⚠️ REBUILT 13 Aug to match desktop: no green panel, `ServiceCard` in its `stacked`
     layout, the wheel behind the strip, and Find Your Fit lifted out into its own
     section below. What survives from the old build is the SHAPE — a swipe strip with
     dots — and the reasoning for it, below.
  */
  if (!pinned) {
    /* Nearest whole card. `onProgress` reports 0–1 across the whole strip, and with
       n cards the gaps between snap points are `n - 1`, not `n`. */
    const active = n > 1 ? Math.round(swipe * (n - 1)) : 0;

    return (
      <>
      <section
        id="services"
        className={cn(
          /**
           * ⚠️ NO HORIZONTAL PADDING HERE, and no `mt-block` either — both were
           * removed on 13 Aug and both were doubling something.
           *
           * `p-gutter` + `px-section-x` on the children reproduced the CONTAINERED
           * arithmetic (10 + 15 = 25 on a phone), which was right while this branch
           * painted a green panel. It paints no surface now, so by CLAUDE.md §0.1 it is
           * FLUSH and its children carry `section-x-flush` themselves — the same line
           * About and Process land on.
           *
           * `mt-block` was the Work → Services gap, on top of the section's own
           * `section-y-flush`. Two rhythms stacked put ~117px above the title where
           * every other flush section has ~67. **One source of vertical rhythm per
           * section** (Jimmy: "the padding above the title needs to match the other
           * sections"). The pinned branch keeps its `mt-block` — that 80 was set
           * deliberately for the desktop composition.
           */
          "relative w-full",
          className,
        )}
      >
        {/* ⚠️ THE GRADIENT PANEL IS GONE (13 Aug, Jimmy: "for mobile the design needs
            to match desktop, we are getting rid of the green"). It briefly painted
            `gradient-services` here, and after desktop went back to the page cream this
            branch was the last thing still on the dark ramp — the section was two
            designs rather than one adapted. AUDIT §6 resolved.

            Everything that depended on the dark ground moved with it: the header is
            `tone="light"` with an `ink` CTA (as `Work`'s is), the cards are opaque
            `ServiceCard`s rather than 7%-white glass, and `bg-fade-right` — which was
            always mixed from `neutral-100` and therefore always wrong on the gradient —
            is finally sitting on the colour it was built for.

            ⚠️ `py-section-y-flush` is on the SECTION now, not on a panel. With no
            surface to inset, the section is FLUSH on mobile exactly as it is on
            desktop (CLAUDE.md §0.1) and carries its own vertical rhythm. */}
        <div className="relative flex flex-col gap-2xl py-section-y-flush">
          {/* ⚠️ Everything in this column carries its own `px-section-x-flush` rather
              than inheriting it from the section, because the CAROUSEL must not: it
              pads its scroller instead, so the first card starts on the optical line
              while the rest run off the right edge. One shared padding on the section
              would either indent the strip or pull the title out of line. */}
          {/* ⚠️ THE HEADER RENDERS HERE TOO (13 Aug). It was added to the pinned branch
              only, so phones and reduced-motion got the carousel with no intro at all —
              a section that opened mid-thought. There is no pin to hang an intro beat
              on here, so it is simply a block above the strip. */}
          {/* ⚠️ `pb-2xl` ON TOP of the column's `gap-2xl`, so 56 between the CTA and the
              strip against 28 elsewhere (Jimmy, 13 Aug). Deliberately asymmetric, and
              for the same reason the dots carry `pt-md`: the header ENDS in a button,
              and a button 28px above a swipeable card reads as a control belonging to
              that card rather than to the section. The extra distance is what separates
              the two.

              ⚠️ It sits OUTSIDE the ternary. A JSX comment placed in an expression
              slot — between the `?` and the element it returns — is a syntax error
              rather than a comment, because the braces open a second expression. */}
          {header ? (
            <div className="px-section-x-flush pb-2xl">
              {/* ⚠️ `left` + `light` + an `ink` CTA — the same three the pinned branch
                  uses, which is the point: one design, adapted. It was `center` +
                  `dark` + `mint` for the gradient panel. Left-aligned also matters
                  more here than on desktop: the strip below it is left-aligned and
                  runs off the right edge, so a centred header sat at odds with the
                  thing it introduces. */}
              <SectionHeader
                eyebrow={header.eyebrow}
                heading={header.heading}
                body={header.body}
                align="left"
                tone="light"
                action={<Cta label={header.cta.label} href={header.cta.href} tone="ink" />}
              />
            </div>
          ) : null}

          {/* ⚠️ THE STANDALONE EYEBROW IS GONE (13 Aug). It sat between the header and
              the strip, repeating a label the `SectionHeader` above it already carries
              — two eyebrows, 28px apart, for one section. It existed because the strip
              used to be the only thing here; once the header was added it became a
              duplicate nobody removed. The `panelEyebrow` PROP went with it — it had no
              other consumer, and a prop nothing reads is a contract nobody honours. */}

          {/* ⚠️ The wrapper is FULL WIDTH inside the gutter and the Carousel
              carries the padding itself. That is what lets the first card start on
              the optical line while the rest run off the right edge — the cue that
              says there is more. `scroll-pl` matters as much as `pl`: without it a
              snapped card aligns to the scroller's edge rather than the optical
              line, so the strip starts correctly and then jumps on the first snap. */}
          <div className="relative">
            {/* ══ The wheel, behind the strip ════════════════════════════════
                ⚠️ THE SAME MARK THE DESKTOP ORBIT TURNS, brought here on 13 Aug so the
                two builds share their background as well as their cards. It does NOT
                rotate: there is no `progress` on this branch — the strip is swiped, and
                swipe position is not scroll position — and a mark that turned would
                need a second driver invented for it.

                ⚠️ IT IS ANCHORED TO THE STRIP, NOT THE SECTION. `-right-1/4` pushes it
                a quarter of its own box off the right edge, so it is cropped exactly as
                it is on desktop — the crop is what stops it reading as a logo. Sizing
                is `w-full` of the strip rather than `w-watermark`: that token is a
                desktop measurement (up to 960px) and would be several phone widths.

                ⚠️ `-z-10` and `overflow-visible` around it — the strip's own fade sits
                over the top, and the two must not fight. The mark is decoration and is
                safe to remove (CLAUDE.md §5).

                ⚠️ Opacity matches the desktop wheel's 0.45 of `neutral-400`, measured
                at 1.22:1 on `neutral-100`. See MOTION_SPEC. */}
            {/* 🔴 ⚠️ TWO SPANS, AND THE OUTER ONE IS NOT DECORATION — IT IS THE CLIP.
                `-right-1/4` pushes the mark a quarter of the strip's width PAST the
                right edge, and the strip is full-viewport-width, so unclipped it made
                the DOCUMENT ~25% wider than the screen: the whole page could be scrolled
                sideways on a phone (Jimmy, 13 Aug). A `fixed` element cannot do this;
                an `absolute` one inside an unclipped parent can, and this is the second
                time this build has shipped a horizontal scrollbar that way — see the
                note on `bg-glow-form` in `Footer`.

                ⚠️ THE CLIP CANNOT GO ON THE STRIP WRAPPER. That wrapper's box is the
                scroller's MARGIN box, and the scroller deliberately sits `-my-6xl`
                outside it so its `py-6xl` can show the cards' shadows — clipping there
                would slice the shadows straight back off. So the wheel gets its own
                `inset-0 overflow-hidden` layer instead, sized to exactly the strip.

                The crop is wanted anyway: the mark is cropped by the right edge on
                desktop too, and that is what stops it reading as a logo. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
            >
              <span
                className="absolute -right-1/4 top-1/2 aspect-square w-full -translate-y-1/2 blur-wheel"
                style={{ opacity: 0.45 }}
              >
                <Logo variant="mark" markClass="text-neutral-400" />
              </span>
            </span>

            {/* ⚠️ `basis-3/4` + `gap-4xl` (40) are ONE decision, and both moved
                together on 13 Aug (from 4/5 and the default 24). At 80% with a 24px
                gap the next card's sliver was close enough to the current one to
                read as a second column of the SAME panel rather than as the next
                one. Pulling the card in and pushing the gap out separates them:
                what shows past the edge is now unmistakably a different card. */}
            {/* ⚠️ `gap-xl` (24), DOWN FROM `gap-4xl` (40) — Jimmy, 13 Aug. The 40 was
                paired with `basis-3/4` to stop the next card's sliver reading as a
                second COLUMN of the current one; that pairing was made when the cards
                were glass on a dark panel and had no hard edge of their own. They are
                opaque white on cream now, each with its own radius and shadow, so the
                edge does the separating and the gap does not have to.

                ⚠️ `py-6xl -my-6xl` IS NOT SPACING — it is room for the SHADOW. An
                `overflow-x-auto` box clips vertically too, so `shadow-elevated`'s
                largest layer (`0 40px 40px -24px`, which reaches **56px** below the
                card) was being sliced flat along the bottom of the tallest card. The
                padding gives it 60px inside the scroller; the equal negative margin
                takes the same 60 back out of the layout, so nothing moves.

                ⚠️ The two must stay equal and must stay ≥ 56. If `shadow-elevated`
                changes, re-derive: extent = offsetY + blur + spread.

                ⚠️ `items-stretch` is what makes the cards EQUAL HEIGHT. The flex
                default would do it, but it is written explicitly because it is now
                load-bearing rather than incidental — it pairs with `h-full` on the
                card below, and either one alone does nothing. */}
            <Carousel
              itemClassName="basis-3/4"
              gapClassName="gap-xl"
              onProgress={setSwipe}
              className="-my-6xl scroll-pl-section-x-flush items-stretch px-section-x-flush py-6xl"
            >
              {/* ⚠️ THE HAIRLINE DIVIDERS ARE GONE (13 Aug), replaced by the card
                  surface. They were `border-l border-border-divider-soft pl-4xl` on
                  every panel but the first, tuned over several passes — `divider` →
                  `hairline` → `divider-soft`, with the padding matched to
                  `gapClassName` so the rule sat dead centre between two cards.

                  All of that answered ONE question: where does one service end. A
                  card with its own edge answers it better, and running both would
                  have been two boundaries for the same join.

                  ⚠️ `h-full` WENT WITH THEM, and its absence is the point. It made
                  every card the same depth by filling the Carousel item wrapper,
                  which flex already stretches to the tallest card. The cards now HUG
                  THEIR OWN CONTENT — six services, six heights, on purpose (Jimmy,
                  13 Aug). Equal heights left the two shortest services as mostly
                  empty box, which a hairline never did because a line has no interior
                  to leave empty.

                  ⚠️ Restoring equal heights is `h-full` here AND `items-stretch`
                  surviving on the wrapper — not one of the two.

                  `border-divider-soft` now has no other consumer — see the
                  unreferenced-token register in DESIGN_TOKENS.md §7b. */}
              {/* ⚠️ `ServiceCard`, not `ServicePanel` (13 Aug). The phone build now
                  runs the same component as the orbit, in its `stacked` layout — image
                  on top, copy underneath. `ServicePanel` has no other consumer and
                  `components/ServicePanel.tsx` can be deleted. AUDIT §5 resolved.

                  ⚠️ `distance` is left at its default 0. The strip has no depth: every
                  card is equally present and the one you are looking at is decided by
                  the scroller, not by a value we compute. Passing a swipe-derived
                  distance would blur cards the browser considers fully visible. */}
              {/* ⚠️ `h-full` — EQUAL HEIGHTS, reversed on 13 Aug (Jimmy: "the cards all
                  need to be same height, the smaller ones need to match the highest").
                  They hugged their own content before, on the reasoning that six
                  services are six lengths and equal heights left the shortest as mostly
                  empty box. On a SWIPE STRIP that reasoning does not hold: you see the
                  cards one at a time against a fixed frame, so a ragged bottom edge
                  reads as the layout shifting under you rather than as honest sizing.

                  ⚠️ It only works with `items-stretch` on the scroller above. Neither
                  half does anything alone. */}
              {panels.map((p) => (
                <ServiceCard
                  key={p.title}
                  className="h-full"
                  layout="stacked"
                  question={p.question}
                  title={p.title}
                  body={p.body}
                  image={p.image}
                />
              ))}
            </Carousel>

            {/* ⚠️ `basis-3/4` above and this fade are ONE decision. A full-width
                card leaves nothing showing, so the strip looks like a static block
                — the next card has to be visibly present AND visibly incomplete.
                75% shows roughly a quarter of the next one; the fade then keeps
                that sliver from reading as a second column of live content.

                ⚠️ `w-1/4`, WIDENED FROM `w-1/6` on 13 Aug, and it moved together with
                the token's stops — see `fade-right`. The band's width and the curve
                are one decision: easing the stops inside a narrow band only relocates
                the hard edge, and widening a linear ramp only makes a bigger hard edge.
                A quarter is also exactly the sliver of the next card that `basis-3/4`
                leaves showing, so the fade now covers that sliver and nothing else.

                `pointer-events-none` is not optional — this sits over the strip,
                and without it the right fifth of the carousel cannot be swiped. */}
            {/* ⚠️ `inset-y-0` still, NOT inset by the scroller's new `py-6xl`. The fade
                belongs to the STRIP's box, which the negative margin has kept exactly
                where it was — insetting it would leave 60px of un-faded card at top and
                bottom. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-fade-right"
            />
          </div>

          {/* ── Step dots ────────────────────────────────────────────────────
              ⚠️ Dots, not the bar this started as. A bar answers "how far through
              am I"; six dots also answer "how many are there", and on a swipeable
              strip with no visible end that second question is the one being asked.
              It also matches the quiz's stepper, which counts rather than fills.

              The active dot is nearly DOUBLE (10 against 6) as well as darker. At a
              smaller size difference the colour was doing all the work and the
              position was hard to read at a glance.

              ⚠️ `aria-hidden`. The carousel is a real overflow container, so the
              platform already exposes position to assistive tech and to the
              keyboard; this is the visual half of information that already exists.
              Making them buttons would add six tab stops to a thing you can already
              swipe, arrow through and tab into. */}
          {/* ⚠️ CENTRED. The dots sit under a strip whose content is deliberately
              left-aligned and running off the right edge, so aligning them left made
              them look like another item in that column. Centred, they read as
              chrome belonging to the whole carousel rather than to the card above
              them — which is what they are. */}
          {/* ⚠️ `pt-md` (12) ON TOP of the column's `gap-2xl` (28), so 40 above the
              dots against 28 everywhere else. Deliberately asymmetric: the gap
              above the carousel separates two things you read, while this one
              separates content from chrome — and chrome sitting on the content's
              own rhythm reads as another row of it. */}
          <div
            aria-hidden="true"
            className="flex items-center justify-center gap-sm px-section-x-flush pt-md"
          >
            {panels.map((p, i) => (
              <span
                key={p.title}
                className={cn(
                  "rounded-full transition-size duration-base ease-smooth",
                  i === active
                    ? "h-dot-active w-dot-active bg-green-600"
                    : "h-dot w-dot bg-border-divider",
                )}
              />
            ))}
          </div>

        </div>
      </section>

      {/* ══ FIND YOUR FIT — its own section on mobile ════════════════════════
          ⚠️ LIFTED OUT OF SERVICES (13 Aug, Jimmy). It used to sit inside the section,
          below the strip, which made it the seventh thing in a list of six — and on a
          phone that reads as an odd card at the bottom of the services rather than as
          an invitation.

          As its own `<section>` it gets its own vertical rhythm and its own id, which
          also gives the nav and any CTA something to link to.

          ⚠️ IT IS NOT A SEVENTH CAROUSEL CARD, and never was. Two reasons, both fatal:
          there is no pin here so there is nothing for an expansion to hang on, and the
          quiz is TAPPED while the carousel is SWIPED — an interactive card inside a
          horizontally-scrolling strip makes every answer a gamble on which gesture the
          browser decided it saw.

          ⚠️ `expand={1}` — already open. On desktop the card grows into this state;
          here it simply is it.

          🔴 ⚠️ **NO `h-quiz` WRAPPER, AND THAT WAS THE OVERLAP.** The panel used to sit
          in a `<div className="h-quiz">` — a FIXED height (clamp 560 → 650) inherited
          from when it was a block inside the Services section. The panel's own height
          is its CONTENT's, and once the container padding went to `section-y` the
          content outgrew that box: the div still reserved 650, the panel painted past
          it, and Process — an ordinary block in the flow directly below — was laid out
          under the overflow. It looked like Process was too high; it was the quiz's
          height that had stopped being declared honestly.

          The section takes the panel's natural height now. `h-quiz` still governs the
          `Quiz` component's own media/desktop geometry — it is only the outer spacer
          that is gone.

          ⚠️ **NO BOTTOM PADDING EITHER**, for the same reason the pinned branch has no
          spacer: a section ENDS where it ends, and the NEXT section's own padding is
          the gap. Process is flush and carries `py-section-y-flush`. This section
          previously added `pb-section-y-flush` on top of that, which doubled the gap to
          ~134 on a phone — the same duplicated-rhythm bug the section header had.

          ⚠️ This branch also serves `prefers-reduced-motion` at every width — `pinned`
          is false for both — which is why the expansion needs no reduced-motion
          handling of its own.

          ⚠️ FLUSH, like Services above it: it paints no section surface (the CARD is
          the surface), so it carries `section-x-flush`/`section-y-flush` itself rather
          than a gutter inset (CLAUDE.md §0.1). */}
      {finale ? (
        <section id="find-your-fit" className="w-full px-gutter">
          <QuizPanel
            eyebrow={finale.eyebrow}
            heading={finale.heading}
            body={finale.body}
            image={finale.image}
            quiz={finale.quiz}
            expand={1}
          />
        </section>
      ) : null}
      </>
    );
  }

  /* ── Pinned reel ─────────────────────────────────────────────────────────── */
  return (
    /* ⚠️ `paddingBottom` reserves the document space the OPEN card needs once it is
       taller than the viewport, and it is EXACTLY the overflow — nothing more. It
       sits on the section rather than the wrapper on purpose: the wrapper's height IS
       the pin's scroll budget, and adding to it would silently stretch the reel's
       travel every time the quiz changed height.

       ⚠️ It is NOT the gap to the next section. Getting only this right left the
       card's bottom edge butted straight against Process's eyebrow — the padding
       covered the overflow and then stopped, so there was no rhythm at all between
       them. The spacer at the foot of this section is what provides that, and the
       two are separate because one is arithmetic and the other is design. */
    <section
      id="services"
      /* ⚠️ `mt-block` — 80px between Work and the green panel. It went
         `block` (80) → `section-y` (100) → `section-y-flush` (120) → back to `block`
         across 13 Aug; the round trip is why the token is worth naming rather than the
         number.

         It is a MARGIN on this section rather than padding on Work, because Work is a
         containered panel and padding inside it would move its own content rather than
         separate the two surfaces.

         ⚠️ `block` maxes at exactly 80 and steps down to 48 on a phone, which is the
         right behaviour — a fixed 80 between two full-bleed panels is a lot of dead
         screen on a handset.

         ⚠️ The mobile branch carries the same class. They are one measurement written
         twice; change one and change the other. */
      className={cn("relative mt-block w-full", className)}
      style={{
        paddingBottom: hasFinale
          ? Math.max(0, panelH - vh)
          : undefined,
      }}
    >
      {/* ⚠️ OUTSIDE THE PIN, and that is the whole reason this can exist. It sits
          before `wrapRef`, so it scrolls away normally and only the reel locks —
          inside the sticky box it would be held on screen for five viewport-heights
          while you read six services underneath it. It costs the scroll maths
          nothing: `progress` is measured from the WRAPPER's own box, so anything
          above the wrapper is not part of the travel.

          ⚠️ On the PAGE, not on the gradient. The panel's ground starts at the
          wrapper; this header is `neutral-100` like every other section header, which
          is why it uses `light` tone and needs the gutter + `section-x` itself. */}
      {/* ⚠️ THE HEADER USED TO BE HERE, on the light page above the panel, sticky at
          120px so the panel could climb over and bury it. All of that is gone (13 Aug)
          — the title now lives INSIDE the panel and leaves by travelling up within it,
          so there is nothing for a sticky to do. Removed with it: the matching
          `top-section-y-flush`, and the rule that it had to equal the section's own
          `top` offset that had to equal the section's own top margin, or the header
          would jump as it locked. */}
      <div
        ref={wrapRef}
        className="relative w-full"
        // One viewport for the pin itself, plus the travel, plus the expansion.
        style={{
          height: `calc(100vh + ${
            (slots - 1) * VH_PER_PANEL +
            (hasFinale ? VH_HOLD + VH_EXPAND + VH_SETTLE : 0)
          }vh)`,
        }}
      >
        {/* ⚠️ SERVICES IS NOW CONTAINERED, NOT FLUSH (13 Aug). It paints a surface —
            the gradient below — so by CLAUDE.md §0.1 it sits inside the 10px gutter
            and carries `section-x` (50) rather than `section-x-flush` (60). Both land
            content on the same 60px optical line; the arithmetic is `10 + 50` now
            instead of `0 + 60`. The §0.1 table lists which sections are which and has
            been updated.

            The gutter is PADDING on the sticky box rather than an inset on the panel,
            so the panel's own border box is the full viewport minus the gutter — which
            makes it the natural reference frame for everything positioned inside it,
            including panel 07's expanded state (it simply fills the panel). */}
        {/*
          ⚠️ THE SNAP POINT — the scroll offset at which the card finishes expanding,
          so the page comes to rest with it open rather than an over-scroll carrying
          straight through into Process.

          ⚠️ Its position is DERIVED, not measured: the budget is expressed in vh, and
          the expansion completes exactly `travel + hold + expand` into it. Hard-coding
          a number here, or measuring the card, would both drift the moment any of
          those three constants moved.

          ⚠️ Zero height and `pointer-events-none` — it exists only to be a snap
          target. `snap-start` aligns ITS top edge with the viewport's top edge, which
          is the position where `expand` reaches 1.

          ⚠️ It only exists in the pinned branch, so mobile and reduced motion get no
          snapping at all — correct, since there is no expansion there to rest at.
        */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 h-0 snap-start"
          style={{ top: `${(slots - 1) * VH_PER_PANEL + VH_HOLD + VH_EXPAND}vh` }}
        />

        {/* ⚠️ NO PANEL, NO GUTTER INSET (13 Aug). The section went back to the page
            cream, so it paints no surface — which by CLAUDE.md §0.1 makes it FLUSH
            again, `section-x-flush` (60) rather than the gutter + `section-x` it used
            while it was a green panel. The §0.1 table has been moved back.

            The sticky box is the viewport itself now rather than a card floating in
            it, so there is nothing to inset and nothing to round. */}
        <div className="sticky top-0 h-screen w-full overflow-hidden px-section-x-flush">
          <div ref={stickyRef} className="relative flex size-full items-center">
          {/* ══ THE TITLE ═══════════════════════════════════════════════════════
              ⚠️ FIXED TOP-LEFT AND IT DOES NOT MOVE (13 Aug). It held, then travelled
              up and out across a 70vh intro while the reel rose to meet it; that whole
              beat is gone. The title, the wheel, the cards and the sketch are meant to
              share one screen, and a title that leaves cannot share anything.

              ⚠️ `VH_INTRO` went with it — the budget lost its first segment and the
              section is 70vh shorter.

              ⚠️ `w-1/3`, and this is a SETTLED value that has been round the houses:
              `2/5` → `1/3` → `1/4` → back to `1/3`. Two-fifths was measurably too wide
              (the sub-copy ended within a few pixels of the active card's left edge);
              a quarter bought the gap but wrapped the 60px heading onto three lines and
              squeezed the CTA, which cost more than the gap was worth. A third is the
              balance. A proportion rather than a max-width so the relationship holds at
              every viewport (CLAUDE.md §0).

              ⚠️ `absolute`, not a flow child: in flow it would take height from the
              sticky box and push the orbit's centre down off the middle of the screen. */}
          {header ? (
            <div className="absolute left-0 top-0 z-10 w-1/3 pt-section-y">
              <SectionHeader
                eyebrow={header.eyebrow}
                heading={header.heading}
                body={header.body}
                align="left"
                tone="light"
                /* ⚠️ `ink` again, not the `mint` the green panel needed. Back on the
                   warm page this is the same tone `Work`'s header uses, which is the
                   other section intro on cream. */
                action={<Cta label={header.cta.label} href={header.cta.href} tone="ink" />}
              />
            </div>
          ) : null}

          {/* ⚠️ THE LAPTOP SKETCH WAS HERE AND IS GONE (13 Aug). It sat bottom-left
              at a quarter width, from `public/media/laptop-drawing.svg` — the asset is
              still there if it comes back. It was removed rather than resized: on a
              viewport rather than the concept's tall artboard there was no height for
              both it and the title block, and it kept colliding with the CTA. */}

          {glow}

          {/*
            ── The spine ────────────────────────────────────────────────────────
            A rule whose filled portion tracks progress through the reel.

            ⚠️ RIGHT edge, not left (13 Aug). Left was tried first and it was the
            wrong side: it put a progress indicator OUTBOARD of the numerals, which
            are themselves the progress indicator, so the two competed for the same
            job in the same column. On the right it sits in the strip the copy
            column already reserves via `pr-services-inset` — genuinely dead space —
            and it reads as a scrollbar for the section, which is what it is.

            It earns its place twice. Compositionally it fills that strip; the
            section had nothing at all outboard of the copy. And functionally it is
            the only thing telling you how much is left: the reel pins the page for
            five viewport-heights with no indication of the end.

            ⚠️ `aria-hidden`, and that is not laziness. The numerals already carry
            the position in the accessible tree; a progressbar here would announce a
            second, redundant one on every scroll frame, which is noise. The spine is
            the visual half of information that is already available.

            ⚠️ A TRAVELLING THUMB, not a filling bar (13 Aug). A bar that grows
            from the top measures how much you have consumed; a short marker sliding
            down a full-length track shows POSITION, which is the question someone
            five viewport-heights into a pinned section is actually asking. It also
            matches the numerals beside it, which slide rather than accumulate.

            ⚠️ TWO WIDTHS. The track is a 1px hairline; the thumb is `w-spine` (3px)
            with a round cap, riding centred over it. A green hairline the same
            weight as its own track reads as a rule that happens to be coloured —
            the extra 2px and the cap are what make it read as a marker.

            ⚠️ The `top` calc subtracts the thumb's own height before scaling, so
            at full progress the thumb's BOTTOM lands on the end of the track rather
            than its top overshooting past it by 30px.

            No transition. It is driven directly by scroll, so easing it would make
            it lag the thing it is reporting on.
          */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-section-x-flush top-1/2 h-spine w-spine -translate-y-1/2"
            /* ⚠️ Fades in with the reel but does NOT rise with it. It reports position
               through the section, so it belongs to the panel rather than to the
               content — sliding it in would make it look like part of the reel. */
            style={{ opacity: 1 - expand }}
          >
            {/* The track: a hairline, centred in the 3px box.

                ⚠️ `border-divider`, NOT `border-on-dark` (13 Aug). `on-dark` is
                `rgba(255,255,255,0.2)` — a white hairline, correct while this section
                was a dark gradient panel and all but invisible now the ground is cream:
                white on `neutral-100` is 1.03:1. `border-divider` (#CED6D0) is the
                site's light-ground hairline and the token every other rule on a cream
                section already uses. 1.37:1 against the page — a hairline, which is
                what a track should be. */}
            <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border-divider" />

            {/* The thumb.

                ⚠️ `green-600`, THE BRAND GREEN (13 Aug). The full run is
                green-600 → green-400 → green-600 → green-300 → back to green-600, and
                the flip-flopping is not indecision, it is the GROUND changing under it.
                On the dark gradient the two darker greens disappeared and `green-300`
                (mint) was the only one that read; on cream that is exactly reversed.
                Measured against `neutral-100`:

                  green-300  1.80:1   ✗ — invisible, and it was the previous value
                  green-400  2.76:1   ✗ — just under
                  green-600  7.04:1   ✓

                ⚠️ It is the ONLY thing telling you how far through a five-screen pin
                you are, so it is the one element in this strip that should be legible
                rather than atmospheric — the opposite call to the wheel behind it. It
                is `aria-hidden` (the numerals carry the position in the accessible
                tree), so WCAG 1.4.11's 3:1 does not formally bind here; 7.04 is chosen
                because the job is to be READ, not to pass. */}
            <span
              className="absolute inset-x-0 rounded-full bg-green-600"
              style={{
                height: `${SPINE_THUMB}px`,
                // `n - 1` transitions, not `n` panels: the first service is already
                // showing at progress 0, so the thumb would start a sixth of the
                // way down before the reel had moved at all.
                top: `calc(${
                  slots > 1 ? Math.min(Math.max(progress / (slots - 1), 0), 1) : 1
                } * (100% - ${SPINE_THUMB}px))`,
              }}
            />
          </span>

          {/* ══ The background mark ═════════════════════════════════════════════
              An oversized Otix mark, cropped by the right edge, that turns with the
              reel.

              ⚠️ It is the BRAND MARK, not a cog. A gear was the first idea and was
              talked out: this section already has four things moving off one scroll
              value (numerals, spine thumb, panel stagger, panel 07), so a fifth had
              to earn its place — and a gear is generic machinery on a site that
              sells design to small businesses. The mark does the same job and is the
              one shape that is unarguably yours.

              ⚠️ CROPPED, LOW-CONTRAST AND HUGE, which is what stops it reading as a
              logo. At `accent-numeral` and 10% it belongs to the same quiet sage
              layer as the numerals and the service icons rather than sitting on top
              of the section as a graphic.

              ⚠️ Behind the spine deliberately (`-z-10`), and it must stay there: the
              spine is the only thing telling you how far through a five-screen pin
              you are, and a decorative element crossing it would compete with the
              one piece of real information in that strip.

              ⚠️ `aria-hidden` via `Logo`'s `mark` variant, and it fades with the row
              as panel 07 opens — it is decoration and must be removable without the
              section losing anything (CLAUDE.md §5). */}
          <span
            aria-hidden="true"
            className={cn(
              // ⚠️ `h-`/`w-watermark`, not `size-watermark`: Tailwind's `size-*`
              // reads the SPACING scale, and this token lives in `width`/`height`.
              // ⚠️ The translate and rotate live in the inline `style`, not here — a
              // transform class and an inline transform cannot coexist, and the
              // inline one wins outright.
              // ⚠️ `blur-wheel` softens it into the background. Unblurred at this size
              // the mark is a sharp 77px-wide outline sitting UNDER the cards rather
              // than behind them in depth — crisp enough to read as a graphic pasted
              // on the panel instead of as atmosphere.
              "pointer-events-none absolute right-0 top-1/2 -z-10 h-watermark w-watermark blur-wheel",
            )}
            style={{
              /* ⚠️ 0.45 — MEASURED, not guessed, and it is the fourth value on cream.
                 The run: 0.1 → 0.14 on the dark ground → 0.55 → 1 → 0.65 → here.

                 `neutral-400` (#CDC5B7) is the dark cream in the scale, so full
                 strength should have been right on paper. It is not: the mark is a
                 large continuous FORM, and a shape this size at 1.59:1 against the page
                 stops being atmosphere and starts being an object with an edge, which
                 puts it in front of the cards it is supposed to sit behind. Small marks
                 can take a contrast a big one cannot.

                 Composited against `neutral-100` (#F7F6F4):
                   · 0.45 → #E4E0D9, 1.22:1 — here, effectively `neutral-300`
                   · 0.55 → #E0DBD2, 1.28:1
                   · 0.65 → #DCD6CC, 1.34:1
                   · 1.00 → #CDC5B7, 1.59:1 — reads as a graphic pasted on
                 The useful range is narrow — a tenth of an alpha is about five
                 hundredths of a ratio — which is why these are stepped and recorded
                 rather than nudged by eye.
                 Purely decorative and `aria-hidden`, so no contrast MINIMUM applies
                 (WCAG 1.4.11 exempts decoration) — the ceiling is the constraint.

                 It still fades to nothing as panel 07 opens (`1 - expand`). */
              opacity: (1 - expand) * 0.45,
              transform: `translate(33.333%, -50%) rotate(${progress * MARK_DEG_PER_PANEL}deg)`,
            }}
          >
            {/* ⚠️ `sheen` gets the SAME angle this span is rotated by, so `Logo` can cancel
                it and hold the highlight still while the form turns through it. Pass a
                different number and the light drifts, which is worse than no light. */}
            <Logo
              variant="mark"
              /* ⚠️ No `sheen` on the cream ground. The specular gradient was built for
                 a dark panel, where a bright band reads as light catching a solid
                 form; on a warm light page its `green-50` highlight is lighter than
                 the page itself, so the mark breaks into pieces where the band
                 crosses it. Flat `neutral-400` — the same value as the sketch, so the
                 two background marks sit on one layer. */
              markClass="text-neutral-400"
            />
          </span>

          {/* `px-services-inset` is EXTRA padding on top of the section's own
              `section-x-flush`, so the row runs ~160 in from each edge at desktop
              rather than 60. It sits on the row, not the section, because a
              section's padding cannot be added to.

              ⚠️ THE TWO SIDES ARE NOT EQUAL, and the difference is deliberate. It
              was right-side only at first, then mirrored (`px-services-inset`) to
              pull the pair toward the middle, and is now asymmetric again — leading
              70 against a trailing 100 — to nudge the numerals and copy back
              ~30px LEFT of centre. Making them equal re-centres the composition,
              which is a design change rather than a simplification. See the note on
              `services-inset-left` in the config.

              ⚠️ The spine is NOT inside this padding — it is positioned against
              the sticky container at `right-section-x-flush`, so it stays on the
              60 line while the content moves in. That separation is deliberate: the
              spine belongs to the section, the row belongs to the composition. */}
          {/* ⚠️ THE ICON COLUMN IS GONE (13 Aug). It held the six service glyphs at
              numeral size — itself a replacement for the `01`…`07` numerals — down the
              left of the reel. Two things removed it: each card now carries its own
              image, so the column was a second visual for the same service, and the
              left of the screen is where the sketch lives.

              ⚠️ `ServiceNumerals` IS DELETED (13 Aug audit). After the column went it
              was imported by nothing but the `/dev/components` harness — a component
              being kept alive by the page whose job is to review components. */}

          {/* ⚠️ A SIBLING OF THE ROW, not a child of it. The row is a flex line
                whose height is the numerals', so `inset-0` inside it would have
                resolved to that band rather than to the panel — the arc's vertical
                centre would sit wherever the numerals happen to end. Positioned
                against the panel it is the composition's real centre.

                `pointer-events-none` on the frame with `-auto` restored per card, so
                the empty space around the arc does not swallow clicks. */}
            <div ref={cardSlotRef} className="pointer-events-none absolute inset-0">
              {panels.map((p, i) => {
                /* `force`: always in the DOM — see `orbitBox`. The `!box` guard stays
                   because the signature can still return null, not because it will. */
                const box = orbitBox(i - progress, true);
                if (!box) return null;
                return (
                  <div
                    key={p.title}
                    className="pointer-events-auto absolute will-change-transform"
                    style={{
                      left: box.x,
                      top: box.y,
                      width: `${ORBIT_CARD_W * 100}%`,
                      /* ⚠️ The card scales ITSELF from `distance` — see `ServiceCard`
                         — so the orbit only places it. Scaling here as well would
                         compound the two. */
                      transform: "translate(-50%, -50%)",
                      zIndex: box.z,
                    }}
                  >
                    {/* ⚠️ `ServiceCard`, not `ServicePanel` (13 Aug). The panel was
                        a copy block with a glass surface for a dark ground; this is a
                        horizontal card with a media column and tag pills for the page
                        cream. `ServicePanel` is still live on the mobile carousel, so
                        both exist — see the note at the top of `ServiceCard`.

                        ⚠️ `distance` drives the shrink AND the blur inside the card.
                        The green build could not blur — those cards were frosted, and
                        a blur on a frosted card makes the two effects stop meaning
                        different things. These are opaque, so it is available again. */}
                    <ServiceCard
                      question={p.question}
                      title={p.title}
                      body={p.body}
                      image={p.image}
                      distance={Math.min(Math.abs(i - progress), 1)}
                    />
                  </div>
                );
              })}
          </div>
          </div>
        </div>

        {/* ══ PANEL 07 — the finale ═══════════════════════════════════════════
            ⚠️ IT IS `fixed`, AND IT IS OUTSIDE THE STICKY BOX — both are forced,
            not stylistic:

              · the copy track is `overflow-hidden` (it is masked), and the sticky
                container is too, so anything inside either is clipped to the
                viewport. Once expanded this card is TALLER than the viewport, so
                it has to live outside both or its bottom is simply cut off.
              · `fixed` takes it out of flow entirely, so nothing it does can
                change the wrapper's height and feed back into the scroll maths.

            ── The three movements ────────────────────────────────────────────
            ARRIVAL (progress 5 → 6): it travels up from BELOW THE FOLD. The
            distance is measured from the viewport's bottom edge, not from the
            card's own height — with the card hugging its content it is now much
            shorter than a slot, so translating by its height left its top edge
            sitting ~100px inside the viewport for the whole of panel 06. It was
            visible at the bottom of the screen before it was meant to exist.

            EXPANSION (expand 0 → 1): `top` and the horizontal insets interpolate
            from the copy column's measured box to the page gutter.

            ⚠️ NO BOTTOM INSET, and no height at all. The card's height is its
            CONTENT's height (see `QuizPanel`), so it hugs while it is a card and
            runs off the bottom of the screen once the quiz is in — which is what
            gives the quiz somewhere to scroll to.

            ⚠️ `gutter` is read from the CSS custom property, so the 5px mobile
            step comes free (CLAUDE.md §0). Never `inset-x-0`. */}
        {/* ⚠️ `cardRect` IS PART OF THE GATE, not just a value used inside. Panel 07's
            resting box is now expressed in the SLOT's coordinates, and the slot has to
            have been measured before there is anywhere to put the card — rendering it
            against a fallback for one frame would place it at the viewport's origin and
            snap. It is measured on mount, so this costs at most the first paint. */}
        {finale && finaleBox && cardRect ? (
          /**
           * ⚠️ A CLIPPING FRAME, not decoration. Panel 07 is `fixed` so it can grow
           * past the viewport once open, and `fixed` ignores every ancestor's
           * `overflow-hidden` — including the one that crops cards 01–06 to the
           * panel. On its own it was the single card not obeying the panel's edges:
           * it painted over the gutter and the page beyond as it swung in.
           *
           * This frame IS a fixed element, so its own `overflow-hidden` does clip its
           * absolutely-positioned child. Its box interpolates from the panel (inset by
           * the gutter) to the viewport, so 07 arrives through exactly the same crop
           * the other six do and then grows out of it.
           *
           * ⚠️ A `clip-path` on the card was tried first and was worse. Its insets are
           * in the CARD's coordinates, so they needed the card's measured height —
           * unreliable — and the reference frame stayed pinned at the gutter, which
           * left the card cropped 10px short at full screen and then snapping. That is
           * the "sticks at the gutter then jumps" fault.
           *
           * ⚠️ The clip is dropped at `expand >= 1`. Open, the card is TALLER than the
           * viewport and must overflow for the page to scroll it. Switching there is
           * invisible because that is the settle — the card is not moving.
           */
          <div
            className={cn(
              /**
               * ⚠️ `absolute` ONCE RELEASED, NEVER `fixed`. `releasedTop` is a
               * DOCUMENT coordinate — roughly 4700px down the wrapper — and on a
               * fixed element that is 4700px below the viewport's top edge, so the
               * card vanished the instant the pin let go. Absolute resolves it
               * against the wrapper, which is what the number means.
               *
               * The card element inside used to carry this switch; it moved out here
               * when the frame was introduced and the switch did not come with it.
               */
              released ? "absolute" : "fixed",
              /* ⚠️ The card animates `top`/`left`/`width` — LAYOUT properties, so every
                 frame costs a layout and a paint. There is no transform-only version:
                 scaling would scale the copy inside, which has to hold its own size.
                 `will-change` at least lets the compositor prepare for it. */
              "will-change-transform",
              /**
               * ⚠️ NO `overflow-hidden` AT ALL, AT ANY VALUE OF `expand` (13 Aug). It
               * was the cream line under the green card as it came in.
               *
               * The frame is inset from the viewport by the gutter, so a clip on it cut
               * the card 10px ABOVE the fold and let 10px of page show underneath —
               * which reads as the card being sliced, because nothing else on screen is
               * sliced there. The six service cards live in the sticky box instead, and
               * that is `h-screen`: they are cut by the WINDOW EDGE exactly, with no
               * strip beneath them, so they read as continuing off the screen.
               *
               * Removing the clip puts 07 on the same footing — it paints down to the
               * window edge and runs off it like the others.
               *
               * ⚠️ Nothing is lost. A `fixed` element cannot paint outside the viewport
               * anyway, so the clip was never containing anything except those 10px,
               * and the card carries its own `rounded-3xl`, so the corners never
               * depended on the frame's.
               *
               * ⚠️ TWO EARLIER ATTEMPTS READ THIS BUG WRONG and are worth not
               * repeating: narrowing the clip to the arrival only (it still cut the same
               * 10px), and a `fitScale` that shrank the card to fit short viewports
               * (which solved a problem the design does not have — the other six are
               * cropped by the window too, and that is what "coming in" looks like).
               */
            )}
            style={
              released
                ? { top: releasedTop, left: gutterPx, right: gutterPx }
                : {
                    /**
                     * ⚠️ THE GUTTER IS HELD ON THREE SIDES, OPEN OR NOT (Jimmy, 13 Aug).
                     * These used to interpolate to 0 so the open card was edge-to-edge;
                     * it now stays inside the page frame the whole site sits in
                     * (CLAUDE.md §0), so full screen means "the viewport minus the
                     * gutter", not "the viewport".
                     *
                     * ⚠️ Constants now, not `lerp`s — there is nothing to interpolate
                     * between. Left as explicit `gutterPx` rather than folded into a
                     * class because the value steps to 5 below 640 and is read from the
                     * custom property.
                     *
                     * ⚠️ BOTTOM STILL GOES TO 0, and that asymmetry is deliberate. The
                     * open card is TALLER THAN THE VIEWPORT — it hugs a quiz that does
                     * not fit — and runs off the fold, so its bottom is not an edge and
                     * must not be given one. A gutter there would draw a closing line
                     * under something that does not close.
                     *
                     * ⚠️ It was briefly `gutterPx` too, alongside a height cap on the
                     * card. Both went back together; one without the other leaves a
                     * 10px band of page showing under a card that is still going.
                     */
                    top: gutterPx,
                    left: gutterPx,
                    right: gutterPx,
                    bottom: lerp(gutterPx, 0, expand),
                  }
            }
          >
          <div
            ref={panelRef}
            className="absolute will-change-transform"
            style={{
              /**
               * ⚠️ IN THE FRAME'S COORDINATES, so no `+ gutterPx` — the frame already
               * starts at the gutter. This is the same polar position the six service
               * cards use, against the same box, which is what makes 07 arrive
               * identically rather than merely similarly.
               */
              /**
               * ⚠️ THE SLOT'S OFFSET, NOT THE FRAME'S (13 Aug). `finaleBox.x/y` are
               * positions inside the CARD SLOT — the same numbers the six services are
               * placed with — but this card lives in the gutter frame, which starts
               * 10px in from the viewport while the slot starts at `section-x-flush`
               * (60). Painting the slot's coordinates into the frame put 07 50px left
               * of the arc the other six ride, and it was invisible as a bug because
               * the card was ALSO too wide, so its centre still looked roughly right.
               *
               * Both offsets unwind to 0 as it opens, because open it IS the frame.
               */
              top: released
                ? 0
                : lerp(cardRect.top - gutterPx + finaleBox.y, 0, expand),
              left: lerp(cardRect.viewLeft - gutterPx + finaleBox.x, 0, expand),
              /**
               * ⚠️ `cardRect.width`, NOT `vw - gutterPx * 2`. This is the fix for the
               * same bug: `ORBIT_CARD_W` is a fraction OF THE SLOT, and the six cards
               * spend it against the slot (`width: 42%` of a box inset by 60 a side)
               * while this one was spending it against the viewport inset by 10. On a
               * 1440 screen that is 42% of 1420 against 42% of 1320 — 07 arrived ~42px
               * wider than the card it was queued behind.
               *
               * One fraction, one reference box, so the two cannot drift apart again.
               */
              /**
               * ⚠️ `vw - gutterPx * 2` OPEN, not `vw`. The frame now keeps its gutter
               * on both sides at every value of `expand`, so a card sized to the whole
               * viewport would be 20px wider than the box holding it — and with the
               * arrival clip gone there is nothing left to hide the overflow.
               */
              width: lerp(ORBIT_CARD_W * cardRect.width, Math.max(vw - gutterPx * 2, 0), expand),
              /**
               * ⚠️ The centring translate UNWINDS as it opens. On the orbit the card
               * is positioned by its CENTRE (`-50%, -50%`, like its neighbours);
               * expanded it is anchored top-left. Interpolating the percentage carries
               * it between the two — pick one anchor for both and the card leaps half
               * its own size the instant the expansion starts.
               */
              transform: released
                ? undefined
                : `translate(${-50 * (1 - expand)}%, ${-50 * (1 - expand)}%) scale(${lerp(
                    finaleBox.scale,
                    1,
                    expand,
                  )})`,
              /* ⚠️ NO `opacity` — see `ORBIT_NEIGHBOUR_SCALE_ONLY` in this file. */
              zIndex: finaleBox.z,
            }}
          >
            <QuizPanel
              eyebrow={finale.eyebrow}
              heading={finale.heading}
              body={finale.body}
              image={finale.image}
              quiz={finale.quiz}
              expand={expand}
              /**
               * ⚠️ **ONE VALUE, ALL FOUR SIDES: 48 → 100.** As a CARD it is 48 all
               * round (`5xl`), the padding it shares with the six service cards; open
               * it goes to `section-y`'s maximum (100) on every edge.
               *
               * ⚠️ The sides went 60 → 120 → **100** across 13 Aug, and landing on the
               * vertical is the answer rather than a compromise. 60 (`6xl`, the flush
               * line every other section lands on) was too close to the edge: those
               * sections have the PAGE around them doing the containing, and this one
               * is the whole viewport with nothing outside it. 120 fixed that and
               * introduced a different fault — a frame wider than it is tall reads as a
               * letterbox, and the eye picks up the mismatch between an open card's
               * horizontal and vertical insets immediately, because both edges are on
               * screen at once.
               *
               * A single inset is also simply the right description of the thing: this
               * is a full-bleed surface holding its content in, and there is no reason
               * for it to hold harder in one axis than the other.
               *
               * ⚠️ Vertical was 60 and is now 48 (Jimmy, 13 Aug) — at 60 the card was
               * visibly more generous than its neighbours in the queue behind it.
               *
               * Interpolated rather than swapped because a padding CLASS change
               * re-flows the copy on the frame it lands, which is visible as the text
               * jumping while the box is still moving.
               *
               * ⚠️ Both numbers MIRROR TOKENS (`5xl` = 48, `section-y` max = 100) and
               * Tailwind cannot express that link — if either token moves, this
               * silently stops matching. Same trade as `BODY_SCALE` in `QuizPanel`.
               *
               * ⚠️ `padX` and `padY` are passed the SAME expression rather than being
               * collapsed into one prop. Keeping both means the day they need to differ
               * again is a one-line change, and `QuizPanel` does not have to grow a
               * third padding prop to get there.
               */
              padY={lerp(48, 100, expand)}
              padX={lerp(48, 100, expand)}
              /**
               * ⚠️ NO HEIGHT CAP, AND THAT IS DELIBERATE. A `maxH` was passed here for
               * about an hour and reverted (Jimmy, 13 Aug): open, the card HUGS ITS
               * CONTENT and runs off the bottom of the screen, which is the design. See
               * the long note in `QuizPanel` where the prop used to be.
               */
              /**
               * ⚠️ THE HEADING SCALES INSTEAD OF STEPPING (Jimmy, 13 Aug — "it just
               * jumps sizes on expand"). This is `service-title ÷ h2` at the current
               * viewport, unwinding to 1 as the card opens, so the type grows
               * continuously from the card token to the section token.
               *
               * ⚠️ IT MIRRORS TWO TYPE TOKENS IN JS and Tailwind cannot express the
               * link — `TITLE_PX` and `H2_PX` are the clamps from `tailwind.config.ts`
               * transcribed. **If either token's size changes, change them here too or
               * the card-state heading silently stops matching the six beside it.**
               * Same trade as `padY` above and `BODY_SCALE` in `QuizPanel`; it is the
               * price of animating between two tokens at all.
               */
              headScale={vw ? lerp(TITLE_PX(vw) / H2_PX(vw), 1, expand) : 1}
            />
          </div>
          </div>
        ) : null}
      </div>

      {/* ⚠️ THERE IS NO SPACER HERE, AND THAT IS THE POINT. One was added on
          13 Aug (`h-section-y-flush`) to hold the open card off the next section,
          and it doubled the gap to ~240: **Process already carries its own
          `section-y-flush` top padding**, as every flush section does. The card
          only ever needed the section to END where it ends — the next section's
          own rhythm does the rest.

          So `paddingBottom` above is exactly the card's overflow below the fold and
          nothing more. If the gap ever needs changing, it is Process's padding or
          the shared token that changes, not a local spacer — a second source of
          vertical rhythm in one place is how sections stop agreeing with each
          other. */}
    </section>
  );
}
