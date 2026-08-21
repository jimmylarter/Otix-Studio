import Image from "next/image";
import { cn } from "@/lib/cn";
import { Tag } from "@/components/Tag";

/**
 * ServiceCard — one service on the Services orbit. Figma: `SERVICES UPDATE CLAUDE`
 * (264:762).
 *
 * ⚠️ **INTRODUCED 13 Aug**, and it is a NEW COMPONENT rather than a `ServicePanel`
 * variant — flagged per CLAUDE.md §3. The two share almost nothing: `ServicePanel` is
 * a copy block with an optional glass surface on a dark ground; this is a horizontal
 * card with a media column, tag pills and a light fill on the page cream. Bolting
 * this on as a third mode would have made six panels carry machinery none of them
 * use.
 *
 * ⚠️ **IT IS NOW BOTH BUILDS (13 Aug).** `ServicePanel` was the phone's Services card
 * and is superseded: the mobile section was redesigned to match desktop, so the two
 * were rendering the same content in the same visual language and CLAUDE.md §3 says
 * consolidate. `components/ServicePanel.tsx` is unreferenced and can be deleted.
 *
 * ── Layout ────────────────────────────────────────────────────────────────────
 * Two arrangements of one card, chosen by `layout`:
 *
 *   `row`      square image LEFT, copy right — the desktop orbit
 *   `stacked`  image ON TOP, copy underneath — the mobile carousel
 *
 * ⚠️ A PROP, NOT A BREAKPOINT CLASS, and that is deliberate. The two branches of
 * `Services` are separate renders — one is pinned and orbiting, the other is a swipe
 * strip — so the card is never asked to change shape mid-life. Responsive classes
 * would imply a fluidity that does not exist and would put both layouts in the DOM at
 * every width.
 *
 * The image is INSET from the card's edge rather than bleeding to it in both, which is
 * what makes the white read as a card holding a picture rather than as a picture with
 * a caption stuck on.
 *
 * ── What this component does NOT own ──────────────────────────────────────────
 * Its position. The reel places it on the arc and passes `distance`; everything here
 * is presentation. That is the same split `ServicePanel` had, and it is what lets one
 * scroll value drive the whole section.
 */

export interface ServiceCardProps {
  /**
   * The hook above the title — a question in the reader's words, e.g. "Still running
   * it on spreadsheets?" over "Apps & Dashboards".
   *
   * ⚠️ SINGULAR, and it replaced `tags: string[]` (13 Aug). The type is the guard: a
   * category pill tells you what the card is filed under, which the title underneath
   * already says; a question tells you whether the card is about YOU, which the title
   * cannot. Two of them stacked would be two competing hooks.
   */
  question: string;
  title: string;
  /** One string per paragraph. */
  body: string[];
  /** Decorative — the title carries the meaning, so this is safe to remove. */
  image: string;
  /**
   * Distance from the active slot, 0–1. `0` is the card being read; `1` is fully
   * entering or leaving.
   *
   * ⚠️ It drives BLUR AND SCALE TOGETHER — but no longer on the same ramp. Blur alone
   * reads as a rendering fault rather than as distance (nothing in the real world goes
   * out of focus without also getting smaller), and scale alone was what the green build
   * used, which was right there because those cards were frosted and a blur on a frosted
   * card makes the two effects stop meaning different things. These are opaque on cream,
   * so blur is available again.
   *
   * ⚠️ Scale runs linearly from 0; blur holds sharp until `BLUR_HOLD` — see that
   * constant for why the two are deliberately out of step.
   */
  distance?: number;
  /**
   * `row` (default) is the desktop orbit — square image left, copy right.
   * `stacked` is the mobile carousel — image on top, copy underneath.
   *
   * ⚠️ THE IMAGE'S ASPECT CHANGES WITH IT, not just its position. Square works beside
   * copy because it matches the copy block's height; square ON TOP of copy in a
   * three-quarter-width phone card takes most of the screen before a word is read. The
   * stacked variant uses 4:3.
   */
  layout?: "row" | "stacked";
  className?: string;
}

/** How far an off-centre card shrinks and how much it blurs, at `distance` 1. */
const AWAY_SCALE = 0.86;
const AWAY_BLUR_PX = 6;

/**
 * A DEAD ZONE around the active slot in which the card stays perfectly sharp.
 *
 * ⚠️ **THE BLUR AND THE SCALE NO LONGER SHARE A RAMP** (Jimmy, 13 Aug: "can the centre
 * card not have blur so soon, and after it enters and leaves"). Both used to run
 * linearly from `distance` 0, so the card started softening the instant it left dead
 * centre — the sharp state existed for a single value rather than for a stretch of
 * scroll, and the card you are meant to be READING was only truly legible for an
 * instant.
 *
 * Blur now holds at zero until `distance` passes 0.3, then ramps over the remaining
 * 0.7. In scroll terms the active card arrives, sits sharp across 30% of a step either
 * side — 60% of the gap between two cards — and only then begins to soften.
 *
 * ⚠️ **SCALE KEEPS THE FULL LINEAR RAMP, and the split is the point.** Scale is what
 * carries the sense of depth continuously as the wheel turns; blur is what says "this
 * one is not for you yet". Giving them the same dead zone would flatten the arc into a
 * row of identical cards near the middle. Depth is continuous; focus is not.
 *
 * ⚠️ It cannot go much past ~0.4. `ORBIT_STEP_DEG` is 40°, so beyond that the blur has
 * too little range left and arrives as a jump rather than a fade.
 */
const BLUR_HOLD = 0.3;

export function ServiceCard({
  question,
  title,
  body,
  image,
  distance = 0,
  layout = "row",
  className,
}: ServiceCardProps) {
  const d = Math.min(Math.max(distance, 0), 1);
  /**
   * `d` re-mapped so it is 0 across the dead zone and 0 → 1 over what is left.
   * ⚠️ Normalised by `1 - BLUR_HOLD`, not left as a bare subtraction — without that the
   * blur would top out at `1 - BLUR_HOLD` of `AWAY_BLUR_PX` and the far cards would
   * quietly be 30% less blurred than the constant says.
   */
  const blurT = Math.max(d - BLUR_HOLD, 0) / (1 - BLUR_HOLD);
  const stacked = layout === "stacked";

  return (
    <article
      className={cn(
        // `neutral-0`, not `neutral-50` or the page's `neutral-100`. The card sits on
        // the warm page and has to lift off it; pure white is the only thing in the
        // scale that reads as ABOVE a warm ground rather than as a lighter patch of it.
        "flex w-full overflow-hidden rounded-3xl bg-neutral-0 p-xl shadow-elevated",
        // ⚠️ `items-stretch` on the row so the copy column can centre itself against
        // the image's height; `items-start` would leave short copy hanging at the top.
        /**
         * ⚠️ In `stacked` this gap is IMAGE → PILL and nothing else, since the copy
         * column is the only other child. `gap-2xl` (28) rather than the `gap-lg` (20)
         * that governs the copy's own rhythm, so the picture is separated from the text
         * block by more than the text block separates internally — otherwise the pill
         * reads as a caption attached to the image rather than as the head of the copy.
         *
         * ⚠️ It deliberately does NOT match `Card`'s `gap-lg`. That card's image is
         * full-bleed with a padded panel beneath it, so its 20 is measured from a
         * different pair of edges; copying the number across would have matched the
         * token and not the spacing.
         *
         * In `row` the same gap is horizontal — image ↔ copy — and 28 there is a
         * separate decision that happens to land on the same value.
         */
        stacked ? "flex-col gap-2xl" : "items-stretch gap-2xl",
        // ⚠️ `origin-center`: the reel positions the card by its centre, so scaling
        // from anywhere else would move it as well as resize it.
        "origin-center will-change-transform",
        className,
      )}
      style={{
        transform: `scale(${1 - (1 - AWAY_SCALE) * d})`,
        /* ⚠️ `blurT` is `d` re-mapped past the dead zone, NOT `d` itself — see
           `BLUR_HOLD`. `undefined` rather than `blur(0px)` while it is sharp: an
           element with a filter is promoted to its own layer and re-rasterised, so
           dropping the property entirely is what lets the ACTIVE card render normally
           for the whole time it is being read. */
        filter: blurT > 0 ? `blur(${blurT * AWAY_BLUR_PX}px)` : undefined,
      }}
    >
      {/*
        ⚠️ SQUARE, and sized as a PROPORTION of the card rather than in px — the reel
        scales the card at every viewport and a fixed media width would stop tracking
        it (CLAUDE.md §0).

        `aspect-square` with `object-cover` reproduces the design's crop. `sizes` is
        declared because without it Next serves the largest candidate to every
        viewport for a picture that is never more than a third of the card.
      */}
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-2xl",
          // ⚠️ Proportions, never px — the reel scales the card at every viewport and a
          // fixed media size would stop tracking it (CLAUDE.md §0).
          stacked ? "aspect-media w-full" : "aspect-square w-2/5",
        )}
      >
        <Image
          src={image}
          alt=""
          aria-hidden="true"
          fill
          /* ⚠️ Declared, or Next serves the largest candidate to every viewport for a
             picture that is never more than a third of a desktop card. The stacked card
             is ~75% of a phone; the row card ~22vw of a desktop. */
          sizes={stacked ? "75vw" : "(min-width: 1024px) 22vw, 40vw"}
          className="object-cover"
        />
      </div>

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col gap-lg",
          /**
           * ⚠️ THE COPY IS INSET FURTHER THAN THE IMAGE, in both layouts, and it is the
           * copy that carries it rather than the card — the image stays tight to its own
           * corner while the text is held off the edges.
           *
           * `stacked`: `px-lg` (20) on top of the card's `p-xl` (24), so the copy sits
           * 44 from the card's edge against the image's 24. Matched to `Card`, the Our
           * Work card, which insets its copy panel by `p-section-x` over a full-bleed
           * image (Jimmy, 13 Aug: "so it isn't inline with the image"). 20 rather than
           * the token itself because `section-x` is a fluid 20 → 50 tuned for SECTION
           * gutters; inside a card three-quarters of a phone wide its upper end would
           * eat the measure. At phone widths the two resolve to the same number anyway.
           *
           * `row`: `pr-lg` only. The image is beside the copy rather than above it, so
           * there is no shared edge to break — just the card's right edge to hold off.
           */
          stacked ? "px-lg pb-base" : "justify-center py-lg pr-lg",
        )}
      >
        {/* ══ The pill and the title are ONE GROUP ═══════════════════════════
            ⚠️ `gap-base` (16) INSIDE, against the column's `gap-lg` (20) between
            groups — copied from `Card`, the Our Work card, deliberately (Jimmy,
            13 Aug). It is the same content hierarchy in both: a pill that labels a
            title, then copy that explains it. Tighter inside the pair than between
            the pairs is what makes the pill read as belonging to the title rather
            than as a third item in an evenly-spaced stack.

            `Card` reaches this with `contents` on a flattened group; here it is a real
            wrapper, because this column has no `mt-auto` stats row to pin and so does
            not need the children hoisted into the parent's flex context.

            ⚠️ The card's OUTER padding is untouched (`p-xl`) — only the interior
            rhythm was matched. */}
        <div className="flex flex-col gap-base">
          {/* ⚠️ `Tag`, the existing chip. It was hand-rolled here first and that was
              wrong — `Tag` is the site's small pill and its `light` variant (`ink-100`
              on `ink-900`) is already the pale-chip-on-a-card case, so a second one
              here would only drift from it.

              ⚠️ NO `<ul>`. There is exactly one, and a one-item list is announced as
              "list, 1 item" for something that is a caption. It went with the array —
              see `question`. */}
          {question ? <Tag label={question} /> : null}

          {/* `h3`: the section's own heading is the h2, so a service sits one level
              below it (CLAUDE.md §5 — logical heading order). `text-balance` splits a
              wrapped title evenly rather than leaving an orphan. */}
          <h3 className="text-balance text-service-title text-ink-900">{title}</h3>
        </div>

        <div className="flex flex-col gap-base text-body text-ink-600">
          {body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>
    </article>
  );
}
