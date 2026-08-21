import { cn } from "@/lib/cn";
import { SectionHeader, type HeadingSegment } from "@/components/SectionHeader";
import { Card, type CardStat } from "@/components/Card";
import { Cta } from "@/components/Cta";
import { Reveal } from "@/components/Reveal";

/**
 * Work — the case-study grid. Figma: `WORK` (36:148).
 *
 * ⚠️ CONTAINERED (CLAUDE.md §0.1). It paints a surface — `neutral-200` at radius
 * 30 — so it is inset by the gutter and carries `section-x` (50). `10 + 50 = 60`
 * puts its content on the same optical line as the flush sections either side.
 * Figma confirms: `x=10, w=1420`, content at `x=50`.
 *
 * ── Layout ────────────────────────────────────────────────────────────────────
 * Two rows, both `gap-xl` (24), matching Figma exactly:
 *
 *   row 1   featured (870) + narrow (426)   → a 3-column grid, featured spans 2
 *   row 2   equal (648) + equal (648)       → a 2-column grid
 *
 * The 3-column grid is not an approximation. At 1320 with `gap-xl`, each column is
 * `(1320 − 48) / 3 = 424` — so two columns plus the gap between them is 872 and one
 * column is 424, against the design's 870 and 426. Within 2px, from the grid alone,
 * with no widths to keep in sync.
 *
 * Two grids rather than one: row 2's cards are 1.5 columns wide each, which no
 * 3-column grid can express without fractional spans.
 *
 * ── Responsive (RESPONSIVE_SPEC.md §5.5) ─────────────────────────────────────
 * Everything is one column below `lg`, which is also where `Card`'s rollover turns
 * on — so the cards never sit in their multi-column layout while stuck in the rest
 * state.
 *
 * ⚠️ The featured card's `flex-row` split is desktop-only, and since 13 Aug that is
 * BUILT rather than merely intended: below `lg` it stacks into the same vertical
 * card as `narrow`, keeping its stats. This line used to describe the intent while
 * the component still rendered a side-by-side split at every width.
 */

export interface WorkCardContent {
  image: string;
  tag?: string;
  title: string;
  description?: string;
  href?: string;
  stats?: CardStat[];
}

export interface WorkProps {
  eyebrow: string;
  heading: HeadingSegment[];
  body: string;
  cta: { label: string; href: string };
  featured: WorkCardContent;
  tall: WorkCardContent;
  grid: WorkCardContent[];
  className?: string;
}

/**
 * Delay between each card's reveal, in ms.
 *
 * ⚠️ **PER CARD AGAIN** (Jimmy, 13 Aug: "make them come in 1 by 1"). It went
 * `index × 160` → per-row → back to `index × 90`. The per-row version was a reasonable
 * reading of "each row can come in after each other" and it is not what was wanted; the
 * grouping is a taste call, so it lives here in the CALLER rather than in `Reveal`.
 *
 * ⚠️ 90 against the 560ms duration is deliberately TIGHTER than the 160 that read as
 * cards taking turns. Card four starts at 270ms, while card one is still less than
 * halfway — heavy overlap is what makes four separate entrances read as one wave. The
 * whole set settles at 830ms.
 *
 * 🔴 ⚠️ **THE INDEX RESTARTS PER ROW, and continuing it across both was a real fault**
 * (Jimmy, 13 Aug: "can the second row start a little sooner"). It ran 0 · 90 · 180 · 270
 * across all four, on the reasoning that one continuous sequence reads better than two.
 *
 * That reasoning quietly ignored how the trigger works. **Each card observes ITSELF**,
 * so row two already fires later than row one by scroll position — and then paid a
 * further 180–270ms of delay on top. The wait compounded: later trigger PLUS larger
 * delay, for a row whose lateness was already handled by the viewport.
 *
 * Per row, each card's delay is relative to its own row's arrival, which is the only
 * frame of reference it has. Row one is 0 · 90; row two is 0 · 90 again.
 *
 * ⚠️ The one case this gives up is both rows entering together on a very tall screen,
 * where the four now read as two pairs rather than one run of four. That is the rarer
 * case and the lesser fault — a card sitting still on screen for a third of a second
 * after you have scrolled to it is the worse one.
 */
const CARD_STAGGER = 90;

export function Work({
  eyebrow,
  heading,
  body,
  cta,
  featured,
  tall,
  grid,
  className,
}: WorkProps) {
  return (
    <section
      id="work"
      className={cn(
        "mx-gutter rounded-3xl bg-neutral-200 px-section-x py-section-y",
        className,
      )}
    >
      {/* Header to cards is 60 in Figma. `6xl` is that exactly; `block` (→80) is
          the usual section-internal gap but would overshoot by 20. */}
      <div className="flex flex-col gap-6xl">
        {/* `split` puts eyebrow + heading left and body + action right, which is
            precisely this header — no bespoke layout needed. */}
        <SectionHeader
          eyebrow={eyebrow}
          heading={heading}
          body={body}
          align="split"
          action={<Cta label={cta.label} href={cta.href} tone="ink" />}
        />

        {/* ══ THE REVEAL ══════════════════════════════════════════════════════
            ⚠️ ONE `Reveal` PER CARD, staggered ONE BY ONE in reading order — featured,
            tall, then the two equals left to right. Each card is a whole thought, which
            is what MOTION_SPEC §5.1 means by "one reveal per block": the tag, title and
            copy inside a card arrive together because they ARE one block.

            ⚠️ The stagger index RESTARTS PER ROW. It went per-card-across-both (160) →
            per-row grouping → per-card-across-both (90) → per-card-within-a-row (90).
            Continuing the index across rows made row two wait twice — once for its own
            observer, then again for a delay it had already earned by being lower down.
            See `CARD_STAGGER`.

            ⚠️ `lg:col-span-2` MOVED FROM THE CARD TO THE WRAPPER. The `Reveal` is the
            grid item now, so placement belongs to it — left on the `Card` the span would
            silently do nothing and the featured card would drop to one column.

            ⚠️ The observer is per-card, so a card that is already on screen at load
            reveals immediately while the ones below wait. That is the point of
            observing rather than firing the whole section at once. */}
        <div className="flex flex-col gap-xl">
          <div className="grid gap-xl lg:grid-cols-3">
            <Reveal delayMs={0} className="lg:col-span-2">
              <Card
                variant="featured"
                image={featured.image}
                tag={featured.tag}
                title={featured.title}
                description={featured.description}
                stats={featured.stats}
                href={featured.href}
              />
            </Reveal>
            <Reveal delayMs={CARD_STAGGER}>
              <Card
                variant="narrow"
                image={tall.image}
                tag={tall.tag}
                title={tall.title}
                description={tall.description}
                href={tall.href}
              />
            </Reveal>
          </div>

          <div className="grid gap-xl lg:grid-cols-2">
            {grid.map((card, i) => (
              <Reveal key={`${card.title}-${i}`} delayMs={i * CARD_STAGGER}>
                <Card
                  variant="equal"
                  image={card.image}
                  tag={card.tag}
                  title={card.title}
                  description={card.description}
                  href={card.href}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
