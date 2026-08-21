import { cn } from "@/lib/cn";
import { Eyebrow } from "@/components/Eyebrow";
import { Icon, type IconName } from "@/components/Icon";

/**
 * ServicePanel — one service's copy: the right-hand column of the Services
 * section. Figma: `Description Container` (648 wide, 588 of content) inside
 * `SERVICES - 01…06`.
 *
 * Pure presentation. It owns no scroll state and does not know its own index —
 * the section drives which panel is showing and pairs it with `ServiceNumerals`.
 * That split is what lets the numerals and the copy move on one shared progress
 * value instead of two synchronised animations.
 *
 * Measured from the design:
 *   eyebrow -> heading   12  (`md`)
 *   heading -> body      28  (`2xl`)
 *   heading block       588 wide, icon 100 square hard right, vertically centred
 *
 * The heading and icon sit on one row with the icon pushed to the far edge, so
 * the gap between them absorbs the difference as headings change length —
 * panel 01's heading runs to 369px and panel 06's to 282px, and the icon stays
 * put in both.
 *
 * ⚠️ The 120px of space above and below the copy in Figma is the block being
 * CENTRED in the 740-tall panel, not padding on the panel itself. It is left to
 * the section so the panel does not carry a height it cannot honour at other
 * viewports (CLAUDE.md §0).
 *
 * ⚠️ v1 paired each service with a square photo; v2 replaces that with a stroked
 * icon. The copy itself is unchanged — verified against the v2 frames — but
 * `content.ts` still carries `image` on these rows. Swapping it for `icon` is a
 * D8 change, flagged in COMPONENTS.md.
 */

/**
 * ⚠️ THE INTERNAL STAGGER WAS REMOVED (13 Aug, Jimmy's call). Each part used to lag
 * the card by its distance from the active slot — eyebrow 10px, heading 22, body 38
 * — so the panel appeared to ASSEMBLE top-down rather than arrive as one block.
 *
 * It was built for the old vertical reel, where a card was a plain column of copy
 * sliding up a track with no edge of its own. There the lag was the only motion and
 * it read as choreography.
 *
 * The orbit broke that premise. The card is now a bordered, frosted surface
 * travelling on an arc, so the copy visibly slid AGAINST its own edge — the same
 * values went from "the panel is assembling" to "the text is not attached to the
 * card". The arc already carries the arrival.
 *
 * ⚠️ If some sense of assembly is ever wanted back, it should be a FADE, not a
 * positional lag. A fade cannot detach from an edge; a translate always can.
 *
 * `offset` is kept on the props — it still describes the panel's distance from the
 * active slot and costs nothing — but nothing reads it now.
 */

export interface ServicePanelProps {
  /** Same on every panel ("Services") — a prop, not a constant, so the CMS owns it. */
  eyebrow: string;
  /**
   * Plain text, no embedded line breaks. Where it wraps is layout's decision, not
   * content's — see the note on the heading below.
   */
  title: string;
  /** One string per paragraph. */
  body: string[];
  icon: IconName;
  /**
   * ⚠️ Set FALSE inside the mobile carousel. There the eyebrow is fixed above the
   * strip and only the title, icon and copy move — six identical "SERVICES" pills
   * sliding past would be the same word animating in and out for no reason.
   */
  showEyebrow?: boolean;
  /**
   * ⚠️ FALSE on the desktop orbit (13 Aug). The service glyphs moved OUT of the cards
   * and into the reel beside them, where they replaced the `01`…`07` numerals at the
   * same size — so a card carrying one as well would show the same mark twice, a
   * metre apart.
   *
   * It stays TRUE on the phone, where there is no reel: the carousel is the whole
   * section there, and without it the cards lose their only glyph.
   */
  showIcon?: boolean;
  /**
   * Paint the panel as a CARD — `neutral-200` fill, `shadow-elevated`, 30px radius,
   * 60px padding — instead of leaving the copy loose on the page. Added 13 Aug.
   *
   * ⚠️ It changes three things beyond the fill, all of which follow from having an
   * edge:
   *   · `md:pr-6xl` is dropped. That was the design's 60px TRAILING INSET, standing
   *     in for the padding a surface would have given. Keep both and the right side
   *     gets 120.
   *   · the body loses its `md:w-3/4` cap. That proportion held a shorter measure
   *     against a heading that ran the full column; inside a padded box the padding
   *     already does it, and 75% reads as the paragraph being mysteriously indented.
   *   · the content centres vertically, for the case where something outside gives
   *     the card a height. It HUGS ITS CONTENT by default — the six cards are
   *     deliberately six different heights (13 Aug). Equal heights were tried first
   *     and made the shortest card mostly empty box.
   *
   * ⚠️ Does NOT change the section's geometry. Services stays FLUSH (CLAUDE.md
   * §0.1): what decides containered-vs-flush is whether the SECTION paints a
   * surface, and it still doesn't — the panel does. Same relationship Banner has
   * with its Card.
   */
  surface?: boolean;
  /**
   * Distance from the active slot, in slots. `0` is fully arrived; `±1` is one
   * service away. The pinned reel passes `index - progress`; the stacked layout
   * leaves it at 0, which is why the phone build needs no special case.
   */
  offset?: number;
  className?: string;
}

export function ServicePanel({
  eyebrow,
  title,
  body,
  icon,
  showEyebrow = true,
  showIcon = true,
  surface = false,
  offset = 0,
  className,
}: ServicePanelProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2xl",
        surface
          ? cn(
              // `relative` is what the corner icon anchors to — see the <Icon> at the
              // foot of this component.
              // 30px — the site's card/section radius.
              // ⚠️ GLASS ON A GRADIENT, changed 13 Aug from `bg-neutral-200` +
              // `shadow-elevated`. The section's ground is now `gradient-services`,
              // so a warm opaque card on it read as a patch rather than a surface.
              //
              // ⚠️ THE FILL CARRIES THE FROST; THE BLUR ONLY SOFTENS THE WHEEL.
              // `backdrop-filter` shows only where there is texture behind it, so a
              // blur-led card looked frosted where the wheel passed and plain
              // everywhere else — the material appeared and disappeared as you
              // scrolled. `overlay-glass-card` is there regardless of the backdrop,
              // so it is the constant, and the blur was brought down to match.
              // Same caveat as CLAUDE.md §4.1.
              //
              // No `shadow-elevated`: that stack is tuned for dark-on-light and
              // disappears on a dark ground while still costing four layers.
              "relative justify-center rounded-3xl border border-border-glass",
              // ⚠️ `glass-card` + `blur-card`, NOT the form's `glass-panel`/`panel`.
              // Both are stronger, and both are stronger for the same reason: the
              // wheel turns directly behind these cards. At the form's 5% and 20px
              // its diamonds read straight through as recognisable shapes.
              "bg-overlay-glass-card backdrop-blur-card",
              // ⚠️ 60px is the brief, and it is `md` AND UP ONLY. On a phone the card
              // is `basis-3/4` of the strip — about 244px at 375 — so 60 a side would
              // leave ~124px of measure, roughly 13 characters a line. 32 leaves ~180.
              // If the phone card ever goes full-width, this step can go.
              "p-3xl md:p-6xl",
            )
          : // The design's 60px TRAILING INSET on the loose copy column: without it the
            // icon sits hard against the column edge instead of stopping short of it.
            // DESKTOP ONLY — in a full-width carousel card on a phone it was 60px of
            // nothing taken off an already narrow measure. The `surface` variant drops
            // it entirely; see the prop.
            "md:pr-6xl",
        className,
      )}
    >
      <div className="flex flex-col gap-md">
        {/* Each staggered part gets a WRAPPER carrying the transform, rather than
            the transform going on the component itself. `Eyebrow` and `Icon` are
            shared components and neither takes a `style`; giving them one so this
            section could nudge them would push a layout concern into two components
            that have nothing to do with it. */}
        {/* ⚠️ The pill follows the SURFACE, not the section. On the glass card the
            light variant's green-600 label sat on a dark ground at about 1.6:1 —
            legible as a shape, not as text. */}
        {showEyebrow ? <Eyebrow label={eyebrow} variant={surface ? "dark" : "light"} /> : null}

        {/* ⚠️ ON THE `surface` VARIANT THE ICON IS NOT IN THIS ROW AT ALL — it is
            absolutely positioned in the card's corner, below. What stays here is the
            heading plus the RESERVED SPACE the icon needs, because an absolutely
            positioned element is out of flow and the title would otherwise run
            straight under it.

            History, so it is not re-litigated: the icon was inline with
            `justify-between`, which pushed it to the far edge and let the gap absorb
            headings of different lengths (panel 01 runs to 369px, panel 06 to 282).
            Icon-LEADING was also tried on 13 Aug (`flex-row-reverse` + `justify-end`)
            and reverted — the SIZE was the fix, not the position. Pinning it to the
            corner supersedes both: with six cards of six different heights, an inline
            icon sat at a different height on every card, so nothing lined up down the
            column. */}
        <div
          className={cn(
            "flex items-center gap-xl will-change-transform md:gap-col",
            surface ? "justify-start" : "justify-between",
          )}
        >
          {/* `h3` deliberately. The section's own heading is the h2, so a service
              sits a level below it — the design's type scale and the document outline
              are answering different questions here (CLAUDE.md §5: heading order).

              ⚠️ DELIBERATE DEVIATION FROM FIGMA, agreed with Jimmy. All six titles
              carry an authored `\n` in the design and sit on two lines. Here they
              run on ONE line and wrap only when the column is too narrow. The
              design's break was drawn against a fixed 1440 frame; on a full-width
              site (§0) a hard break would strand a single word on line two at wide
              viewports. `text-balance` makes the wrap, when it happens, split the
              line evenly instead of leaving an orphan.

              ⚠️ `text-service-title` — a 50px maximum that sits BETWEEN `h2` (60) and
              `h3` (35), and it is a real step on the scale rather than a one-off. The
              title ran h2 → h3 → h2 → here across 13 Aug: 60 crowded the box, 35 read
              as a card label rather than a heading, and neither neighbour was right.

              ⚠️ It takes `h2`'s FACE — Regular 400 at line-height 1.2 — not `h3`'s
              Medium 500 at 1.1. A smaller h2, not a larger h3, which is what keeps it
              reading as a heading. `QuizPanel`'s card-state heading uses the same
              token; the two are meant to be the same type.

              ⚠️ THE RIGHT PADDING IS THE ICON'S FOOTPRINT, not taste. It must stay
              ≥ the glyph plus a gap at each breakpoint, or the first line of a long
              title slides under the corner icon:
                  phone  48 glyph + 12  = `pr-6xl`  (60)
                  md+    72 glyph + 48  = `pr-7xl` (120)
              Change a glyph size and change this in the same edit. */}
          <h3
            className={cn(
              // ⚠️ ADELLE REGULAR ITALIC (13 Aug), not Manrope. Everywhere else on the
              // site `font-serif` is reserved for ACCENT WORDS INSIDE a heading
              // (CLAUDE.md §1.2) — these six are the one place a whole heading is set
              // in it. Deliberate, and the reason the section reads differently from
              // the rest of the page.
              //
              // ⚠️ `QuizPanel`'s heading is NOT included. Panel 07 keeps Manrope, so
              // the card that is not a service does not look like one.
              // ⚠️ `green-100`, not `ink-50` (13 Aug). The service titles sit back a
              // step from pure white so the section's one white heading — panel 07's
              // "Not sure what you need?" — reads as the thing that is not a service.
              // `QuizPanel` keeps `ink-50` deliberately; do not unify them.
              "text-balance font-serif text-service-title italic text-green-100",
              surface && "pr-6xl md:pr-7xl",
            )}
          >
            {title}
          </h3>

          {/* The INLINE icon — default variant only. Decorative: the heading already
              names the service, so an accessible name here would just repeat it
              (CLAUDE.md §5). `accent-numeral`, NOT green — the same #9CB0A8 as the
              numerals down the left. Verified on all six panels. */}
          {!surface ? (
            <Icon
              name={icon}
              className={cn(
                "h-service-glyph-sm w-service-glyph-sm shrink-0 text-green-300",
                "md:h-service-glyph md:w-service-glyph",
              )}
            />
          ) : null}
        </div>
      </div>

      {/* 75% of the column, not the full width.
          ⚠️ `w-3/4`, not `max-w-measure`. The measure cap (68ch) is wider than
          this column ever gets, so it was doing nothing — the body ran the full
          width and sat flush with the heading above it. A proportion holds the
          shorter line length at every viewport, which is the point: it lets the
          heading read as the wider element. Below `md` it goes back to full width,
          where three-quarters of a phone is too narrow to set 18px type in. */}
      {/* ⚠️ THE RULE IS AN ELEMENT, NOT A LEFT BORDER (13 Aug). It was
          `border-l-rule`, which cannot have rounded ends — a border is drawn by the
          box and takes the box's corners, so `rounded-full` on the paragraph would
          have rounded the TEXT's corners, not the stroke's. A sibling span can be a
          shape in its own right.
          `items-stretch` (the flex default) is what makes it exactly as tall as the
          copy, so a paragraph that wraps to three lines on one card and five on
          another still needs no measuring — the same property the border had. */}
      <div className={cn("flex", surface ? "gap-xl" : undefined)}>
        {surface ? (
          <span aria-hidden="true" className="w-xs shrink-0 rounded-full bg-green-300" />
        ) : null}
        <div
          className={cn(
            // ⚠️ `text-body` (a flat 16), stepped down from `text-body-lg`
            // (clamp 16 → 18) on 13 Aug — the next stop down, matching the heading's
            // drop in the same pass.
            //
            // ⚠️ It is FIXED, not fluid. `body-lg` scales 16 → 18 across the viewport;
            // `body` does not scale at all. So on a phone the two are identical and
            // this change is invisible — it only shows from about `lg` up. That is the
            // scale's own decision, not an oversight here.
            "flex flex-col gap-base text-body text-green-100 will-change-transform",
            // ⚠️ Not applied on the `surface` variant — see the prop. The card's own
            // padding already holds the measure in; 75% on top of it reads as an
            // indent rather than as a shorter line.
            !surface && "md:w-3/4",
          )}
        >
          {body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>

      {/* ── The corner icon — `surface` only ────────────────────────────────────
          Pinned to the card's top-right, 60px in on both axes at `md` and up.

          ⚠️ THE INSET DELIBERATELY EQUALS THE CARD'S PADDING at each breakpoint
          (`3xl`/32 on a phone, `6xl`/60 from `md`), so the glyph sits exactly on the
          content box's corner — level with the eyebrow's cap line, flush with the
          right edge of the copy. Set it to a flat 60 and on a phone it would float
          28px inside the content instead of on its corner. **Change `p-3xl md:p-6xl`
          above and change this in the same edit** — they are one measurement written
          twice, and there is no way to express that in Tailwind.

          ⚠️ Absolute, not inline, because the cards hug their content and are
          therefore six different heights. Inline, the glyph sat at a different height
          on every card and nothing lined up down the column; pinned, all six agree.

          ⚠️ It is OUT OF FLOW, so the heading reserves its footprint by hand — see
          the `pr-6xl md:pr-7xl` on the h3 above.

          ⚠️ NOT inside a `shift()` wrapper. The staggered parts lag the panel as it
          arrives; the icon belongs to the card's frame rather than to its copy, so it
          holds still while the copy assembles. Giving it a lag made it drift away
          from the corner it is supposed to be fixed to.

          Decorative — the heading already names the service, so an accessible name
          here would only repeat it (CLAUDE.md §5). `accent-numeral` (#9CB0A8), the
          same quiet sage as the numerals down the left, NOT brand green. */}
      {surface && showIcon ? (
        <Icon
          name={icon}
          className={cn(
            "pointer-events-none absolute right-3xl top-3xl text-green-300",
            "h-service-glyph-sm w-service-glyph-sm",
            "md:right-6xl md:top-6xl md:h-service-glyph md:w-service-glyph",
          )}
        />
      ) : null}
    </div>
  );
}
