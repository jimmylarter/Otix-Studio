"use client";

import { useEffect, useRef, useState } from "react";
import { SectionHeader, type HeadingSegment } from "@/components/SectionHeader";
import { FeatureCard } from "@/components/FeatureCard";
import { cn } from "@/lib/cn";

interface ServiceRow {
  title: string;
  body: string[];
  image: string;
}

interface ServiceFeature {
  title: string;
  body: string;
  image: string;
}

export interface ServicesProps {
  eyebrow: string;
  heading: string | HeadingSegment[];
  body: string;
  rows: ServiceRow[];
  features: ServiceFeature[];
}

/** Service row — title / body / image in thirds. `divider` adds the top hairline. */
function DividerRow({ title, body, image, divider }: ServiceRow & { divider?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2xl lg:grid lg:grid-cols-3 lg:items-start lg:gap-lg",
        divider && "border-t border-border-divider-soft pt-3xl",
      )}
    >
      <h3 className="max-w-title text-h4 text-text-on-light">{title}</h3>
      <div className="flex flex-col gap-md lg:pr-2xl">
        {body.map((p, i) => (
          <p key={i} className="text-body text-text-muted-light">
            {p}
          </p>
        ))}
      </div>
      <img
        src={image}
        alt=""
        loading="lazy"
        className="h-media w-full rounded-bl-xl rounded-tr-xl object-cover"
      />
    </div>
  );
}

export function Services({ eyebrow, heading, body, rows, features }: ServicesProps) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const sectionRef = useRef<HTMLElement>(null);

  // Each [data-reveal] block reveals only as it enters view (so nothing
  // animates below the fold). Reduced-motion → everything shown immediately.
  useEffect(() => {
    const els = sectionRef.current?.querySelectorAll<HTMLElement>("[data-reveal]");
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
      { rootMargin: "0px 0px -15% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const has = (i: number) => revealed.has(i);
  const rise = (shown: boolean) =>
    cn("transition-all duration-cinematic ease-smooth", shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0");

  const featuresIdx = 1 + rows.length;

  return (
    <section
      ref={sectionRef}
      id="services"
      className="flex flex-col items-center gap-block rounded-xl bg-surface-white px-section-x pt-section-y pb-4xl text-text-on-light"
    >
      {/* header */}
      <div data-reveal={0} className={cn("w-full", rise(has(0)))}>
        <SectionHeader eyebrow={eyebrow} heading={heading} body={body} split tone="light" className="w-full" />
      </div>

      {/* rows + features live in a light-grey rounded card */}
      <div className="flex w-full flex-col gap-5xl rounded-xl bg-surface-light p-section-x">
        {rows.map((row, i) => (
          <div key={i} data-reveal={1 + i} className={rise(has(1 + i))}>
            <DividerRow {...row} divider={i > 0} />
          </div>
        ))}

        {/* feature cards cascade in when the grid enters view */}
        <div data-reveal={featuresIdx} className="border-t border-border-divider-soft pt-3xl">
          <div className="grid gap-lg sm:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={i}
                className={cn(
                  "transition-all duration-slowest ease-smooth",
                  has(featuresIdx) ? "translate-y-0 scale-100 opacity-100" : "translate-y-8 scale-95 opacity-0",
                )}
                style={{ transitionDelay: has(featuresIdx) ? `${80 + i * 120}ms` : "0ms" }}
              >
                <FeatureCard image={f.image} title={f.title} body={f.body} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Services;
