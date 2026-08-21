"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * Background image with a vertical parallax drift as it scrolls through the
 * viewport. The image is scaled up 110% so there's overflow to move within
 * (the parent must be `overflow-hidden`). Disabled under reduced-motion.
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
      // -1 (below viewport) → 0 (centred) → 1 (above viewport), clamped so the
      // drift never exceeds the image's overflow room (no edge reveal)
      const progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
      const clamped = Math.max(-1, Math.min(1, progress));
      const max = rect.height * 0.16; // max drift ≈ 16% of banner height
      // scale (1.5 → 25% overflow each side) must be in the applied transform,
      // since inline style overrides the class; keeps the 16% drift covered
      image!.style.transform = `translate3d(0, ${(-clamped * max).toFixed(1)}px, 0) scale(1.5)`;
      ticking = false;
    }
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
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
      className={cn("absolute inset-0 h-full w-full scale-150 object-cover will-change-transform", className)}
    />
  );
}

export default ParallaxImage;
