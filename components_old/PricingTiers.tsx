"use client";

import { useState } from "react";
import { SegmentedToggle } from "@/components/SegmentedToggle";
import { TierCard, type TierCardProps } from "@/components/TierCard";
import { cn } from "@/lib/cn";

export interface PricingTab {
  value: string;
  label: string;
  tiers: TierCardProps[];
}

export interface PricingTiersProps {
  tabs: PricingTab[];
  className?: string;
}

/**
 * The toggle + tier grid — sub-piece of the Pricing section.
 * A segmented toggle swaps the tier set beneath it; the grid adapts to however
 * many tiers a tab has (3 for Websites, 2 for Apps). Content-free.
 */
export function PricingTiers({ tabs, className }: PricingTiersProps) {
  const [active, setActive] = useState(tabs[0]?.value);
  const current = tabs.find((t) => t.value === active) ?? tabs[0];

  return (
    <div className={cn("flex flex-col items-center gap-3xl", className)}>
      <SegmentedToggle
        options={tabs.map((t) => ({ value: t.value, label: t.label }))}
        defaultValue={tabs[0]?.value}
        onChange={setActive}
      />
      <div className={cn("grid w-full gap-lg", current.tiers.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
        {current.tiers.map((tier, i) => (
          <TierCard key={`${active}-${i}`} {...tier} />
        ))}
      </div>
    </div>
  );
}

export default PricingTiers;
