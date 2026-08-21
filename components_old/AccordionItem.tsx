"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export interface AccordionItemProps {
  question: string;
  answer: string;
  defaultOpen?: boolean;
  className?: string;
}

function PlusMinus({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-icon w-icon text-surface-white">
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {!open && <path d="M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
    </svg>
  );
}

/** FAQ item — question + toggle, with a smooth open/close reveal (grid-rows). */
export function AccordionItem({ question, answer, defaultOpen = false, className }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={cn("border-t border-border-divider pt-2xl", className)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start justify-between gap-lg rounded-sm text-left outline-none focus-visible:shadow-focus"
      >
        <span className="text-title-strong text-text-on-light">{question}</span>
        <span
          className={cn(
            "grid h-cta w-cta shrink-0 place-items-center rounded-full transition-colors duration-base ease-standard",
            open ? "bg-primary-navy" : "bg-primary-blue",
          )}
        >
          <PlusMinus open={open} />
        </span>
      </button>
      <div
        className="grid transition-all duration-base ease-standard"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="max-w-measure pt-base text-body text-text-muted-light">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export default AccordionItem;
