"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { ServiceNumerals } from "@/components/ServiceNumerals";
import { ServicePanel } from "@/components/ServicePanel";
import { Carousel } from "@/components/Carousel";
import { Eyebrow } from "@/components/Eyebrow";
import { Logo } from "@/components/Logo";
import { Cta } from "@/components/Cta";
import { SectionHeader } from "@/components/SectionHeader";
import { QuizPanel } from "@/components/QuizPanel";
import type { QuizContent } from "@/components/Quiz";
import type { HeadingSegment } from "@/components/SectionHeader";
import type { IconName } from "@/components/Icon";

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
  icon: IconName;
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
  panelEyebrow: string;
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
 * Viewport-heights the section's own TITLE holds the panel before the reel begins.
 *
 * ⚠️ The title lives INSIDE the green panel now (13 Aug), centred, so it and the reel
 * cannot both be on screen at once — hence a beat of its own at the front of the pin.
 * Across it the title travels up and out while the reel rises into the centre from
 * below, both driven by this one value.
 *
 * ⚠️ It is the FIRST segment of a budget that is no longer uniform:
 *     intro · travel · hold · expand · settle
 * Everything downstream measures from the end of it, so changing this shifts the
 * whole reel — including the snap marker, which is derived rather than written down.
 */
const VH_INTRO = 70;

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
 * ⚠️ 45. It went 50 → 70 → 45, and it is now about the TWEEN rather than about
 * scrubbing: it is the distance the trigger sits inside, and the range the scroll
 * floor rises over.
 *
 * ⚠️ IT IS A TRADE, and both directions are real. LONGER means the floor climbs more
 * slowly, so the 1100ms tween stays ahead of it under ordinary scrolling and the floor
 * only shows itself on a hard flick. SHORTER means less dead ground to scroll back
 * through before the card starts shrinking on the way up — the distance from where the
 * expansion completes down to `CLOSE_AT` is exactly that wait. 70 made the return trip
 * ~63vh; 45 makes it ~34.
 */
const VH_EXPAND = 45;

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
 * `ServiceNumerals`: it is a proportion inside one bespoke composition, not a size
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
 * same reasoning as `SPINE_THUMB` and `PITCH` in `ServiceNumerals`: these are
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
 * ── The expansion is a LATCH, not a scrub (13 Aug) ───────────────────────────
 * `expand` is 0 or 1 and CSS carries the in-between. It used to be a 0–1 scroll
 * value scrubbed over `VH_EXPAND`, which meant the card could come to rest at any
 * point — half-open was a valid state, and it looked like a fault rather than a
 * position.
 *
 * That was the wrong CONTROL TYPE, not a tuning problem. Scrubbing is right for the
 * reel, which is a continuous position through a list; the expansion is a binary,
 * and a scrub can always be parked between its ends.
 *
 * ⚠️ TWO THRESHOLDS, NOT ONE. It opens at `OPEN_AT` and closes at the lower
 * `CLOSE_AT`. With a single threshold, a trackpad resting exactly on the boundary
 * flips it open and shut on every stray pixel. The gap between them is most of what
 * makes a latch feel solid.
 *
 * ⚠️ **`CLOSE_AT` MUST STAY BELOW `OPEN_AT`.** Raising it above is the obvious way to
 * make the card shrink sooner on the way back up, and it breaks the latch outright:
 * scrolling down, the card opens at `OPEN_AT`, and the very next frame the open-state
 * test `t >= CLOSE_AT` fails — so it closes, reopens, and ping-pongs. The gap was
 * widened 0.18 → 0.24 instead, which is as far as it goes.
 *
 * ⚠️ The real lever on "it takes too long to shrink" is `VH_EXPAND`, not these. The
 * delay is geometric: you come to rest where the expansion completes and have to
 * scroll back to `CLOSE_AT` before anything happens, so the distance between those
 * two points IS the wait. Shrinking the segment shortens it.
 *
 * ⚠️ The duration and the dwell are COUPLED. `VH_EXPAND` no longer scrubs anything —
 * it is the room the animation has to play in before the pin releases. Lengthen the
 * transition and this has to grow, or a hard scroll finishes the section while the
 * card is still opening.
 */
const OPEN_AT = 0.3;
const CLOSE_AT = 0.24;

/** How long the expansion takes once it trips, in ms. Was 900. */
const EXPAND_MS = 1100;

/**
 * ⚠️ THE TWEEN HAS A SCROLL FLOOR, and without it the whole approach has a hole in
 * it: the animation runs on a CLOCK and the page runs on the WHEEL, and nothing makes
 * the wheel wait. Flick hard past the trigger and the pin's remaining budget is spent
 * in a few hundred milliseconds, so the section releases while the card is still
 * halfway open — you shoot past the expanded state without ever seeing it.
 *
 * The floor is the scrub the tween replaced, kept as a MINIMUM rather than as the
 * driver. Scroll normally and the tween is always ahead of it, so it is invisible and
 * the motion is the tween's. Scroll hard and the floor overtakes, dragging the card
 * open at the speed you are actually travelling.
 *
 * ⚠️ IT APPLIES WHEN OPENING ONLY. A matching ceiling on the way up was built and
 * removed the same day: it forced the card to track the scroll position while
 * closing, so scrolling up snapped it straight back to a small card instead of
 * tweening shut.
 *
 * The asymmetry is right, because the problem it solves is asymmetric. Going DOWN, a
 * tween that falls behind means you leave the section having never seen the expanded
 * state — the thing the whole sequence exists for. Going UP, a tween that falls
 * behind just means the card closes a moment later than the scroll, on a section you
 * are leaving anyway. Nobody is denied anything.
 */
const SCROLL_FLOOR = true;

/**
 * How far the floor must run ahead of the rendered value before it takes over, so a
 * single stray pixel of scroll does not restart the tween.
 */
const FLOOR_TAKEOVER = 0.01;

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
 * ⚠️ UNUSED SINCE THE TWEEN. It eased the SCRUBBED expansion, correcting for area
 * growing with the square of width — linear in scroll therefore looked like
 * acceleration. `easeInOutQuint` does the shaping now, on a clock rather than on
 * scroll position. Kept because the area-vs-width reasoning is the non-obvious part
 * and would be rediscovered the hard way if the scrub ever returned.
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

export function Services({ header, panelEyebrow, panels, finale, className }: ServicesProps) {
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
   * 0 → 1 across panel 07's expansion.
   *
   * ⚠️ IT IS TWEENED OVER TIME, NOT SCRUBBED BY SCROLL (13 Aug). It used to be
   * `(scrolled - expandStart) / VH_EXPAND`, so the card's openness was a direct
   * function of scroll position — which meant it could come to rest at any point, and
   * half-open is not a state this card has. It read as a fault rather than a position.
   *
   * ⚠️ THE EXPANSION ITSELF IS UNCHANGED. Every consumer still receives the same
   * continuous 0 → 1 sweep and stages on the same fractions; only the clock driving it
   * moved from the scroll wheel to `EXPAND_MS`.
   *
   * ⚠️ A CSS-transition version was built and reverted the same day — `expand` binary,
   * browser interpolates each property. Tidier on paper, wrong in practice: the things
   * staged on this value include a TYPE TOKEN SWAP and an inline padding number, and a
   * CSS transition cannot interpolate either. They snapped while the box glided.
   */
  /** 0 → 1 across the title's exit and the reel's arrival — see `VH_INTRO`. */
  const [intro, setIntro] = useState(0);
  const [expand, setExpand] = useState(0);
  /** The tween's live value and frame handle — refs, so `measure` never reads a stale one. */
  const expandRef = useRef(0);
  const tweenRef = useRef(0);
  const targetRef = useRef(0);
  /** The scroll-derived minimum openness — see `SCROLL_FLOOR`. */
  const floorRef = useRef(0);
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
  /**
   * ⚠️ ICONS, NOT NUMERALS (13 Aug). The reel showed `01`…`07`; it now shows the
   * service glyphs at the same size, and the cards no longer carry one.
   *
   * ⚠️ Panel 07 has no service icon of its own, so it borrows `discovery` — the
   * magnifier the Process section uses for its first step. It is the closest thing in
   * the set to "find your fit", and inventing an icon for one slot would put a glyph
   * in the system that nothing else can use. If the quiz ever gets its own, it should
   * come from `content` like the other six rather than being hard-coded here.
   */
  const reelIcons: IconName[] = [
    ...panels.map((p) => p.icon),
    ...(hasFinale ? (["discovery"] as IconName[]) : []),
  ];

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 768px)");
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
      const expandFromVh = VH_INTRO + travelVh + VH_HOLD;
      const totalVh =
        VH_INTRO + travelVh + (hasFinale ? VH_HOLD + VH_EXPAND + VH_SETTLE : 0);
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

      /**
       * ⚠️ THE INTRO IS THE FIRST SEGMENT AND EVERYTHING DOWNSTREAM MEASURES FROM THE
       * END OF IT. `progress` is `(vh - VH_INTRO) / VH_PER_PANEL`, never
       * `vh / VH_PER_PANEL` — with the latter the reel is already most of a panel in
       * before the title has finished leaving.
       *
       * ⚠️ `setIntro` is not optional decoration. The reel's opacity is `* intro` and
       * the title's transform is `-intro * introShift`, so a missing update here does
       * not mean "no animation" — it means the title is frozen at the top and the
       * numerals, wheel and cards are all at opacity 0. That is exactly what shipped
       * for one round when this line was dropped.
       */
      setIntro(Math.min(Math.max(vh / VH_INTRO, 0), 1));
      setProgress(Math.min(Math.max((vh - VH_INTRO) / VH_PER_PANEL, 0), slots - 1));
      /* See the latch note above `OPEN_AT`. The two thresholds are read against the
         CURRENT target so they apply in the right direction — opening and closing are
         deliberately not symmetrical. */
      if (hasFinale) {
        const t = (vh - expandFromVh) / VH_EXPAND;
        const open = expandRef.current > 0.5 ? t >= CLOSE_AT : t > OPEN_AT;

        /* How open the SCROLL POSITION says it should be, measured from the trigger.
           See `SCROLL_FLOOR` — normally the tween is ahead of this and it does
           nothing; on a hard scroll it takes over. */
        floorRef.current = Math.min(Math.max((t - OPEN_AT) / (1 - OPEN_AT), 0), 1);

        tweenTo(open ? 1 : 0);

        /**
         * ⚠️ THE FLOOR HANDS OVER TO THE TWEEN, it does not clamp it frame by frame.
         *
         * Clamping was the first version and it was the jitter: the floor rises in
         * SCROLL STEPS, so whenever it ran ahead of the curve the rendered value
         * tracked those steps directly — the card moved in discrete jerks the size of
         * whatever the wheel or trackpad last delivered.
         *
         * Restarting the tween from the floor keeps every frame curve-driven. The
         * floor still guarantees the card is never less open than the scroll implies;
         * it just stops being what draws it.
         */
        if (open && floorRef.current > expandRef.current + FLOOR_TAKEOVER) {
          expandRef.current = floorRef.current;
          setExpand(floorRef.current);
          targetRef.current = 0; // force `tweenTo` past its already-in-flight guard
          tweenTo(1);
        }
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

    /**
     * Run `expand` to a target over `EXPAND_MS`.
     *
     * ⚠️ It starts from WHEREVER THE VALUE CURRENTLY IS, not from 0 or 1. Reverse
     * mid-flight — scroll up while it is still opening — and it turns around from the
     * point it had reached rather than snapping to an end first.
     *
     * ⚠️ Cancel-and-reschedule, and it early-returns when the target is already the
     * one in flight. Without that guard every scroll event during the tween would
     * restart it from the current value, which stretches a 900ms move indefinitely for
     * as long as anyone keeps scrolling.
     */
    function tweenTo(target: number) {
      if (targetRef.current === target) return;
      targetRef.current = target;
      cancelAnimationFrame(tweenRef.current);
      const from = expandRef.current;
      const startedAt = performance.now();
      const step = (now: number) => {
        const t = Math.min((now - startedAt) / EXPAND_MS, 1);
        /* No floor clamp here — see the hand-over in `measure`. Clamping inside the
           tween made the floor's scroll steps the rendered value. */
        const v = from + (target - from) * easeOutQuint(t);
        expandRef.current = v;
        setExpand(v);
        if (t < 1) tweenRef.current = requestAnimationFrame(step);
      };
      tweenRef.current = requestAnimationFrame(step);
    }

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(tweenRef.current);
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
   * at all — with seven panels that is five fewer frosted surfaces for the
   * compositor on every frame.
   *
   * ⚠️ `panelW`/`panelBoxH` are the PANEL's box, not the viewport's. The panel is
   * inset by the gutter, and using viewport numbers here put every card ~10px out
   * and the drift grew with the radius.
   */
  const orbitBox = (d: number) => {
    if (Math.abs(d) > ORBIT_RENDER_LIMIT) return null;
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
  /**
   * The intro's travel distance in PX — see `INTRO_TRAVEL` for why it cannot be a
   * percentage. Measured off the panel, which is the viewport inset by the gutter.
   */
  const introShift = INTRO_TRAVEL * Math.max(vh - gutterPx * 2, 0);

  const finaleBox = hasFinale ? orbitBox(slots - 1 - progress) : null;

  /** ⚠️ No `+ gutterPx`: the open card is edge-to-edge, so it releases at 0 too. */
  const releasedTop =
    (VH_INTRO + (slots - 1) * VH_PER_PANEL + VH_HOLD + VH_EXPAND + VH_SETTLE) *
    (vh / 100);

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

     ⚠️ The EYEBROW IS FIXED above the strip and only the title, icon and copy move.
     Six identical "SERVICES" pills sliding past would be the same word animating in
     and out for no reason — see `showEyebrow` on `ServicePanel`.
  */
  if (!pinned) {
    /* Nearest whole card. `onProgress` reports 0–1 across the whole strip, and with
       n cards the gaps between snap points are `n - 1`, not `n`. */
    const active = n > 1 ? Math.round(swipe * (n - 1)) : 0;

    return (
      <section
        id="services"
        className={cn(
          // ⚠️ `px-gutter`, NOT `px-section-x-flush`, and the difference is the
          // whole point. Flush padding lands content 20px from the edge on a phone;
          // every containered section lands at `gutter + section-x` = 25. Services
          // was the only thing on the page 5px out of line. Pairing `px-gutter`
          // here with `px-section-x` on the children below reproduces the
          // containered arithmetic exactly (CLAUDE.md §0.1).
          // ⚠️ `mt-block` (80) — must match the pinned branch's gap to Work. The two
          // are the same measurement written twice; change one and change the other.
          "relative mt-block w-full p-gutter",
          className,
        )}
      >
        {/* ⚠️ THE GRADIENT PANEL EXISTS HERE TOO (13 Aug). The phone build was still
            on the warm page after the section went dark, which left the header
            unreadable at `tone="dark"` and — worse and already shipped — the glass
            cards sitting on a light ground they were never designed for. Their fill is
            white at 7%, which needs something dark behind it to read as a surface at
            all.

            ⚠️ `py-section-y-flush` inside the panel, where the section used to carry
            it outside. The panel is the surface now, so its own padding is what holds
            the content off its edges. */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-services px-section-x py-section-y-flush">
        {glow}
        <div className="relative flex flex-col gap-2xl">
          {/* ⚠️ THE HEADER RENDERS HERE TOO (13 Aug). It was added to the pinned branch
              only, so phones and reduced-motion got the carousel with no intro at all —
              a section that opened mid-thought. There is no pin to hang an intro beat
              on here, so it is simply a block above the strip. */}
          {header ? (
            <div>
              <SectionHeader
                eyebrow={header.eyebrow}
                heading={header.heading}
                body={header.body}
                align="center"
                tone="dark"
                action={<Cta label={header.cta.label} href={header.cta.href} tone="mint" />}
              />
            </div>
          ) : null}

          <Eyebrow label={panelEyebrow} />

          {/* ⚠️ The wrapper is FULL WIDTH inside the gutter and the Carousel
              carries the padding itself. That is what lets the first card start on
              the optical line while the rest run off the right edge — the cue that
              says there is more. `scroll-pl` matters as much as `pl`: without it a
              snapped card aligns to the scroller's edge rather than the optical
              line, so the strip starts correctly and then jumps on the first snap. */}
          <div className="relative">
            {/* ⚠️ `basis-3/4` + `gap-4xl` (40) are ONE decision, and both moved
                together on 13 Aug (from 4/5 and the default 24). At 80% with a 24px
                gap the next card's sliver was close enough to the current one to
                read as a second column of the SAME panel rather than as the next
                one. Pulling the card in and pushing the gap out separates them:
                what shows past the edge is now unmistakably a different card. */}
            <Carousel
              itemClassName="basis-3/4"
              gapClassName="gap-4xl"
              onProgress={setSwipe}
              className="scroll-pl-section-x px-section-x"
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
              {panels.map((p) => (
                <ServicePanel
                  key={p.title}
                  eyebrow={panelEyebrow}
                  showEyebrow={false}
                  title={p.title}
                  body={p.body}
                  icon={p.icon}
                  surface
                />
              ))}
            </Carousel>

            {/* ⚠️ `basis-4/5` above and this fade are ONE decision. A full-width
                card leaves nothing showing, so the strip looks like a static block
                — the next card has to be visibly present AND visibly incomplete.
                75% shows roughly a quarter of the next one; the fade then keeps
                that sliver from reading as a second column of live content.

                `pointer-events-none` is not optional — this sits over the strip,
                and without it the right fifth of the carousel cannot be swiped. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-fade-right"
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
            className="flex items-center justify-center gap-sm px-section-x pt-md"
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

          {/* ── PANEL 07, unpinned ──────────────────────────────────────────
              ⚠️ ALREADY OPEN (`expand={1}`), and NOT a seventh carousel card
              (Jimmy, 13 Aug). Two reasons, both fatal to the alternative:

                · there is no pin here, so there is nothing for an expansion to
                  hang on. A card that could never open would be a dead end.
                · the quiz is tapped, and the carousel is swiped. Putting an
                  interactive card inside a horizontally-scrolling strip makes
                  every answer a gamble on which gesture the browser decides it
                  saw — and the card is only 75% of a phone wide.

              So it sits BELOW the strip as an ordinary full-width block, which is
              roughly what the deleted `WhyOtix` section did, restyled onto the
              image. `h-quiz` rather than a viewport height: it is a block in the
              flow now, not a screen.

              ⚠️ This branch also serves `prefers-reduced-motion` at every width —
              `pinned` is false for both — which is why the expansion needs no
              reduced-motion handling of its own. */}
          {finale ? (
            <div className="h-quiz">
              <QuizPanel
                eyebrow={finale.eyebrow}
                heading={finale.heading}
                body={finale.body}
                image={finale.image}
                quiz={finale.quiz}
                expand={1}
              />
            </div>
          ) : null}
        </div>
        </div>
      </section>
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
            VH_INTRO +
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
          style={{ top: `${VH_INTRO + (slots - 1) * VH_PER_PANEL + VH_HOLD + VH_EXPAND}vh` }}
        />

        <div
          className="sticky top-0 h-screen w-full p-gutter"
        >
          <div
            ref={stickyRef}
            className="relative flex size-full items-center overflow-hidden rounded-3xl px-section-x"
          >
          {/* ══ THE TITLE ═══════════════════════════════════════════════════════
              ⚠️ INSIDE the panel and CENTRED, on the gradient — so `align="center"`
              and `tone="dark"`, both of which `SectionHeader` already has. Process and
              Testimonials use the same centred form.

              ⚠️ It and the reel cannot share the screen, which is what `VH_INTRO`
              buys: across that beat this travels UP and out while the reel rises into
              the middle from below. Both run off `intro`, so they cannot drift apart.

              ⚠️ `absolute inset-0`, not a flow child. In flow it would take height
              from the panel and shove the reel down permanently; out of flow the two
              occupy the same centred box and simply pass through it.

              ⚠️ `pointer-events-none` once it has gone, or an invisible CTA keeps
              swallowing clicks meant for the cards behind it. */}
          {header ? (
            <div
              /* ⚠️ TOP-ANCHORED with `pt-section-y` (100), not vertically centred.
                 Centred was the first build and it put the title in the middle of an
                 otherwise empty screen with the CTA floating; at the top it reads as a
                 section opening. */
              className="absolute inset-x-0 top-0 px-section-x pt-section-y will-change-transform"
              style={{
                transform: `translateY(${-intro * introShift}px)`,
                opacity: 1 - intro,
                pointerEvents: intro > 0.5 ? "none" : undefined,
              }}
              aria-hidden={intro > 0.5}
            >
              <SectionHeader
                eyebrow={header.eyebrow}
                heading={header.heading}
                body={header.body}
                align="center"
                tone="dark"
                /* ⚠️ `measure-wide` (75ch) rather than the default `measure` (68ch).
                   Centred copy reads narrower than the same measure left-aligned —
                   both edges are ragged, so the eye has less to hold on to — and this
                   sits alone on a full screen with nothing beside it. The wider token
                   already existed and had no consumer until now. */
                bodyClassName="max-w-measure-wide"
                /* ⚠️ `mint`, not the `ink` the light-page version used. Ink is
                   near-black and this ground is dark green — the pill would lose its
                   edge against it. Mint is the tone built for dark surfaces (the nav,
                   the contact form). */
                action={<Cta label={header.cta.label} href={header.cta.href} tone="mint" />}
              />
            </div>
          ) : null}
          {/* ⚠️ THE GRADIENT IS ITS OWN LAYER, not a `bg-` on the panel. As a
              background on the positioning context it painted at the very bottom of
              this stacking context, so the wheel at `-z-10` — which has to sit behind
              the cards — ended up behind the gradient and vanished entirely. A layer
              at `-z-20` gives the wheel somewhere to be. */}
          <span aria-hidden="true" className="absolute inset-0 -z-20 bg-gradient-services" />
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
            style={{ opacity: (1 - expand) * intro }}
          >
            {/* The track: a hairline, centred in the 3px box. */}
            {/* ⚠️ `border-on-dark`, not `border-divider`. The divider grey is a
                light-ground hairline and is nearly invisible on the gradient. */}
            <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border-on-dark" />

            {/* The thumb. `accent-numeral` (#9CB0A8) — NOT a new colour and not
                the brand green. It is the exact tone the numerals and the service
                icons already use, so the marker reads as part of the same quiet
                sage layer rather than as a control sitting on top of the section.
                It went green-600 → green-400 → green-600 → here; the two greens
                both pulled focus off the copy. */}
            <span
              className="absolute inset-x-0 rounded-full bg-green-300"
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
              /* ⚠️ 0.14 on the dark ground, up from 0.1 on the warm page. The same
                 opacity does not carry across a ground swap: light-on-dark loses far
                 more of itself than dark-on-light at the same alpha. Measured by eye
                 against the gradient, not carried over. */
              opacity: (1 - expand) * 0.14,
              transform: `translate(33.333%, -50%) rotate(${progress * MARK_DEG_PER_PANEL}deg)`,
            }}
          >
            {/* ⚠️ `sheen` gets the SAME angle this span is rotated by, so `Logo` can cancel
                it and hold the highlight still while the form turns through it. Pass a
                different number and the light drifts, which is worse than no light. */}
            <Logo variant="mark" sheen={progress * MARK_DEG_PER_PANEL} />
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
          {/* ⚠️ RISES WITH THE SCROLL as the title leaves — the same `intro` value,
              inverted. It starts a little over half a panel down and arrives centred.
              One value driving both is what keeps the handover from ever showing a gap
              or an overlap. */}
          <div
            className="relative flex w-full items-center gap-col pl-services-inset-left pr-services-inset will-change-transform"
            /* The numerals and the copy track are BEHIND the expanding card, so they
               do not strictly need hiding — but the card is 10px short of the screen
               on each side, and a numeral showing through that sliver reads as a
               bug. Faded on the same value that grows the card. */
            style={{
              opacity: (1 - expand) * intro,
              transform: `translateY(${(1 - intro) * introShift}px)`,
            }}
          >
            {/* `w-1/3`, narrower than the design's 570/1380 — it pulls the copy
                column left so the pair sits closer to the page's centre. */}
            <ServiceNumerals
              icons={reelIcons}
              progress={progress}
              /* Seven slots of travel, six numerals — see the note on `numerals`. */
              travel={slots - 1}
              className="w-1/3 shrink-0"
            />
          </div>

          {/* ══ THE ORBIT ═══════════════════════════════════════════════════
                ⚠️ REPLACED THE VERTICAL TRACK (13 Aug). The cards used to live in one
                translating column behind `PANEL_MASK`; they now sit on an ARC around
                the wheel, so the reel reads as something TURNING rather than
                something sliding.

                Each card is placed in polar coordinates around a centre that sits off
                the panel's right edge — the wheel's centre:

                    theta = (i − progress) × ORBIT_STEP_DEG
                    x     = cx − R·cos(theta)
                    y     = cy + R·sin(theta)

                At theta 0 the card is at the circle's LEFTMOST point: centred,
                upright, fully legible. At ±1 step it swings right and up or down and
                is cropped by the panel edge — which IS the glimpse of what is coming
                and what has gone. Panel 01 having nothing above it needs no special
                case; there is simply no index −1 to place.

                ⚠️ THE CARDS DO NOT ROTATE, only travel. Tilting them with the arc is
                the obvious reading of "rotating round the wheel" and it is wrong here:
                these carry body copy, and type set at an angle stops being READABLE
                long before it stops being legible.

                ⚠️ Adjacent cards SCALE AND FADE rather than blur (Jimmy, 13 Aug).
                The cards are themselves frosted, so blurring a frosted card makes the
                two effects stop meaning different things — and the numerals beside
                them already say "further away" with a scale and a dim, so the section
                speaks one language. A blur is also a real per-frame GPU cost on two
                large elements where a transform is free.

                ⚠️ Everything runs off `progress`, the same value the numerals, the
                spine and the wheel use. Nothing here can desync, and it all reverses
                for free on the way back up. */}
            {/* ⚠️ A SIBLING OF THE ROW, not a child of it. The row is a flex line
                whose height is the numerals', so `inset-0` inside it would have
                resolved to that band rather than to the panel — the arc's vertical
                centre would sit wherever the numerals happen to end. Positioned
                against the panel it is the composition's real centre.

                `pointer-events-none` on the frame with `-auto` restored per card, so
                the empty space around the arc does not swallow clicks. */}
            <div
              ref={cardSlotRef}
              className="pointer-events-none absolute inset-0 will-change-transform"
              /* Rises with the numerals — see the row above. Same `intro`, same
                 distance, so the column and the cards arrive together. */
              style={{
                opacity: intro,
                transform: `translateY(${(1 - intro) * introShift}px)`,
              }}
            >
              {panels.map((p, i) => {
                const box = orbitBox(i - progress);
                if (!box) return null;
                return (
                  <div
                    key={p.title}
                    className="pointer-events-auto absolute will-change-transform"
                    style={{
                      left: box.x,
                      top: box.y,
                      width: `${ORBIT_CARD_W * 100}%`,
                      transform: `translate(-50%, -50%) scale(${box.scale})`,
                      /* ⚠️ NO `opacity` — see `ORBIT_NEIGHBOUR_SCALE_ONLY`. It kills
                         the cards' `backdrop-filter` outright. */
                      zIndex: box.z,
                    }}
                  >
                    <ServicePanel
                      eyebrow={panelEyebrow}
                      title={p.title}
                      body={p.body}
                      icon={p.icon}
                      offset={i - progress}
                      surface
                      /* ⚠️ Neither the pill nor the glyph is on the card any more
                         (13 Aug). The glyph moved into the reel — see `reelIcons` —
                         and the eyebrow went because six identical "SERVICES" pills
                         orbiting past is the same word arriving and leaving seven
                         times for no information. The section is unmistakably
                         Services by the time you are inside it. */
                      showEyebrow={false}
                      showIcon={false}
                      className="w-full"
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
        {finale && finaleBox ? (
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
              expand < 1 && !released && "overflow-hidden rounded-3xl",
            )}
            style={
              released
                ? { top: releasedTop, left: 0, right: 0 }
                : {
                    top: lerp(gutterPx, 0, expand),
                    left: lerp(gutterPx, 0, expand),
                    right: lerp(gutterPx, 0, expand),
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
              top: released ? 0 : lerp(finaleBox.y, 0, expand),
              left: lerp(finaleBox.x, 0, expand),
              width: lerp(ORBIT_CARD_W * Math.max(vw - gutterPx * 2, 0), vw, expand),
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
               * ⚠️ 60 → 100 as it opens: the card's `6xl` padding out to `section-y`,
               * the site's own vertical section rhythm. Interpolated rather than
               * swapped because a padding class change re-flows the copy on the frame
               * it lands, which is visible as the text jumping while the box is still
               * moving.
               *
               * ⚠️ The two numbers MIRROR TOKENS (`6xl` = 60, `section-y` max = 100)
               * and Tailwind cannot express that link — if either token moves this
               * silently stops matching. Same trade as `BODY_SCALE` in `QuizPanel`.
               */
              padY={lerp(60, 100, expand)}
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
