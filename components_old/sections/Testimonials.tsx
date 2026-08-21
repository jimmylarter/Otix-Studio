"use client";

import { SectionHeader, type HeadingSegment } from "@/components/SectionHeader";
import { TestimonialCard, type TestimonialCardProps } from "@/components/TestimonialCard";
import { Carousel } from "@/components/Carousel";
import { useRevealed } from "@/lib/useRevealed";
import { cn } from "@/lib/cn";

export interface TestimonialsProps {
  eyebrow: string;
  heading: string | HeadingSegment[];
  items: TestimonialCardProps[];
}

/** Testimonials — centered header + a horizontally-scrollable strip of cards (node 1:653). */
export function Testimonials({ eyebrow, heading, items }: TestimonialsProps) {
  const { ref, has } = useRevealed();
  const rise = (shown: boolean) =>
    cn("w-full transition-all duration-cinematic ease-smooth", shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0");

  return (
    <section
      ref={ref}
      id="testimonials"
      className="flex flex-col gap-block overflow-hidden rounded-xl bg-surface-light py-section-y text-text-on-light"
    >
      {/* header keeps the section gutter */}
      <div data-reveal={0} className={cn("px-section-x", rise(has(0)))}>
        <SectionHeader eyebrow={eyebrow} heading={heading} align="center" className="w-full" />
      </div>
      {/* strip is full-bleed: first card aligns with the content (pl-section-x),
          the rest run off to the container edge and are clipped by it */}
      <div data-reveal={1} className={rise(has(1))}>
        {/* scroll-pl keeps the gutter visible at rest (snap would otherwise eat it);
            cards are one pricing-grid column wide (w-testimonial), 1-up peek on mobile */}
        <Carousel align="start" autoAdvanceMs={4000} itemClassName="w-4/5 sm:w-testimonial" className="pl-section-x scroll-pl-section-x">
          {items.map((t, i) => (
            <TestimonialCard key={i} {...t} />
          ))}
        </Carousel>
      </div>
    </section>
  );
}

export default Testimonials;
