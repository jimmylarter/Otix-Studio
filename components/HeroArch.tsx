import { cn } from "@/lib/cn";
import { LiquidImage } from "@/components/LiquidImage";

/**
 * HeroArch — the run of images beneath the hero headline.
 * Figma: `Carrousel` (1440×630) inside `HERO`.
 *
 * NOT a carousel, despite the Figma layer name. It is a static composition: cards
 * in an inverted arch, biggest in the centre, tops dipping toward the middle so the
 * run hangs as a valley.
 *
 * Measured from the design (1440 frame):
 *
 *   card   width  height  top offset   x
 *   1      220    260     0            -66   ← bleeds off the left edge
 *   2      280    340     80            202
 *   3      380    480     150           530  ← centre, tallest, hangs lowest
 *   4      280    340     90            958
 *   5      220    260     0            1286  ← bleeds off the right edge
 *
 * gap 48 · radius 24 · `shadow-elevated` on every card
 *
 * Each card is framed by a 5px WHITE INSIDE STROKE with its content clipped — a
 * border, not padding, so the aspect ratio above is the border box and the image
 * fills the space within it. The images in Figma are taller than their frames and
 * offset upward; `object-cover` reproduces that crop.
 *
 * Each image is a `LiquidImage` — it ripples under the cursor and zooms inside its
 * frame on hover. That interaction is INVENTED, not from the design; see that
 * component and MOTION_SPEC.md (D6).
 *
 * Two things to notice. The run is 1572 wide against a 1440 frame, so the outer
 * cards are deliberately cropped by the viewport — the arch continues past the
 * screen. And cards 2 and 4 are NOT mirrored (80 vs 90): the asymmetry is in the
 * design and is preserved here rather than tidied up.
 *
 * ── Responsive ────────────────────────────────────────────────────────────────
 * Scaling all five cards down to a phone makes each one ~55px wide — the images
 * become unreadable and the arch reads as noise. So below `md` it drops to the
 * MIDDLE THREE, keeping the same arch shape at a legible size. The outer pair are
 * decorative repeats; losing them costs nothing.
 *
 * ⚠️ There is no mobile design for the hero yet — this is a reasoned default, not
 * a spec. Confirm in D5 / RESPONSIVE_SPEC.md.
 *
 * ── Why the geometry is inline and not tokenised ──────────────────────────────
 * These are COMPOSITION proportions belonging to one bespoke arrangement, not
 * reusable design tokens. Pushing one-off percentages into the global scale would
 * pollute it for no reuse. They are percentages of the run's own width, so the
 * whole thing scales fluidly with the viewport (CLAUDE.md §0) while holding the
 * designed relationships exactly.
 */

type ArchCard = { w: number; h: number; top: number };

/** The full arch, exactly as drawn. */
const CARDS: ArchCard[] = [
  { w: 220, h: 260, top: 0 },
  { w: 280, h: 340, top: 80 },
  { w: 380, h: 480, top: 150 },
  { w: 280, h: 340, top: 90 },
  { w: 220, h: 260, top: 0 },
];

/**
 * ⚠️ A SCROLL DISPERSAL WAS BUILT HERE AND REMOVED THE SAME DAY (13 Aug, Jimmy's
 * call). The cards travelled outward and upward along the arch's own curve as the
 * hero scrolled away — proportional to each card's distance from centre, so the
 * outer pair went furthest and the middle one held. It worked and it did not earn
 * its place; the arch reads better as a fixed composition.
 *
 * If it is ever wanted back, the whole of it was: a `disperse` 0→1 value from
 * `scrollY / (innerHeight * 0.7)` on a cancel-and-reschedule rAF, a per-card
 * `translate(d * 46%, -|d| * 22%)` on the wrapper (never on the framed card — that
 * is the element `LiquidImage` measures for its ripple), 10% of container width as
 * top padding with an equal negative margin so the rising cards were not sliced by
 * the `overflow-hidden`, and the listener never attached under
 * `prefers-reduced-motion`.
 */

/**
 * Must match `animation.step-float` in `tailwind.config.ts` — 7000ms.
 *
 * ⚠️ Used only to space the per-card delays evenly across one cycle. If the two
 * disagree the wave simply stops being evenly spaced, which is why this is a named
 * constant rather than a number inline. `Process` declares the same one for the same
 * reason; they are two readings of one animation, not two animations.
 */
const FLOAT_MS = 7000;

/**
 * How far a card can drift upward, in px. **Must be ≥ the `step-float` keyframes'
 * largest negative Y (−12).**
 *
 * ⚠️ It is the CLIPPER's top padding, not a margin: the run is `overflow-hidden` so it
 * can be cropped by the viewport horizontally, and that clip cuts vertically too. Cards
 * 1 and 5 sit at `top: 0`, so without headroom the float would slice their tops off on
 * the up-beat. The padding is cancelled by an equal negative margin, so nothing moves.
 */
const FLOAT_HEADROOM = 16;

const GAP = 48;
/** Design frame the measurements were taken in. */
const FRAME = 1440;

/** Total run width for a set of cards, including the gaps between them. */
const runWidth = (cards: ArchCard[]) =>
  cards.reduce((sum, c) => sum + c.w, 0) + GAP * (cards.length - 1);

function Run({
  cards,
  images,
  /** Index offset, so the two runs stagger from the same phase. */
  phaseFrom = 0,
  /** Run width as a % of the viewport. >100 means it crops off both edges. */
  spread,
  className,
}: {
  cards: ArchCard[];
  images: string[];
  phaseFrom?: number;
  spread: number;
  className?: string;
}) {
  const total = runWidth(cards);
  const pct = (n: number) => `${((n / total) * 100).toFixed(3)}%`;

  return (
    <div
      className={cn("flex items-start", className)}
      style={{
        width: `${spread}%`,
        // Centre the run so it crops evenly on both sides at any width.
        marginLeft: `${((100 - spread) / 2).toFixed(3)}%`,
        gap: pct(GAP),
      }}
    >
      {cards.map((c, i) => (
        <div key={i} style={{ width: pct(c.w), paddingTop: pct(c.top) }}>
          {/* ══ THE FLOAT ═══════════════════════════════════════════════════════
              ⚠️ THE SAME `step-float` THE PROCESS CIRCLES USE (13 Aug, Jimmy) — one
              animation, two placements, rather than a second drift invented here. A
              negative `animationDelay` starts each card partway through the cycle, so
              the row reads as a WAVE rather than five things bobbing in unison. Spread
              across the full cycle by index, exactly as `Process` does.

              ⚠️ IT IS A SEPARATE WRAPPER FROM THE POSITIONING DIV. That div carries
              the arch's `paddingTop` offset; putting an animated transform on it would
              be fine today, but the offsets are the composition and they should not
              share an element with something that moves.

              ⚠️ It must also stay OUTSIDE the framed card, which is the element
              `LiquidImage` measures for its ripple — a transform on that would move the
              box the pointer maths is resolved against. Same reason the scroll dispersal
              (removed, see above) put its translate on the wrapper.

              ⚠️ `translate3d` in the keyframes keeps this on the compositor; five
              cards drifting is five layers, and on the main thread it would compete
              with the hero video. */}
          <div
            className="animate-step-float"
            style={{ animationDelay: `${-(phaseFrom + i) * (FLOAT_MS / CARDS.length)}ms` }}
          >
            <div
              className="overflow-hidden rounded-2xl border-card border-neutral-0 shadow-elevated"
              style={{ aspectRatio: `${c.w} / ${c.h}` }}
            >
              <LiquidImage src={images[i]} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export interface HeroArchProps {
  /** Five images, in order left to right. Mobile uses the middle three. */
  images: string[];
  className?: string;
}

export function HeroArch({ images, className }: HeroArchProps) {
  return (
    <div className={cn("w-full", className)} aria-hidden="true">
      {/* ⚠️ TWO DIVS, AND THE SPLIT IS LOAD-BEARING. The outer one carries the caller's
          margins (`-mt-sm md:mt-3xl` from `Hero`); the inner one does the clipping and
          owns `FLOAT_HEADROOM`. They cannot be one element: `cn` here is a plain join
          rather than `tailwind-merge`, so a `-mt-4xl` of our own alongside the caller's
          `-mt-sm` would not override it — both would apply and **CSS source order would
          decide**, which is exactly the bug that made the Quiz's back arrow render at
          the wrong size for several passes.

          ⚠️ `pt` + equal `-mt` gives the float somewhere to go without moving anything:
          the clip box starts 16px higher, the content sits where it always did. */}
      <div
        className="relative w-full overflow-hidden"
        style={{ paddingTop: FLOAT_HEADROOM, marginTop: -FLOAT_HEADROOM }}
      >
      {/*
        Mobile: middle three.

        ⚠️ `spread={140}`, down from 190 (13 Aug). The run is a percentage of the
        VIEWPORT, so anything over 100 crops off both edges — at 190 the outer two
        cards were mostly off-screen and the centre one filled most of the width,
        which read as one big image with two slivers beside it rather than as an
        arch. 140 crops ~20% off each side instead of ~45%, so all three cards read
        as cards and you can actually see what is in them.

        It cannot go to 100: the arch is *meant* to continue past the screen, and a
        run that stops dead at both edges loses the whole idea.
      */}
      {/* ⚠️ `phaseFrom={1}` — the mobile run is the middle THREE cards, so starting its
          phase at index 1 keeps each card on the same beat it has on desktop. Without it
          the same picture would drift differently at the two sizes for no reason. */}
      <Run cards={CARDS.slice(1, 4)} images={images.slice(1, 4)} spread={140} phaseFrom={1} className="md:hidden" />

      {/* Desktop: the full five-card arch at its designed 1572/1440 spread. */}
      <Run
        cards={CARDS}
        images={images}
        spread={Number(((runWidth(CARDS) / FRAME) * 100).toFixed(3))}
        className="hidden md:flex"
        phaseFrom={0}
      />
      </div>
    </div>
  );
}
