"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Branded cursor: a teal dot that tracks precisely, a ring that follows with a
 * smooth lag, and a teal halo that only appears over dark (`data-cursor="dark"`)
 * sections. Enabled only on a fine pointer with motion allowed — otherwise the
 * native cursor is left untouched (see the `cursor: none` rule in globals.css).
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [dark, setDark] = useState(false); // over a navy section → glow on
  const [over, setOver] = useState(false); // over an interactive element → ring grows
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (fine && !reduce) setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: target.x, y: target.y };
    let raf = 0;
    let curDark = false;
    let curOver = false;

    const place = (el: HTMLDivElement | null, x: number, y: number) => {
      if (el) el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    };

    function onMove(e: MouseEvent) {
      target.x = e.clientX;
      target.y = e.clientY;
      place(dotRef.current, e.clientX, e.clientY);
      place(glowRef.current, e.clientX, e.clientY);
      const el = document.elementFromPoint(e.clientX, e.clientY);
      // glow only over dark sections — but not over imagery/cards inside them
      const nextDark = !!el?.closest('[data-cursor="dark"]') && !el?.closest('img, [data-cursor="no-glow"]');
      const nextOver = !!el?.closest('a, button, [role="button"], input, textarea, select, label, summary');
      if (nextDark !== curDark) {
        curDark = nextDark;
        setDark(nextDark);
      }
      if (nextOver !== curOver) {
        curOver = nextOver;
        setOver(nextOver);
      }
    }

    function loop() {
      ring.x += (target.x - ring.x) * 0.2; // lag → smooth trailing ring
      ring.y += (target.y - ring.y) * 0.2;
      place(ringRef.current, ring.x, ring.y);
      raf = requestAnimationFrame(loop);
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    loop();
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-cursor overflow-hidden">
      {/* halo — only over dark sections (subtle + wide) */}
      <div
        ref={glowRef}
        style={{ width: 600, height: 600 }}
        className={cn(
          "absolute left-0 top-0 rounded-full bg-cursor-glow transition-opacity duration-slow ease-standard",
          dark ? "opacity-100" : "opacity-0",
        )}
      />
      {/* trailing ring — white/opacity at rest, teal + grows over interactive */}
      <div ref={ringRef} className="absolute left-0 top-0">
        <div
          className={cn(
            "h-8 w-8 rounded-full border transition-all duration-base ease-out-expo",
            over ? "scale-150 border-primary-blue" : "scale-100 border-primary-blue/40",
          )}
        />
      </div>
      {/* precise dot — teal at rest, white over interactive elements */}
      <div
        ref={dotRef}
        className={cn(
          "absolute left-0 top-0 h-2 w-2 rounded-full transition-colors duration-base ease-standard",
          over ? "bg-surface-white" : "bg-primary-blue",
        )}
      />
    </div>
  );
}

export default CustomCursor;
