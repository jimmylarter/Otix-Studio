"use client";

import { useEffect, useRef, useState } from "react";
import { Eyebrow } from "@/components/Eyebrow";

export interface BannerProps {
  id?: string;
  image: string;
  tag: string;
  title: string;
  body: string;
  href?: string;
}

const EXPAND_VH = 100; // wrapper ≈ one viewport, so once full-screen it keeps scrolling (no hold/pause)
const REST_INSET = 45; // % bottom inset at rest — image is top-anchored and ~55% tall, grows down to full
const GROW_START = 0.85; // grow starts when the banner top is this far down the viewport (fraction), completes at the top

/** The image + scrim + tag/title/body overlay (shared by both states). */
function BannerInner({ image, tag, title, body }: Omit<BannerProps, "id" | "href">) {
  return (
    <>
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="pointer-events-none absolute inset-0 bg-scrim-frame" />
      <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-sm p-card">
        <Eyebrow label={tag} variant="solid" />
        <span className="text-title-strong text-surface-white">{title}</span>
        {body && <span className="text-body-sm text-surface-white/80">{body}</span>}
      </div>
    </>
  );
}

/**
 * Banner that starts at the Services grey-container width, then pins and grows
 * on scroll to fill the viewport within the page gutter. Reduced-motion / no-JS
 * falls back to a static full-width banner.
 */
export function Banner({ id, image, tag, title, body }: BannerProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [enhanced, setEnhanced] = useState(false);
  const [p, setP] = useState(0);
  const [sectionX, setSectionX] = useState(0);

  useEffect(() => {
    setEnhanced(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // measure the fluid section-x padding in px (drives the horizontal inset)
  useEffect(() => {
    function measure() {
      if (measureRef.current) setSectionX(parseFloat(getComputedStyle(measureRef.current).paddingLeft) || 0);
    }
    measure();
    window.addEventListener("resize", measure, { passive: true });
    return () => window.removeEventListener("resize", measure);
  }, [enhanced]);

  // scroll progress through the pinned range (0 = inset, 1 = full)
  useEffect(() => {
    if (!enhanced) return;
    let ticking = false;
    function update() {
      const el = wrapRef.current;
      if (el) {
        // progress by the banner top's approach to the viewport top: grows as it
        // rises, completing (p=1) as its top reaches the top — then pins/holds.
        const rect = el.getBoundingClientRect();
        const start = window.innerHeight * GROW_START;
        setP(start > 0 ? Math.min(1, Math.max(0, (start - rect.top) / start)) : 0);
      }
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
  }, [enhanced]);

  // static fallback (reduced-motion / pre-hydration)
  if (!enhanced) {
    return (
      <div id={id} className="relative aspect-banner w-full overflow-hidden rounded-xl">
        <BannerInner image={image} tag={tag} title={title} body={body} />
      </div>
    );
  }

  const inv = 1 - p;
  return (
    <div id={id} ref={wrapRef} className="relative" style={{ height: `${EXPAND_VH}vh` }}>
      {/* invisible probe to read the current section-x padding */}
      <div ref={measureRef} aria-hidden className="pointer-events-none absolute h-0 w-0 pl-section-x" />
      <div
        className="sticky overflow-hidden"
        style={{ top: "var(--space-gutter)", height: "calc(100vh - 2 * var(--space-gutter))" }}
      >
        <div
          className="absolute overflow-hidden rounded-xl transform-gpu"
          style={{
            left: `${sectionX * inv}px`,
            right: `${sectionX * inv}px`,
            top: 0,
            bottom: `${REST_INSET * inv}%`,
          }}
        >
          <BannerInner image={image} tag={tag} title={title} body={body} />
        </div>
      </div>
    </div>
  );
}

export default Banner;
