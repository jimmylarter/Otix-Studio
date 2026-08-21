"use client";

import { cn } from "@/lib/cn";

/**
 * SegmentedToggle — switches the Pricing tier set.
 * Figma: `Link` 339×50 → two `Background` tabs.
 *
 * Track: `overlay-green-10` with a `border-green` hairline, radius full, padding 4.
 * Active tab: green-800 fill, white label, radius full, 24px horizontal padding.
 * Inactive: no fill, ink-900 label.
 *
 * Built as a real **tablist**, not two buttons: it swaps visible panels, so screen
 * readers need the relationship, and arrow keys must move between tabs
 * (COMPONENTS.md). Roving tabindex — only the selected tab is in the tab order.
 */

export interface SegmentedOption {
  value: string;
  label: string;
}

export interface SegmentedToggleProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  /** Accessible name for the group, e.g. "Pricing category". */
  label: string;
  className?: string;
}

export function SegmentedToggle({ options, value, onChange, label, className }: SegmentedToggleProps) {
  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const i = options.findIndex((o) => o.value === value);
    if (i < 0) return;
    let next = i;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % options.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + options.length) % options.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = options.length - 1;
    else return;
    e.preventDefault();
    onChange(options[next].value);
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn(
        "inline-flex w-fit items-center gap-0 rounded-full border border-border-green bg-overlay-green-10 p-xs",
        className,
      )}
    >
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            type="button"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(o.value)}
            className={cn(
              "min-h-tap rounded-full px-xl text-label uppercase",
              "transition-colors duration-base ease-smooth",
              "focus-visible:shadow-focus focus-visible:outline-none",
              selected ? "bg-green-800 text-neutral-0" : "bg-transparent text-ink-900 hover:text-green-600",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
