"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export interface SegmentedOption {
  value: string;
  label: string;
}

export interface SegmentedToggleProps {
  options: SegmentedOption[];
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
}

/** Pill segmented switch (e.g. Websites / Apps & Dashboards). White = active. */
export function SegmentedToggle({ options, defaultValue, onChange, className }: SegmentedToggleProps) {
  const [active, setActive] = useState(defaultValue ?? options[0]?.value);

  function select(v: string) {
    setActive(v);
    onChange?.(v);
  }

  return (
    <div
      role="tablist"
      className={cn("inline-flex rounded-full bg-glass-fill p-xs2 ring-1 ring-inset ring-glass-border", className)}
    >
      {options.map((o) => {
        const isActive = o.value === active;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => select(o.value)}
            className={cn(
              "rounded-full px-lg py-sm font-mono text-cta uppercase outline-none transition-colors duration-base ease-standard focus-visible:shadow-focus",
              isActive ? "bg-surface-white text-primary-blue" : "text-surface-white",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedToggle;
