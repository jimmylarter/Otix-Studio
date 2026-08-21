"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Reveals `[data-reveal]` descendants once each as they scroll into view.
 * Returns a `ref` for the container and `has(i)` to check whether the block
 * with `data-reveal={i}` has entered. Reduced-motion → all revealed immediately.
 */
export function useRevealed(rootMargin = "0px 0px -15% 0px") {
  const ref = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  useEffect(() => {
    const els = ref.current?.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!els || els.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRevealed(new Set(Array.from(els, (el) => Number(el.dataset.reveal))));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        const add: number[] = [];
        for (const e of entries) {
          if (e.isIntersecting) {
            add.push(Number((e.target as HTMLElement).dataset.reveal));
            io.unobserve(e.target);
          }
        }
        if (add.length) setRevealed((prev) => new Set([...prev, ...add]));
      },
      { rootMargin },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rootMargin]);

  return { ref, has: (i: number) => revealed.has(i) };
}
