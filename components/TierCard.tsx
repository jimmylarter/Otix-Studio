import { cn } from "@/lib/cn";
import { Eyebrow } from "@/components/Eyebrow";
import { Cta } from "@/components/Cta";
import { FeatureItem } from "@/components/FeatureItem";

/**
 * TierCard — a pricing tier. Figma: `SPARK` (×3 in Pricing).
 *
 * Surface is IDENTICAL across all three tiers: the `Gradient` paint style
 * (green-900 → green-950), a white-20% hairline, radius 30, `shadow-elevated`,
 * padding 40 top / 32 elsewhere.
 *
 * Only two things mark the featured tier:
 *   - its CTA is `mint` rather than `green`
 *   - it carries a bespoke "Most Popular" tab hugging the inside of the top edge
 *
 * Composes `Eyebrow` (tier name), `FeatureItem` and `Cta` — so it is also the
 * first real test of whether those primitives hold up inside a larger component.
 */

export interface TierCardProps {
  /** Short tier name in the eyebrow pill — e.g. "Spark", "Studio", "Summit". */
  tier: string;
  /** Package name — e.g. "The Launchpad". */
  name: string;
  description: string;
  /** Bare number as a string, e.g. "2,500". The $ and + are rendered by this component. */
  price: string;
  /** A bare string is included; `{ label, included: false }` renders the excluded state. */
  features: Array<string | { label: string; included?: boolean }>;
  cta: { label: string; href: string };
  featured?: boolean;
  /** Badge copy for the featured tier. */
  badge?: string;
  className?: string;
}

export function TierCard({
  tier,
  name,
  description,
  price,
  features,
  cta,
  featured = false,
  badge = "Most Popular",
  className,
}: TierCardProps) {
  return (
    <div className={cn("flex", className)}>
      {/*
        `group` on the card is what makes the Cta play its own rollover when you
        hover anywhere on the tier — Tailwind's `group-hover:` fires on ANY ancestor
        marked `group`, so the Cta's internal classes activate without it being
        hovered directly. It keeps its own `group` too, so direct hover still works.
      */}
      <article
        className={cn(
          "group relative isolate flex w-full flex-col gap-base rounded-3xl border",
          "border-border-on-dark bg-gradient-green p-3xl pt-4xl shadow-elevated",
          "transition-colors duration-slow ease-smooth hover:border-green-300",
        )}
      >
        {/* The rollover gradient, cross-faded in over the base fill. `-z-10` inside
            the card's own stacking context puts it above that fill but behind the
            content.

            ⚠️ A SECOND LAYER faded in, not a `background-image` swap — two
            gradients cannot interpolate, so a swap would hard-cut.

            ⚠️ `gradient-green-lift` (green-700 → green-950), not the base ramp
            inverted. That was the previous behaviour and it kept both stops while
            only reordering them, so the card never actually got lighter — it just
            moved its weight top to bottom, which reads as a wobble rather than a
            response. See the token. */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-gradient-green-lift",
            "opacity-0 transition-opacity duration-slow ease-smooth group-hover:opacity-100",
          )}
        />
        {/*
          Bespoke tab, not a pill: it sits INSIDE the card hugging the top edge,
          centred, with square top corners and only the bottom two rounded
          (Figma: TL0 TR0 BR8 BL8, absolute, constraints CENTER / MIN).
        */}
        {featured ? (
          <span
            className={cn(
              // `-top-px` not `top-0`: the card's 1px hairline would otherwise show
              // as a stroke across the top of the tab. This covers it.
              "absolute -top-px left-1/2 z-10 -translate-x-1/2",
              "inline-flex items-center rounded-b-md bg-green-300 px-base py-sm",
              "font-mono text-eyebrow uppercase text-green-950",
            )}
          >
            {badge}
          </span>
        ) : null}
        <header className="flex flex-col gap-md">
          <div className="flex flex-col gap-sm">
            <Eyebrow label={tier} variant="dark" />
            <h3 className="text-h3 text-ink-50">{name}</h3>
            <p className="text-body text-green-100">{description}</p>
          </div>

          {/* $ hangs from the top of the figure, + sits on its baseline. */}
          <p className="flex items-stretch gap-xxs" aria-label={`$${price}+`}>
            <span aria-hidden="true" className="pt-sm text-stat-symbol text-green-300">
              $
            </span>
            <span className="text-stat-display text-ink-50">{price}</span>
            <span aria-hidden="true" className="flex items-end text-stat-symbol text-green-300">
              +
            </span>
          </p>
        </header>

        <hr className="border-0 border-t border-green-800" />

        <ul className="flex flex-col gap-md pb-md pt-sm">
          {features.map((f) => {
            const item = typeof f === "string" ? { label: f, included: true } : f;
            return <FeatureItem key={item.label} label={item.label} included={item.included ?? true} />;
          })}
        </ul>

        {/* ⚠️ DECORATIVE. The whole card is the link (below), so this is the
            visual affordance only — otherwise the card would have two tab stops to
            the same destination and a screen reader would announce it twice. */}
        <Cta
          label={cta.label}
          tone={featured ? "mint" : "green"}
          fullWidth
          decorative
          className="mt-auto"
        />

        {/*
          ── The stretched link ──────────────────────────────────────────────────
          The WHOLE CARD is clickable, and this is what makes it so: one anchor
          covering the article, sitting on top of the content.

          ⚠️ An overlay element rather than an `::after` on the Cta. The Cta carries
          `overflow-hidden` to clip its badge as it exits, which would clip a
          stretched pseudo-element to the pill as well — the usual technique does
          not survive this component.

          ⚠️ The accessible name is "{cta} — {name}", not just the label. All three
          tiers say "Start Project"; a screen reader listing the page's links would
          otherwise read three identical entries with no way to tell them apart.

          ⚠️ `rounded-3xl` matches the card so the focus ring follows the corner
          rather than cutting across it. The ring lands here rather than on the
          pill, which is correct — the card is the control now.

          ⚠️ `-inset-px`, not `inset-0`. Insets resolve against the PADDING box, so
          `inset-0` left the card's own 1px border outside the hit area — the one
          strip of the card that looked clickable and was not. -1px puts the link on
          the border box exactly.

          ⚠️ It sits ABOVE the content, so text inside the card is no longer
          selectable. That is the cost of a fully clickable card and it is the
          right trade for a pricing tier, where the whole thing is one offer.
        */}
        <a
          href={cta.href}
          aria-label={`${cta.label} — ${name}`}
          className="absolute -inset-px rounded-3xl focus-visible:shadow-focus focus-visible:outline-none"
        />
      </article>
    </div>
  );
}
