"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * ParallaxImage — a background image that drifts vertically as it scrolls through
 * the viewport. Carried over from v1 UNCHANGED in behaviour (CLAUDE.md §3:
 * design-agnostic logic only). Used by the `banner` Card variant.
 *
 * ── Why it is scaled 150% ─────────────────────────────────────────────────────
 * Parallax means the image moves relative to its frame, so there has to be image
 * OUTSIDE the frame to move into — otherwise the drift drags an empty edge into
 * view. The scale provides that overflow, and the parent must be `overflow-hidden`
 * to hide it.
 *
 * ⚠️ The scale is re-applied inside the inline `transform` on every frame. It has
 * to be: an inline transform overrides the class entirely, so writing only the
 * translate would silently drop the scale and the image would snap to 100% the
 * moment the first scroll event fired — taking the overflow with it.
 *
 * ── The drift is clamped ──────────────────────────────────────────────────────
 * Progress runs -1 (below the viewport) → 0 (centred) → 1 (above), clamped, and
 * the maximum travel is 16% of the frame's height — comfortably inside the 25%
 * of overflow the scale provides on each side. Those two numbers are a pair: raise
 * the drift past the overflow and the image's edge appears.
 *
 * Disabled entirely under `prefers-reduced-motion` — a scroll-linked transform is
 * exactly what that setting is asking us not to do.
 */
export function ParallaxImage({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const image = ref.current;
    const container = image?.parentElement;
    if (!image || !container) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;
    function update() {
      const rect = container!.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
      const clamped = Math.max(-1, Math.min(1, progress));
      const max = rect.height * 0.16;
      image!.style.transform = `translate3d(0, ${(-clamped * max).toFixed(1)}px, 0) scale(1.5)`;
      ticking = false;
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <img
      ref={ref}
      src={src}
      alt=""
      className={cn("absolute inset-0 size-full scale-150 object-cover will-change-transform", className)}
    />
  );
}
