"use client";

import { QuoteMark } from "@/components/QuoteMark";
import { useRevealed } from "@/lib/useRevealed";
import { cn } from "@/lib/cn";

export interface QuoteProps {
  id?: string;
  quote: string;
}

/** Large Geist-Pixel quote with the pixel quote-mark, on the white page. */
export function Quote({ id, quote }: QuoteProps) {
  const { ref, has } = useRevealed();

  return (
    <section ref={ref} id={id} className="flex flex-col items-center px-section-x py-6xl">
      {/* block is centred on the page; the mark + quote stay left-aligned inside it */}
      <div data-reveal={0} className="max-w-quote">
        <div
          className={cn(
            "-mb-xl transition-all duration-cinematic ease-smooth",
            has(0) ? "translate-y-0 opacity-100 blur-0" : "translate-y-3 opacity-0 blur-sm",
          )}
        >
          <QuoteMark className="w-24 text-border-divider" />
        </div>
        <blockquote
          className={cn(
            "whitespace-normal pl-4xl font-pixel text-quote text-text-on-light transition-all duration-cinematic ease-smooth lg:whitespace-pre-line",
            has(0) ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
          )}
          style={{ transitionDelay: has(0) ? "150ms" : "0ms" }}
        >
          {quote}
        </blockquote>
      </div>
    </section>
  );
}

export default Quote;
