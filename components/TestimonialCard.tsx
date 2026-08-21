import { cn } from "@/lib/cn";

/**
 * TestimonialCard — Figma: `Card 01`…`Card 5` in Testimonials.
 *
 * Surface: neutral-200 with a 1px neutral-300 hairline, radius 30, padding 28.
 * This is the only card in the system that is NOT white — it sits on the warm page
 * and needs to separate from it without a shadow.
 *
 * The quote mark is the ORIGINAL v1 artwork (`Supplied Files/quote-mark.svg`) — a
 * dot-matrix glyph, inlined with `currentColor` so the colour is tokenised.
 *
 * Two things in the source file are v1 leftovers and are deliberately NOT carried:
 *   - `fill="#10A4B0"` (v1 teal) -> `currentColor`, set to green-300
 *   - `opacity="0.2"`  -> removed. v1 faded it back; the v2 design has it at FULL
 *     opacity (verified: node opacity 1, fill opacity 1 on all 4 cards).
 *
 * Copy is written fresh, not taken from Figma (CLAUDE.md §2).
 */

export interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  avatar: string;
  className?: string;
}

function QuoteMark() {
  return (
    <svg
      viewBox="0 0 92 69"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="h-auto w-quote-mark text-green-300"
    >
        <path d="M28.5 11.4C25.2 11.4 22.8 9.00001 22.8 5.70002C22.8 2.4 25.2 0 28.5 0C31.8 0 34.2 2.4 34.2 5.70002C34.2 9.00001 31.8 11.4 28.5 11.4ZM85.5 11.4C82.2 11.4 79.8 9.00001 79.8 5.70002C79.8 2.4 82.2 0 85.5 0C88.8 0 91.2 2.4 91.2 5.70002C91.2 9.00001 88.8 11.4 85.5 11.4ZM74.1 22.8C70.8 22.8 68.4 20.4 68.4 17.1C68.4 13.8 70.8 11.4 74.1 11.4C77.4 11.4 79.8 13.8 79.8 17.1C79.8 20.4 77.4 22.8 74.1 22.8ZM17.1 22.8C13.8 22.8 11.4 20.4 11.4 17.1C11.4 13.8 13.8 11.4 17.1 11.4C20.4 11.4 22.8 13.8 22.8 17.1C22.8 20.4 20.4 22.8 17.1 22.8ZM62.7 34.2C59.4 34.2 57 31.8 57 28.5C57 25.2 59.4 22.8 62.7 22.8C66 22.8 68.4 25.2 68.4 28.5C68.4 31.8 66 34.2 62.7 34.2ZM5.70001 34.2C2.40001 34.2 0 31.8 0 28.5C0 25.2 2.40001 22.8 5.70001 22.8C9.00001 22.8 11.4 25.2 11.4 28.5C11.4 31.8 9.00001 34.2 5.70001 34.2ZM17.1 34.2C13.8 34.2 11.4 31.8 11.4 28.5C11.4 25.2 13.8 22.8 17.1 22.8C20.4 22.8 22.8 25.2 22.8 28.5C22.8 31.8 20.4 34.2 17.1 34.2ZM74.1 34.2C70.8 34.2 68.4 31.8 68.4 28.5C68.4 25.2 70.8 22.8 74.1 22.8C77.4 22.8 79.8 25.2 79.8 28.5C79.8 31.8 77.4 34.2 74.1 34.2ZM62.7 45.6C59.4 45.6 57 43.2 57 39.9C57 36.6 59.4 34.2 62.7 34.2C66 34.2 68.4 36.6 68.4 39.9C68.4 43.2 66 45.6 62.7 45.6ZM17.1 45.6C13.8 45.6 11.4 43.2 11.4 39.9C11.4 36.6 13.8 34.2 17.1 34.2C20.4 34.2 22.8 36.6 22.8 39.9C22.8 43.2 20.4 45.6 17.1 45.6ZM74.1 45.6C70.8 45.6 68.4 43.2 68.4 39.9C68.4 36.6 70.8 34.2 74.1 34.2C77.4 34.2 79.8 36.6 79.8 39.9C79.8 43.2 77.4 45.6 74.1 45.6ZM5.70001 45.6C2.40001 45.6 0 43.2 0 39.9C0 36.6 2.40001 34.2 5.70001 34.2C9.00001 34.2 11.4 36.6 11.4 39.9C11.4 43.2 9.00001 45.6 5.70001 45.6ZM5.70001 57C2.40001 57 0 54.6 0 51.3C0 48 2.40001 45.6 5.70001 45.6C9.00001 45.6 11.4 48 11.4 51.3C11.4 54.6 9.00001 57 5.70001 57ZM62.7 57C59.4 57 57 54.6 57 51.3C57 48 59.4 45.6 62.7 45.6C66 45.6 68.4 48 68.4 51.3C68.4 54.6 66 57 62.7 57ZM28.5 57C25.2 57 22.8 54.6 22.8 51.3C22.8 48 25.2 45.6 28.5 45.6C31.8 45.6 34.2 48 34.2 51.3C34.2 54.6 31.8 57 28.5 57ZM74.1 57C70.8 57 68.4 54.6 68.4 51.3C68.4 48 70.8 45.6 74.1 45.6C77.4 45.6 79.8 48 79.8 51.3C79.8 54.6 77.4 57 74.1 57ZM17.1 57C13.8 57 11.4 54.6 11.4 51.3C11.4 48 13.8 45.6 17.1 45.6C20.4 45.6 22.8 48 22.8 51.3C22.8 54.6 20.4 57 17.1 57ZM85.5 57C82.2 57 79.8 54.6 79.8 51.3C79.8 48 82.2 45.6 85.5 45.6C88.8 45.6 91.2 48 91.2 51.3C91.2 54.6 88.8 57 85.5 57ZM85.5 68.4C82.2 68.4 79.8 66 79.8 62.7C79.8 59.4 82.2 57 85.5 57C88.8 57 91.2 59.4 91.2 62.7C91.2 66 88.8 68.4 85.5 68.4ZM5.70001 68.4C2.40001 68.4 0 66 0 62.7C0 59.4 2.40001 57 5.70001 57C9.00001 57 11.4 59.4 11.4 62.7C11.4 66 9.00001 68.4 5.70001 68.4ZM74.1 68.4C70.8 68.4 68.4 66 68.4 62.7C68.4 59.4 70.8 57 74.1 57C77.4 57 79.8 59.4 79.8 62.7C79.8 66 77.4 68.4 74.1 68.4ZM28.5 68.4C25.2 68.4 22.8 66 22.8 62.7C22.8 59.4 25.2 57 28.5 57C31.8 57 34.2 59.4 34.2 62.7C34.2 66 31.8 68.4 28.5 68.4ZM62.7 68.4C59.4 68.4 57 66 57 62.7C57 59.4 59.4 57 62.7 57C66 57 68.4 59.4 68.4 62.7C68.4 66 66 68.4 62.7 68.4ZM17.1 68.4C13.8 68.4 11.4 66 11.4 62.7C11.4 59.4 13.8 57 17.1 57C20.4 57 22.8 59.4 22.8 62.7C22.8 66 20.4 68.4 17.1 68.4Z" fill="currentColor"/>
    </svg>
  );
}

export function TestimonialCard({ quote, name, role, avatar, className }: TestimonialCardProps) {
  return (
    <figure
      className={cn(
        "flex flex-col justify-between gap-2xl rounded-3xl border border-neutral-300 bg-neutral-200 p-2xl",
        className,
      )}
    >
      {/* `gap-lg` (20) rather than `md` (12): the quote mark is a loose dot-matrix
          glyph with visual air of its own, so it needs a touch more clearance than
          a solid element would to read as separated from the quote. */}
      <div className="flex flex-col gap-lg">
        <QuoteMark />
        <blockquote className="text-body-lg text-ink-900">{quote}</blockquote>
      </div>

      <figcaption className="flex items-center gap-base">
        {/* TODO(D9): next/image. */}
        <img
          src={avatar}
          alt=""
          className="h-avatar w-avatar shrink-0 rounded-full object-cover"
        />
        <span className="flex flex-col gap-xxs">
          <span className="text-body-strong text-green-600">{name}</span>
          {/* `body-sm`, not the mono eyebrow it was: the role is a person's job
              title, not a label — mono uppercase read as system furniture beside
              their name. */}
          <span className="text-body-sm text-ink-600">{role}</span>
        </span>
      </figcaption>
    </figure>
  );
}
