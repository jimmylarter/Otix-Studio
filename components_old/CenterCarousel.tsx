"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface CenterCarouselProps {
  children: ReactNode;
  /** auto-advance interval (ms) */
  interval?: number;
  className?: string;
}

/**
 * Infinite centre-mode carousel. The active card is centred + enlarged; the
 * neighbours peek and clip at the edges. Rendered as 3 clones of the set so
 * there are always cards on both sides — it loops seamlessly. Auto-rotates;
 * pauses only while the cursor is on a card (not in the gaps between them),
 * swipeable, click-to-select. Off under reduced-motion.
 */
export function CenterCarousel({ children, interval = 3500, className }: CenterCarouselProps) {
  const base = Children.toArray(children);
  const n = base.length;
  const loop = n > 1;
  const items = loop ? [...base, ...base, ...base] : base;

  const [active, setActive] = useState(loop ? n : 0); // start in the middle copy
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false); // true only while hovering a card
  const [reduce, setReduce] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  // centre the active item (and re-centre on resize)
  useEffect(() => {
    function place() {
      const container = containerRef.current;
      const track = trackRef.current;
      if (!container || !track) return;
      const item = track.children[active] as HTMLElement | undefined;
      if (!item) return;
      const target = container.clientWidth / 2 - (item.offsetLeft + item.offsetWidth / 2);
      track.style.transform = `translate3d(${target.toFixed(1)}px, 0, 0)`;
    }
    place();
    window.addEventListener("resize", place, { passive: true });
    return () => window.removeEventListener("resize", place);
  }, [active, animate, items.length]);

  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduce || paused || !loop) return;
    const id = setInterval(() => setActive((a) => a + 1), interval);
    return () => clearInterval(id);
  }, [reduce, paused, loop, interval]);

  // re-enable transition on the frame after a seamless reset
  useEffect(() => {
    if (animate) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    return () => cancelAnimationFrame(id);
  }, [animate]);

  // when the slide crosses into an outer clone, jump back to the middle copy
  function handleTrackTransitionEnd(e: React.TransitionEvent) {
    if (e.target !== trackRef.current || e.propertyName !== "transform" || !loop) return;
    if (active >= 2 * n) {
      setAnimate(false);
      setActive(active - n);
    } else if (active < n) {
      setAnimate(false);
      setActive(active + n);
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full overflow-hidden py-16", className)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) setActive((a) => (dx < 0 ? a + 1 : a - 1));
        touchX.current = null;
      }}
    >
      <div
        ref={trackRef}
        onTransitionEnd={handleTrackTransitionEnd}
        className={cn(
          "flex items-center gap-40 will-change-transform",
          animate && "transition-transform duration-slowest ease-smooth",
        )}
      >
        {items.map((child, i) => (
          <button
            type="button"
            key={i}
            onClick={() => setActive(i)}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            aria-current={i === active}
            className={cn(
              "aspect-portrait shrink-0 basis-3/5 transition-all duration-slowest ease-smooth sm:basis-2/5 lg:basis-1/4",
              i === active ? "z-10 scale-110 opacity-100" : "scale-90 opacity-70",
            )}
          >
            {child}
          </button>
        ))}
      </div>

      {/* edge fades — cards dissolve into the navy hero bg on the left + right */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-1/3 bg-gradient-to-r from-primary-navy to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-1/3 bg-gradient-to-l from-primary-navy to-transparent" />
    </div>
  );
}

export default CenterCarousel;
