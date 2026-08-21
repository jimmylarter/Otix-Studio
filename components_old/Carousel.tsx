"use client";

import { Children, type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export interface CarouselProps {
  children: ReactNode;
  /** width classes for each item, e.g. "basis-4/5 sm:basis-1/2 lg:basis-1/3" */
  itemClassName?: string;
  /**
   * `center` (default) — on large screens it stops snapping and centres the
   * items in a row (few items, e.g. the hero's 3 cards).
   * `start` — stays a scrollable, snapping strip at every breakpoint (many
   * items that overflow, e.g. testimonials).
   */
  align?: "center" | "start";
  /**
   * Auto-advance one card every N ms (ping-pongs at the ends, so no rewind).
   * Pauses while dragging; disabled under reduced-motion.
   */
  autoAdvanceMs?: number;
  className?: string;
}

/**
 * Horizontal carousel (CSS scroll-snap). Wheel/trackpad/touch scroll natively;
 * mouse & pen can also click-drag to pull. Snapping pauses mid-drag and
 * re-snaps on release. One-and-a-peek on mobile. No auto-advance.
 */
export function Carousel({ children, itemClassName, align = "center", autoAdvanceMs, className }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startScroll: 0 });
  const [dragging, setDragging] = useState(false);

  // Auto-advance: tick one card at a time on a constant loop. Starts at the far
  // end and ticks left (new cards slide in from the left); on reaching the start
  // it wraps back to the end and keeps going the same way (no direction change).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !autoAdvanceMs) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.scrollLeft = el.scrollWidth - el.clientWidth; // begin at the far end
    const id = window.setInterval(() => {
      if (drag.current.active) return; // paused mid-pull
      const first = el.firstElementChild as HTMLElement | null;
      if (!first) return;
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
      const step = first.offsetWidth + gap;
      const max = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft <= 1) el.scrollTo({ left: max, behavior: "auto" }); // wrap to end
      else el.scrollTo({ left: el.scrollLeft - step, behavior: "smooth" }); // tick left
    }, autoAdvanceMs);
    return () => window.clearInterval(id);
  }, [autoAdvanceMs]);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    // Touch already scrolls natively; only mouse/pen need drag-to-scroll.
    if (e.pointerType === "touch") return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const el = scrollRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft };
    el.setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = scrollRef.current;
    if (!drag.current.active || !el) return;
    const dx = e.clientX - drag.current.startX;
    if (!dragging && Math.abs(dx) > 4) setDragging(true); // ignore tiny jitters
    el.scrollLeft = drag.current.startScroll - dx;
  }

  function endDrag() {
    drag.current.active = false;
    setDragging(false); // re-enables snap → settles on the nearest card
  }

  return (
    <div
      ref={scrollRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDragStart={(e) => e.preventDefault()}
      className={cn(
        "no-scrollbar flex select-none gap-lg overflow-x-auto",
        dragging ? "cursor-grabbing snap-none" : "cursor-grab snap-x snap-mandatory",
        align === "center" && "lg:snap-none lg:justify-center lg:overflow-visible",
        className,
      )}
    >
      {Children.map(children, (child) => (
        <div className={cn("shrink-0 snap-start", itemClassName)}>{child}</div>
      ))}
    </div>
  );
}

export default Carousel;
