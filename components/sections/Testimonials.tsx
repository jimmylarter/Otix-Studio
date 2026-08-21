import { cn } from "@/lib/cn";
import { SectionHeader, type HeadingSegment } from "@/components/SectionHeader";
import { TestimonialCard } from "@/components/TestimonialCard";
import { Carousel } from "@/components/Carousel";

/**
 * Testimonials — a centred header with a staggered card row. Figma:
 * `TESTIMONIALS` (36:1403).
 *
 * ⚠️ FLUSH (CLAUDE.md §0.1): no surface, `x=0, w=1440`, content at 60.
 *
 * ── A looping carousel, not the design's arch ────────────────────────────────
 * ⚠️ The frame is a static four-up with the inner two staggered down 100 and the
 * row rising 48px INTO the centred header. Replaced (12 Aug, Jimmy's call) with a
 * six-card `Carousel` that loops endlessly in both directions.
 *
 * The stagger and the overlap went together, and had to: the overlap only ever
 * worked because the OUTER pair were the ones rising past the centred heading,
 * clearing it between them. Level the row and the middle cards run through the
 * type — and in a strip that scrolls, "inner" and "outer" stop existing at all.
 *
 * ── Why the fixed height applies at every width now ──────────────────────────
 * It used to be `xl`-only, because below that the four-up cards were too narrow to
 * hold a long quote in 296px. A carousel changes that: card width comes from
 * `basis`, not from dividing the row, so a card on a phone is 80% of the viewport
 * — wider than a four-up card at `xl`. Cards side by side always need level
 * bottoms, and now they are side by side at every size.
 *
 * ⚠️ The strip bleeds past the section padding (`-mx-section-x-flush` with
 * matching padding back on) so cards run off both edges while the first still
 * starts on the optical line. Clipped to the section instead, it reads as a box
 * rather than as something continuing off-screen — which is the cue that tells
 * people it can be swiped.
 *
 * ⚠️ The v1 horizontal scroll strip is gone — `Carousel` is cut from v2. If a
 * phone should swipe these rather than stack them, that is a decision to make
 * before launch (RESPONSIVE_SPEC.md §5.8).
 */

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatar: string;
}

export interface TestimonialsProps {
  eyebrow: string;
  heading: HeadingSegment[];
  items: Testimonial[];
  className?: string;
}

/** Six in the loop. The content list holds seven; the last is spare. */
const SHOWN = 6;

export function Testimonials({ eyebrow, heading, items, className }: TestimonialsProps) {
  const shown = items.slice(0, SHOWN);

  return (
    <section
      id="testimonials"
      // Asymmetric on purpose. `pb-testimonials-foot` is a FIXED 150 where the
      // fluid `section-y-flush` only reaches 120 at 1440 and gives less below it.
      //
      // ⚠️ It was originally sized as the distance the footer travelled as it slid
      // over this section. That overlay was removed 13 Aug and the 150 stayed —
      // Jimmy set it explicitly as the section's bottom padding before the overlay
      // existed, and it still reads correctly as the gap before the footer. It is
      // now a plain spacing decision, not a mechanic, so it is safe to tune.
      className={cn(
        "w-full px-section-x-flush pb-testimonials-foot pt-section-y-flush",
        className,
      )}
    >
      {/* `6xl` (60) sits between `5xl` (48, too tight for a centred heading) and
          `block` (→80, which read as two separate blocks). */}
      <div className="flex flex-col gap-6xl">
        <SectionHeader eyebrow={eyebrow} heading={heading} align="center" />

        {/* `-mx-section-x-flush` + matching padding lets the strip bleed to the
            viewport edges while its first card still starts on the optical line.
            Without it the cards stop dead at the section padding and the strip
            reads as a box rather than as something continuing off-screen. */}
        <Carousel
          loop
          // `card-*` rather than plain fractions — they subtract each item's share
          // of the gaps, so the last card in view lands on the optical line
          // instead of a gap's width past it. Mobile keeps `4/5`: there the
          // overhang IS the design, showing the next card is swipeable.
          itemClassName="basis-4/5 sm:basis-card-2 lg:basis-card-3 xl:basis-card-4"
          // `scroll-pl` matters as much as `pl`: without it a snapped card aligns
          // to the scroller's edge rather than the optical line, so the strip
          // starts correctly and then jumps 60px left on the first snap.
          className="-mx-section-x-flush scroll-pl-section-x-flush px-section-x-flush"
        >
          {shown.map((t) => (
            <TestimonialCard
              key={t.name}
              quote={t.quote}
              name={t.name}
              role={t.role}
              avatar={t.avatar}
              // Fixed height at EVERY width now, not just in the old arch: cards
              // side by side in a strip need level bottoms, and a carousel keeps
              // them side by side on a phone too.
              className="h-testimonial"
            />
          ))}
        </Carousel>
      </div>
    </section>
  );
}
