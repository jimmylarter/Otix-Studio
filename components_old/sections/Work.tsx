"use client";

import { useEffect, useRef, useState } from "react";
import { SectionHeader, type HeadingSegment } from "@/components/SectionHeader";
import { WorkCard, type WorkCardStat } from "@/components/WorkCard";
import { Cta } from "@/components/Cta";
import { cn } from "@/lib/cn";

interface WorkProject {
  image: string;
  tag: string;
  title: string;
  body: string;
  href?: string;
  stats?: WorkCardStat[];
}

export interface WorkProps {
  eyebrow: string;
  heading: string | HeadingSegment[];
  body: string;
  featured: WorkProject;
  tall: WorkProject;
  grid: WorkProject[];
  cta?: { label: string; href: string };
}

const CARD_BASE = 80; // ms before the first card in a row reveals
const CARD_STEP = 120; // ms between cards in a row

export function Work({ eyebrow, heading, body, featured, tall, grid, cta }: WorkProps) {
  const [headerShown, setHeaderShown] = useState(false);
  const [row1Shown, setRow1Shown] = useState(false);
  const [row2Shown, setRow2Shown] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);

  // Each block reveals only as it enters view (header, then each card row), so
  // nothing animates below the fold. Reduced-motion → everything immediate.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setHeaderShown(true);
      setRow1Shown(true);
      setRow2Shown(true);
      return;
    }
    const observe = (el: HTMLElement | null, cb: () => void) => {
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              cb();
              io.disconnect();
            }
          }
        },
        { rootMargin: "0px 0px -15% 0px" },
      );
      if (el) io.observe(el);
      return io;
    };
    const ios = [
      observe(headerRef.current, () => setHeaderShown(true)),
      observe(row1Ref.current, () => setRow1Shown(true)),
      observe(row2Ref.current, () => setRow2Shown(true)),
    ];
    return () => ios.forEach((io) => io.disconnect());
  }, []);

  // Card entrance: rise + settle from a slight scale, fading in — staggered.
  const cardCls = (shown: boolean, extra?: string) =>
    cn(
      "h-full transition-all duration-slowest ease-smooth",
      extra,
      shown ? "translate-y-0 scale-100 opacity-100" : "translate-y-8 scale-95 opacity-0",
    );
  const cardStyle = (shown: boolean, i: number) => ({
    transitionDelay: shown ? `${CARD_BASE + i * CARD_STEP}ms` : "0ms",
  });

  return (
    <section
      id="work"
      className="flex flex-col gap-block rounded-xl bg-surface-navy px-section-x py-section-y text-text-on-dark"
    >
      {/* header — fades up as one block when it enters view */}
      <div
        ref={headerRef}
        className={cn(
          "transition-all duration-cinematic ease-smooth",
          headerShown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        )}
      >
        <SectionHeader
          eyebrow={eyebrow}
          heading={heading}
          body={body}
          split
          tone="dark"
          action={cta && <Cta variant="arrow" tone="dark" label={cta.label} href={cta.href} />}
        />
      </div>

      <div className="flex flex-col gap-lg">
        {/* featured (2fr) + second (1fr) */}
        <div ref={row1Ref} className="grid gap-lg lg:grid-cols-3">
          <div className={cardCls(row1Shown, "lg:col-span-2")} style={cardStyle(row1Shown, 0)}>
            <WorkCard {...featured} tallImage />
          </div>
          <div className={cardCls(row1Shown)} style={cardStyle(row1Shown, 1)}>
            <WorkCard {...tall} tallImage />
          </div>
        </div>

        {/* 3-up */}
        <div ref={row2Ref} className="grid gap-lg sm:grid-cols-3">
          {grid.map((c, i) => (
            <div key={i} className={cardCls(row2Shown)} style={cardStyle(row2Shown, i)}>
              <WorkCard {...c} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Work;
