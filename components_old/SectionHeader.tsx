import type { ReactNode } from "react";
import { Eyebrow } from "@/components/Eyebrow";
import { cn } from "@/lib/cn";

export type HeadingSegment = string | { highlight: string };
export type SectionTone = "light" | "dark" | "gradient";

export interface SectionHeaderProps {
  eyebrow?: string;
  /** plain string, or segments where { highlight } renders the teal mono box */
  heading: string | HeadingSegment[];
  body?: string | string[];
  align?: "left" | "center";
  /** heading on the left, body on the right */
  split?: boolean;
  tone?: SectionTone;
  level?: "h2" | "h3";
  /** optional element rendered under the body (e.g. a CTA), left-aligned, gap-xl below */
  action?: ReactNode;
  className?: string;
}

/** Teal mono highlight inside a heading (e.g. "growth engines"). Inline, wraps cleanly. */
export function HeadingHighlight({ children }: { children: ReactNode }) {
  return (
    <span className="heading-highlight mt-sm inline-block rounded-md bg-teal-tint px-md font-mono tracking-normal text-primary-blue ring-1 ring-inset ring-teal-tint-strong hover:animate-pill-pulse">
      {children}
    </span>
  );
}

const headingColor: Record<SectionTone, string> = {
  light: "text-text-on-light",
  dark: "text-text-on-dark",
  gradient: "text-text-on-dark",
};
const bodyColor: Record<SectionTone, string> = {
  light: "text-text-muted-light",
  dark: "text-text-on-dark",
  gradient: "text-text-on-dark",
};

function renderHeading(heading: string | HeadingSegment[]): ReactNode {
  if (typeof heading === "string") return heading;
  return heading.map((seg, i) =>
    typeof seg === "string" ? <span key={i}>{seg}</span> : <HeadingHighlight key={i}>{seg.highlight}</HeadingHighlight>,
  );
}

/** Eyebrow + heading (+ optional body). Pure presentation; content via props. */
export function SectionHeader({
  eyebrow,
  heading,
  body,
  align = "left",
  split = false,
  tone = "light",
  level = "h2",
  action,
  className,
}: SectionHeaderProps) {
  const HeadingTag = level;
  const headingEl = (
    <HeadingTag className={cn(level === "h3" ? "text-h3" : "text-h2", "font-sans", headingColor[tone])}>
      {renderHeading(heading)}
    </HeadingTag>
  );
  const bodyParas = body === undefined ? [] : Array.isArray(body) ? body : [body];
  const bodyEl =
    bodyParas.length > 0 ? (
      // split sub-copy uses the wider 75ch cap so it reaches the padding on
      // normal/large screens; long-form (left/centered) keeps the 68ch cap.
      <div className={cn("flex flex-col gap-md", split ? "max-w-measure-wide" : "max-w-measure")}>
        {bodyParas.map((p, i) => (
          <p key={i} className={cn("text-body-lg", bodyColor[tone])}>
            {p}
          </p>
        ))}
      </div>
    ) : null;
  const eyebrowEl = eyebrow ? <Eyebrow label={eyebrow} variant={tone === "gradient" ? "glass" : "tint"} /> : null;

  if (split) {
    // eyebrow spans the top; heading + body sit in a 50/50 grid so the body's
    // left edge lands exactly on the halfway line (aligns with a full-bleed
    // image's left edge above). Heading gets right padding instead of a column
    // gap so the body isn't nudged off centre. Stacks on mobile.
    return (
      <div className={cn("flex flex-col gap-sm", className)}>
        {eyebrowEl}
        <div className="grid grid-cols-1 gap-y-xl lg:grid-cols-2">
          <div className="min-w-0 lg:pr-block">{headingEl}</div>
          {(bodyEl || action) && (
            <div className="flex min-w-0 flex-col items-start gap-2xl">
              {bodyEl}
              {/* push the action to the bottom so its base lines up with the heading's bottom (split only) */}
              {action && <div className="mt-auto">{action}</div>}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-xl", align === "center" ? "items-center text-center" : "items-start", className)}>
      <div className={cn("flex flex-col gap-sm", align === "center" && "items-center text-center")}>
        {eyebrowEl}
        {headingEl}
      </div>
      {bodyEl}
      {action}
    </div>
  );
}

export default SectionHeader;
