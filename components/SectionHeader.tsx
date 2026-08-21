import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Eyebrow } from "@/components/Eyebrow";

/**
 * SectionHeader — eyebrow + heading + optional body + optional action.
 * Figma: the same pattern under six names — `Section Title`, `Section Heading`,
 * `Header`, `Intro Frame`, `Testimonial Header`, `Subheading`.
 *
 * The heading is a SEGMENT ARRAY, not a string: accent words render in Adelle
 * italic so the CMS can express the accent without HTML (CLAUDE.md §2).
 *
 *   heading={[{ text: "We don't just build websites. We build " }, { text: "growth engines.", accent: true }]}
 *
 * ── Spacing (measured from Figma, not uniform) ────────────────────────────────
 * eyebrow → heading = `md` (12).  heading → body = `2xl` (28).
 * e.g. About: 29 + 12 + 218 = 259, then 259 + 28 + 135 = 422.
 *
 * ── split ─────────────────────────────────────────────────────────────────────
 * Heading left, body + action right. The right column aligns to the TOP OF THE
 * HEADING, not the top of the eyebrow — so it is a 2-row grid with the eyebrow
 * alone in row 1. Doing it that way means the offset is derived from the eyebrow's
 * real rendered height rather than a hard-coded margin that would drift.
 */

export type HeadingSegment = { text: string; accent?: boolean };
export type SectionHeaderAlign = "left" | "center" | "split";
export type SectionHeaderTone = "light" | "dark";

export interface SectionHeaderProps {
  eyebrow?: string;
  heading: HeadingSegment[];
  body?: string;
  /**
   * Extra classes for the BODY paragraph only.
   *
   * ⚠️ Narrow on purpose — it exists so a section can cap its own measure without
   * every caller being handed a slot to restyle the header through. The Footer
   * uses it for `lg:w-4/5`. If a second use turns up that is not about width,
   * that is the signal this should have been a real prop instead.
   */
  bodyClassName?: string;
  /** Usually a <Cta />. In `split` it sits under the body in the right column. */
  action?: ReactNode;
  align?: SectionHeaderAlign;
  /** `light` = on the warm page. `dark` = on a dark surface. */
  tone?: SectionHeaderTone;
  /** Render as h1 (the Hero) instead of the default h2. One h1 per page. */
  as?: "h1" | "h2";
  /**
   * Puts an id on the heading element. For dialogs, which name themselves by
   * pointing `aria-labelledby` at their own heading rather than repeating it in
   * an `aria-label` that can drift out of sync with the visible text.
   */
  headingId?: string;
  className?: string;
}

/**
 * A trailing full stop is peeled off the accent word and set in MANROPE, not Adelle.
 *
 * Adelle's period is a circle; Manrope's is a rounded square, which is the shape
 * every other full stop on the page already has. Left in the serif it was the one
 * round dot in the design and it read as a smudge at the end of the line rather
 * than as punctuation.
 *
 * ⚠️ It stays INSIDE the <em> rather than becoming its own sibling. That keeps it on
 * the accent's size and letter-spacing, and — the reason that matters — it cannot
 * be wrapped onto a line of its own, which a sibling span could be.
 *
 * ⚠️ This is a PRESENTATION decision and belongs here, not in `content.ts`. The
 * alternative was splitting the stop into its own non-accent segment in content,
 * which would put a typographic choice into the CMS payload (CLAUDE.md §2).
 *
 * The trailing-whitespace group matters: several headings carry an authored "\n"
 * after the stop for `whitespace-pre-line`, and swallowing it would silently
 * collapse the line break.
 */
const TRAILING_STOP = /^([\s\S]*?)(\.+)(\s*)$/;

const HEADING_TONE: Record<SectionHeaderTone, string> = {
  light: "text-ink-900",
  dark: "text-ink-50",
};
const ACCENT_TONE: Record<SectionHeaderTone, string> = {
  light: "text-green-600",
  dark: "text-green-300",
};
const BODY_TONE: Record<SectionHeaderTone, string> = {
  light: "text-ink-600",
  dark: "text-green-100",
};

export function SectionHeader({
  eyebrow,
  heading,
  body,
  bodyClassName,
  action,
  align = "left",
  tone = "light",
  as = "h2",
  headingId,
  className,
}: SectionHeaderProps) {
  const Heading = as;
  const isH1 = as === "h1";

  const headingEl = (
    /* `whitespace-pre-line` so a segment can carry an authored line break. About's
       "Design. / Build. / Dominate." needs one word per line and no wrap would
       ever produce that. Headings without a newline are unaffected. */
    <Heading
      id={headingId}
      className={cn("whitespace-pre-line", isH1 ? "text-h1" : "text-h2", HEADING_TONE[tone])}
    >
      {heading.map((seg, i) => {
        if (!seg.accent) return <span key={i}>{seg.text}</span>;

        const [, word = seg.text, stop = "", tail = ""] = seg.text.match(TRAILING_STOP) ?? [];

        return (
          <em
            key={i}
            className={cn(
              // ⚠️ Adelle Regular Italic. The WEIGHT rides on the accent size
              // token below (`h1-accent`/`h2-accent` are 400), not on a class here
              // — so a heading using a different size token inherits that token's
              // weight and can land on a different Adelle face. See `Nav`'s menu
              // numerals, which state the weight for exactly that reason.
              "font-serif italic",
              isH1 ? "text-h1-accent" : "text-h2-accent",
              ACCENT_TONE[tone],
            )}
          >
            {word}
            {/* `not-italic` as well as `font-sans`: a slanted period is a slightly
                displaced dot rather than a legible italic form. See TRAILING_STOP. */}
            {stop ? <span className="font-sans not-italic">{stop}</span> : null}
            {tail}
          </em>
        );
      })}
    </Heading>
  );

  const bodyEl = body ? (
    <p className={cn("max-w-measure text-body-lg", BODY_TONE[tone], bodyClassName)}>{body}</p>
  ) : null;

  const eyebrowEl = eyebrow ? <Eyebrow label={eyebrow} variant={tone} /> : null;

  if (align === "split") {
    return (
      <div
        className={cn(
          "flex flex-col gap-md",
          // Row 1 holds only the eyebrow; row 2 holds heading | body+action, so the
          // right column starts level with the heading.
          "lg:grid lg:grid-cols-2 lg:gap-x-col lg:gap-y-md",
          className,
        )}
      >
        {eyebrowEl ? <div className="lg:col-start-1 lg:row-start-1">{eyebrowEl}</div> : null}
        <div className={cn("lg:col-start-1", eyebrowEl ? "lg:row-start-2" : "lg:row-start-1")}>
          {headingEl}
        </div>
        <div
          className={cn(
            "flex flex-col items-start gap-xl lg:col-start-2",
            eyebrowEl ? "lg:row-start-2" : "lg:row-start-1",
          )}
        >
          {bodyEl}
          {action}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-md",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrowEl}
      {headingEl}
      {bodyEl ? <div className="mt-base">{bodyEl}</div> : null}
      {action ? <div className="mt-base">{action}</div> : null}
    </div>
  );
}
