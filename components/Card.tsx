import { cn } from "@/lib/cn";
import { Tag } from "@/components/Tag";
import { ParallaxImage } from "@/components/ParallaxImage";
import { StatItem } from "@/components/StatItem";

/**
 * Card — project / case card. Figma: `Article Card`.
 * Banner is a VARIANT of this, not its own component (CLAUDE.md §3).
 *
 * Surface: neutral-0, radius 24, `shadow-elevated`, 5px image inset (→ `p-xs`,
 * image at `rounded-xl` so the radii stay concentric).
 *
 * ── The rollover ──────────────────────────────────────────────────────────────
 * Designed in Figma as three frames (`36:988`, `36:1041`, `36:998`). The image
 * GROWS into the card and the copy inverts onto it.
 *
 * The image genuinely animates its size — it is not revealed:
 *   narrow / equal → height  `h-media` → `h-media-full`   (grows DOWN, top anchored)
 *   featured       → width   `w-1/2`   → `w-full`         (grows RIGHT, left anchored)
 *   banner         → already full-bleed, so the image expands IN PLACE (scale)
 *
 * FEATURED does NOT re-compose on hover. Its copy holds the TOP of the right-hand
 * column and the stats hold the bottom; only the image, the scrim and the text
 * colours change.
 *
 * ⚠️ The copy used to travel down to meet the stats, animated via `flex-grow` on
 * two spacers. Removed, reinstated, and removed again — **settled 12 Aug: it stays
 * at the top.** Do not reinstate it without asking.
 *
 * Because the copy now holds the top of a FULL-HEIGHT column, featured takes a
 * RIGHT-to-left scrim (`scrim-green-right`) rather than the bottom-right corner
 * ramp it had. A corner ramp is built for copy that ends up bottom-right; against
 * top-aligned copy it leaves the heading sitting on bare image.
 *
 * That needs the card to have a DEFINITE height (`h-card`) — a content-sized card
 * gives the image nothing to interpolate towards.
 *
 * Motion is deliberately asymmetric, and matched to the Cta: the grow is quicker
 * and sharper (`slow` / `cta-expand`), the return slower with a firmer elastic
 * settle (`slower` / `out-back`).
 *
 * The copy panel has NO background of its own — the card is already white, and the
 * image sits behind it at `-z-10`, so the panel simply lets the card show through.
 *
 * BELOW `lg` the card stays in its rest state (image band, dark copy on white).
 * Inverting to light-on-image without a hover to trigger it hurts readability on
 * small screens. Revisit in D5.
 */

export type CardVariant = "narrow" | "equal" | "featured" | "banner";

export interface CardStat {
  value: string;
  label: string;
}

export interface CardProps {
  image: string;
  alt?: string;
  tag?: string;
  title: string;
  description?: string;
  /** Featured variant only. */
  stats?: CardStat[];
  variant?: CardVariant;
  href?: string;
  className?: string;
}

export function Card({
  image,
  alt = "",
  tag,
  title,
  description,
  stats,
  variant = "narrow",
  href,
  className,
}: CardProps) {
  const isFeatured = variant === "featured";
  const isBanner = variant === "banner";
  const isEqual = variant === "equal";
  const isStacked = !isFeatured && !isBanner;
  /** Banner has no hover to reach — it renders rolled over always. */
  const always = isBanner;

  const Root = href ? "a" : "article";

  /**
   * One class per property — never two values for the same property in one list.
   *
   * ⚠️ FEATURED STACKS BELOW `lg` (13 Aug). The side-by-side split needs roughly
   * 700px to give the copy column a readable measure; on a phone it left two
   * ~160px columns, which is neither a card nor a readable paragraph. Below `lg` it
   * becomes the same vertical card as `narrow` — image band on top, copy beneath —
   * and KEEPS its stats, which are the only thing that distinguishes it there.
   */
  const rootDirection = isFeatured ? "flex-col lg:flex-row" : "flex-col";

  const mediaBox = isBanner
    ? // `inset-0`, not `inset-xs` — the banner has no white frame to sit inside.
      "inset-0"
    : isFeatured
      ? // Below `lg` this is the stacked band; from `lg` it is the left half.
        //
        // ⚠️ `lg:right-auto` is required and easy to miss: `inset-x-xs` sets BOTH
        // left and right, so without releasing `right` the box would still be
        // pinned to both edges at `lg` and `w-1/2` would never take effect.
        // `lg:h-auto` hands the height back to `inset-y-xs` for the same reason.
        //
        // `w-card-inner`, not `w-full` — see the token. `w-full` overshot the
        // card's right inset by 4px and clipped the white frame off that edge.
        cn(
          // ⚠️ `h-media-wide`, matching the `equal` cards below it — NOT `h-media`.
          // Stacked, this card sits directly above the 2-up row in one column, and
          // a shorter band read as a different kind of card rather than the same
          // card at a different size. It pairs with the spacer below; the two are
          // one number in two places.
          "inset-x-xs top-xs h-media-wide",
          "lg:inset-y-xs lg:left-xs lg:right-auto lg:h-auto lg:w-1/2",
          "lg:group-hover:w-card-inner",
        )
      : // `equal` is the wider 2-up card: taller band, taller card, and therefore
        // a taller grown state too. All three of its tokens are `-wide` variants
        // and must move together (see the note in tailwind.config.ts).
        //
        // ⚠️ `narrow` ALSO takes the wide band below `lg` (13 Aug). On mobile every
        // card is full width in one column, so `narrow` is not narrow at all — it is
        // the same width as the 2-up cards beneath it, and a shorter band made it
        // look like a different component rather than the same one. From `lg` it
        // goes back to `h-media`, where it genuinely is the narrow column.
        cn(
          "inset-x-xs top-xs",
          isEqual
            ? "h-media-wide lg:group-hover:h-media-full-wide"
            : "h-media-wide lg:h-media lg:group-hover:h-media-full",
        );

  const panelLayout = isBanner
    ? // ⚠️ A COLUMN, left-aligned — not the split row it was. Figma stacks tag →
      // title → body against the left edge; the row version put the body on the
      // right, which read as two unrelated blocks at opposite ends of a very wide
      // band. `gap-lg` (20) matches the frame's own spacing.
      "mt-auto w-full flex-col items-start gap-lg p-section-x"
    : isFeatured
      ? // Stacked below `lg` (full width, card padding), split from `lg` up.
        "w-full flex-col justify-start p-xl lg:ml-auto lg:w-1/2 lg:p-5xl"
      : // Copy sits directly under the image band, aligned to the TOP.
        "flex-col justify-start p-xl";


  return (
    <Root
      {...(href ? { href } : {})}
      className={cn(
        // Three heights, not one: the banner is a letterbox, and `equal` is the
        // wide 2-up card whose taller image band needs the extra room.
        "group relative isolate flex overflow-hidden rounded-2xl",
        // ⚠️ FEATURED IS AUTO-HEIGHT BELOW `lg`. The fixed height exists so the
        // image can animate between two real lengths on rollover — and that
        // rollover is `lg:group-hover` only, so below `lg` there is nothing to
        // interpolate and nothing to hold the height for. Stacked, it also carries
        // more than the others (copy AND stats), so a fixed `h-card` would clip.
        // ⚠️ `narrow` takes the TALLER card below `lg` too. Its band grew by 40px
        // there, and on `h-card` that came straight out of the copy area — the
        // description had less room on a phone than on a desktop, which is backwards.
        // The two tokens are a pair: `h-media-wide` belongs with `h-card-wide`.
        isBanner
          ? "h-banner"
          : isEqual
            ? "h-card-wide"
            : isFeatured
              ? "h-auto lg:h-card"
              : "h-card-wide lg:h-card",
        // ⚠️ The banner has NO white frame and NO shadow. `p-xs` + `bg-neutral-0`
        // are what draw the 4px frame on the other variants; the banner's image is
        // the section, so a frame around it reads as a card floating on the page
        // rather than a full-bleed band. Nothing to elevate, so no shadow either.
        isBanner ? "p-0" : "bg-neutral-0 p-xs shadow-elevated",
        "focus-visible:shadow-focus focus-visible:outline-none",
        rootDirection,
        className,
      )}
    >
      {/* TODO(D9): swap to next/image with `fill` + `sizes`. */}
      <span
        className={cn(
          "absolute -z-10 overflow-hidden rounded-xl",
          // Asymmetric by design, and matched to the Cta: the grow is quicker and
          // sharper, the return slower with a firmer elastic settle.
          "transition-size duration-slower ease-out-back",
          "lg:group-hover:ease-cta-expand",
          // ⚠️ FEATURED grows slower than the others, and it is not a preference.
          // The stacked variants animate their image's HEIGHT by ~250px; featured
          // animates its WIDTH across half the card, which is roughly twice the
          // distance. At the same duration that reads as twice the speed. `expand`
          // (560) against `slow` (420) puts the two back at a comparable rate.
          isFeatured ? "lg:group-hover:duration-measured" : "lg:group-hover:duration-slow",
          mediaBox,
        )}
      >
        {/*
          Banner drifts on SCROLL rather than expanding on hover. It is full-bleed
          already, so there was never a band to grow — the old `scale-105` was a
          hover effect on a section-sized image, which read as a twitch. Parallax
          suits its size and needs no pointer, so it works on touch too.
        */}
        {isBanner ? (
          <ParallaxImage src={image} />
        ) : (
          <img
            src={image}
            alt={alt}
            className={cn(
              "size-full object-cover",
              // FROST. The image blurs as it grows, so by the time the copy is
              // sitting on it the photograph has become a material rather than a
              // picture competing with the type.
              //
              // Timed with the copy's colour change (`slow`/`smooth`), not with the
              // image's own size (`expand`/`out-expo`) — the frost should arrive as
              // the copy inverts, which is when it is needed.
              //
              // ⚠️ `scale-105` is not decoration. A blur samples beyond the
              // element's box, and the wrapper clips it — so at 100% the blurred
              // edges reveal a soft transparent border on all four sides. The
              // slight overscale pushes that artefact outside the clip.
              "transition-frost duration-slow ease-smooth",
              "lg:group-hover:scale-105 lg:group-hover:blur-frost",
            )}
          />
        )}
        <span
          aria-hidden="true"
          className={cn(
            // Three shapes for three copy positions: featured's sits in a
            // full-height right column, the banner's fills the bottom of a
            // section-sized image, and the stacked variants' sits in a band.
            "absolute inset-0 transition-opacity duration-slow ease-smooth",
            isFeatured ? "bg-scrim-green-right" : isBanner ? "bg-scrim-banner" : "bg-scrim-green",
            always ? "opacity-100" : "opacity-0 lg:group-hover:opacity-100",
          )}
        />
      </span>

      {/* Reserves the image band so the copy starts below it. Static — the band
          grows behind the copy, it does not push it.

          ⚠️ This MUST use the same height token as `mediaBox` above. It was pinned
          to `h-media` while `equal` moved to `h-media-wide`, so the copy started
          30px too high and the tag overhung the image. Two places, one number —
          change them together. */}
      {isStacked || isFeatured ? (
        <span
          aria-hidden="true"
          className={cn(
            "block shrink-0",
            // ⚠️ MUST match `mediaBox` above — band and spacer are one number in
            // two places. Below `lg` EVERY variant sits on the wide band so the
            // single mobile column reads as one family of cards; only `narrow`
            // steps back down at `lg`, where it is actually the narrow column.
            isEqual || isFeatured ? "h-media-wide" : "h-media-wide lg:h-media",
            // Featured only reserves the band while it is STACKED. From `lg` the
            // image is the left column and there is nothing above the copy.
            isFeatured && "lg:hidden",
          )}
        />
      ) : null}

      {/*
        Featured runs `gap-0` and carries its own gap on the copy group. The space
        between copy and stats is `mt-auto` on the stats, not a panel gap — it has
        to be the thing that absorbs the leftover height, so the copy pins to the
        top and the stats to the bottom whatever the copy length.
      */}
      <div
        className={cn(
          "relative flex",
          isFeatured ? "gap-0" : "gap-lg",
          panelLayout,
        )}
      >
        <div className={cn("flex flex-col", isFeatured ? "gap-lg" : "contents")}>
          <div className="flex flex-col gap-base">
            {/* The tag DOES invert with the rollover: grey chip at rest, `green-300`
                once the card is hovered and the copy is sitting on the image. The
                label stays `ink-900` — mint is light enough to carry dark text, and
                switching both would make the chip read as a different component.

                Timed with the copy's colour change (`slow`/`smooth`) so the whole
                panel inverts as one gesture rather than the chip arriving
                separately. Banner is `always`, having no hover to wait for. */}
            {tag ? (
              <Tag
                label={tag}
                // ⚠️ The BANNER keeps the pale `light` chip — Figma sets it
                // `ink-100`, and on a full-bleed photo the neutral chip reads as a
                // label on the image while mint reads as part of the brand
                // furniture. Only the hover-inverting card variants go mint.
                variant="light"
                className={cn(
                  "transition-colors duration-slow ease-smooth",
                  // Safe as an override ONLY because `group-hover` adds a pseudo-
                  // class and so outranks the variant's single class. The banner's
                  // permanent state goes through `variant` instead, where a plain
                  // override would have lost on source order.
                  !always && "lg:group-hover:bg-green-300",
                )}
              />
            ) : null}
            {/* Authored `\n` in a title survives — the banners' breaks are designed
                (Figma 36:232 and 36:1162), not incidental wrapping.

                ⚠️ `lg:` ONLY, and that is the point. Those breaks are tuned to the
                frame's width — Banner 2's first one lands mid-sentence, between
                "hardest-working" and "employee", to balance three lines. A break
                tuned to one width is wrong at every other, so below `lg` the
                newlines collapse back to spaces and the title wraps naturally.
                Titles with no break in them are unaffected either way. */}
            <h3
              className={cn(
                "whitespace-normal text-h4 transition-colors duration-slow ease-smooth lg:whitespace-pre-line",
                always ? "text-ink-50" : "text-ink-900 lg:group-hover:text-ink-50",
              )}
            >
              {title}
            </h3>
          </div>

          {description ? (
            <p
              className={cn(
                "max-w-measure text-body transition-colors duration-slow ease-smooth",
                always ? "text-green-100" : "text-ink-600 lg:group-hover:text-green-100",
              )}
            >
              {description}
            </p>
          ) : null}
        </div>

        {isFeatured && stats?.length ? (
          /* `mt-auto` pins the stats to the bottom and takes up all the slack,
             which is what holds the copy at the top. Static — nothing in this
             column moves on hover.

             ⚠️ `gap-lg` below `lg`, `gap-3xl` from there. Stacked, the card is
             roughly half the width the split layout gives this row, and three stats
             at a 32px gap wrapped to two lines — which put "6 wks" on its own
             beneath the other two and read as a stray figure rather than a set.
             20px keeps all three on one line on a phone. */
          <div className="mt-auto flex shrink-0 flex-wrap gap-lg pt-lg lg:gap-3xl">
            {stats.map((s) => (
              <StatItem key={s.label} value={s.value} label={s.label} tone="auto" />
            ))}
          </div>
        ) : null}
      </div>
    </Root>
  );
}
