import { Eyebrow } from "@/components/Eyebrow";
import { cn } from "@/lib/cn";

export interface WorkCardStat {
  value: string;
  label: string;
}

export type WorkCardTone = "teal" | "navy";

export interface WorkCardProps {
  image: string;
  tag: string;
  title: string;
  body: string;
  /** optional metric row — divider then 1+ stats */
  stats?: WorkCardStat[];
  /** taller image band (+50px) — used by the top-row cards */
  tallImage?: boolean;
  /** hover wash — `teal` (→ gradient-blue; Work) or `navy` (→ navy; WhyOtix). At-rest fill is always teal-tint. */
  tone?: WorkCardTone;
  href?: string;
  className?: string;
}

/** hover wash colour per tone — the at-rest fill (teal-tint) is shared */
const hoverWash: Record<WorkCardTone, string> = {
  teal: "bg-gradient-blue",
  navy: "bg-surface-navy",
};

/**
 * Work project card — teal-glass panel (teal-tint fill) with a rounded image
 * band (tag pill bottom-left), title, body and an optional stats row. On hover
 * the image grows in its band, the panel fills with the wash, and a teal glow
 * lifts behind it. `tone` swaps only the hover wash.
 */
export function WorkCard({ image, tag, title, body, stats, tallImage = false, tone = "teal", href, className }: WorkCardProps) {
  const interactive = !!href;
  const Comp = interactive ? "a" : "article";

  return (
    <Comp
      {...(interactive ? { href } : {})}
      data-cursor="no-glow"
      className={cn(
        "group relative flex h-full flex-col gap-xl rounded-bl-xl rounded-tr-xl border border-teal-tint-strong bg-teal-tint text-text-on-dark outline-none transition-shadow duration-base ease-standard hover:shadow-glow",
        interactive && "focus-visible:shadow-focus",
        className,
      )}
    >
      {/* hover wash — fades in on hover */}
      <div className={cn("pointer-events-none absolute inset-0 rounded-bl-xl rounded-tr-xl opacity-0 transition-opacity duration-base ease-standard group-hover:opacity-100", hoverWash[tone])} />

      {/* image band — 16px frame (top/left/right); image grows on hover */}
      <div className="relative z-10 px-base pt-base">
        <div className={cn("relative w-full overflow-hidden rounded-bl-xl rounded-tr-xl", tallImage ? "h-media-lg" : "h-media")}>
          <img
            src={image}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-slow ease-standard group-hover:scale-110"
          />
          <div className="absolute bottom-md left-md">
            <Eyebrow label={tag} variant="solid" />
          </div>
        </div>
      </div>

      {/* content — 32px from left/right/bottom */}
      <div className="relative z-10 flex flex-col gap-sm px-2xl pb-2xl">
        <div className="flex flex-col gap-xs">
          <h3 className="text-title-strong text-surface-white">{title}</h3>
          <p className="text-body-sm text-surface-white/80">{body}</p>
        </div>

        {stats && stats.length > 0 && (
          <>
            <span className="h-px w-full bg-teal-tint-strong" />
            <div className="flex flex-wrap gap-lg">
              {stats.map((s, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-stat text-text-on-dark">{s.value}</span>
                  <span className="text-body-xs text-surface-white/80">{s.label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Comp>
  );
}

export default WorkCard;
