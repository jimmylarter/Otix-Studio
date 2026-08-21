"use client";

import { SectionHeader, type HeadingSegment } from "@/components/SectionHeader";
import { AccordionItem } from "@/components/AccordionItem";
import { useRevealed } from "@/lib/useRevealed";
import { cn } from "@/lib/cn";

interface Faq {
  question: string;
  answer: string;
}

export interface FaqsProps {
  eyebrow: string;
  heading: string | HeadingSegment[];
  body: string;
  items: Faq[];
}

/** FAQs — left header (eyebrow + heading + body), right accordion list (node 1:695). */
export function Faqs({ eyebrow, heading, body, items }: FaqsProps) {
  const { ref, has } = useRevealed();
  const rise = (shown: boolean) =>
    cn("transition-all duration-cinematic ease-smooth", shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0");

  return (
    <section
      ref={ref}
      id="faqs"
      className="flex flex-wrap items-start gap-block rounded-xl bg-surface-white px-section-x py-section-y text-text-on-light lg:flex-nowrap lg:gap-col"
    >
      {/* left flexes to fill; the question container keeps a fixed width, the gap is the fluid part (matches Footer) */}
      <div data-reveal={0} className={cn("basis-full lg:flex-1", rise(has(0)))}>
        <SectionHeader eyebrow={eyebrow} heading={heading} body={body} />
      </div>
      <div data-reveal={1} className={cn("flex basis-full flex-col gap-2xl lg:basis-1/2", rise(has(1)))}>
        {items.map((f, i) => (
          <AccordionItem key={i} question={f.question} answer={f.answer} />
        ))}
      </div>
    </section>
  );
}

export default Faqs;
