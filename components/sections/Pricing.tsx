"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { SectionHeader, type HeadingSegment } from "@/components/SectionHeader";
import { SegmentedToggle } from "@/components/SegmentedToggle";
import { Reveal } from "@/components/Reveal";
import { TierCard } from "@/components/TierCard";

/**
 * Pricing — tabbed tier cards. Figma: `PRICING` (36:341).
 *
 * ⚠️ CONTAINERED (CLAUDE.md §0.1): `neutral-200` at radius 30, inset by the gutter.
 * Third and last panel of that kind, after Work and WhyOtix.
 *
 * ── Layout ────────────────────────────────────────────────────────────────────
 * Header splits (eyebrow + heading left, body right), then a centred
 * `SegmentedToggle`, then three columns of 424 with `gap-xl` — which is 1320
 * exactly, so a plain 3-column grid reproduces the frame with no widths declared.
 *
 * `items-start`, not the grid default: Figma's cards are 747 and 795 tall and
 * top-aligned. Stretching them to equal height would flatten the featured card's
 * extra presence, which is the one thing the design is using to mark it.
 *
 * ── The toggle owns the tier set ──────────────────────────────────────────────
 * Each tab carries its own `tiers`, so switching swaps the cards entirely rather
 * than filtering one list — Websites has three tiers, Apps & Dashboards has two.
 * The **column count follows the tier count**, so the two-tier tab fills the row
 * rather than leaving a third column empty.
 *
 * ⚠️ State lives here rather than in `SegmentedToggle`, which is controlled. That
 * is deliberate: the toggle is reused elsewhere and a component that owns its own
 * selection cannot be driven from a URL, a CMS default, or a link into a tab.
 */

export interface PricingTier {
  tier: string;
  name: string;
  description: string;
  price: string;
  features: Array<string | { label: string; included?: boolean }>;
  cta: { label: string; href: string };
  featured?: boolean;
  badge?: string;
}

export interface PricingTab {
  value: string;
  label: string;
  tiers: PricingTier[];
}

export interface PricingProps {
  eyebrow: string;
  heading: HeadingSegment[];
  body: string;
  tabs: PricingTab[];
  className?: string;
}

/**
 * Column count follows the tier count, so a two-tier tab fills the row instead of
 * leaving a third column empty. Static class strings — Tailwind's JIT cannot see
 * an interpolated one like `lg:grid-cols-${n}`, and it would silently produce no
 * CSS at all rather than an error.
 */
const COLS: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

/**
 * The tab whose cards do NOT get the scroll reveal.
 *
 * ⚠️ **Jimmy, 13 Aug: "we don't need the effect on the Apps & Dashboards cards."** It is
 * matched on the tab's `value`, not its index or its label — index breaks if a tab is
 * reordered, and the label is copy that a CMS is meant to be able to change.
 *
 * ⚠️ There is a REASON this reads well beyond taste, and it is worth keeping. The
 * reveal is a SCROLL entrance, but these cards can also arrive by TAB SWITCH — and a
 * `Reveal` that remounts on a tab change fires immediately, because it is already in
 * view. So the same component means "you scrolled to this" on first sight and "you
 * clicked that" a moment later. Websites is the default tab and is almost always met by
 * scrolling; Apps is only ever reached by clicking. **Suppressing it here is what keeps
 * the effect meaning one thing.**
 */
const NO_REVEAL_TAB = "apps";

/**
 * Stagger between tier cards, in ms. Matches `Work`'s `CARD_STAGGER` deliberately —
 * one reveal rhythm across the page, not a per-section dialect.
 *
 * ⚠️ **MIRRORED, not imported.** `Work` declares its own; these are two sections that
 * happen to agree rather than one shared decision, and a shared constant would imply a
 * coupling that does not exist. If they ever need to differ, they can.
 */
const CARD_STAGGER = 90;

export function Pricing({ eyebrow, heading, body, tabs, className }: PricingProps) {
  const [active, setActive] = useState(tabs[0]?.value ?? "");
  const tiers = tabs.find((t) => t.value === active)?.tiers ?? [];

  return (
    <section
      id="pricing"
      className={cn(
        "mx-gutter rounded-3xl bg-neutral-200 px-section-x py-section-y",
        className,
      )}
    >
      <div className="flex flex-col gap-6xl">
        <SectionHeader eyebrow={eyebrow} heading={heading} body={body} align="split" />

        <div className="flex flex-col gap-5xl">
          <SegmentedToggle
            options={tabs.map((t) => ({ value: t.value, label: t.label }))}
            value={active}
            onChange={setActive}
            label="Pricing category"
            className="self-center"
          />

          {/* ══ THE REVEAL ══════════════════════════════════════════════════════
              ⚠️ SAME EFFECT AS `Work`, and deliberately the same component rather than
              a second implementation — fade, 32px rise and blur-to-sharp, staggered one
              card at a time in reading order. See `Reveal`.

              ⚠️ **SUPPRESSED ON THE APPS TAB** — see `NO_REVEAL_TAB`. `Reveal` renders
              a wrapper `div` either way, so the grid's child count and placement are
              identical in both branches; only the animation is conditional. Returning
              the bare `TierCard` on that branch instead would change the grid item and
              risk the columns behaving differently between tabs.

              ⚠️ The `key` is on the OUTER element in both branches, and it is the tier
              name rather than the index — switching tabs swaps the card set entirely
              (three tiers to two), so an index key would re-use a mounted card for a
              different tier and skip the entrance. */}
          <div className={cn("grid items-start gap-xl", COLS[tiers.length] ?? "lg:grid-cols-3")}>
            {tiers.map((t, i) => {
              const card = (
                <TierCard
                  tier={t.tier}
                  name={t.name}
                  description={t.description}
                  price={t.price}
                  features={t.features}
                  cta={t.cta}
                  featured={t.featured}
                  badge={t.badge}
                />
              );
              return active === NO_REVEAL_TAB ? (
                <div key={t.name}>{card}</div>
              ) : (
                <Reveal key={t.name} delayMs={i * CARD_STAGGER}>
                  {card}
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
