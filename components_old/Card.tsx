import { Eyebrow } from "@/components/Eyebrow";
import { ParallaxImage } from "@/components/ParallaxImage";
import { cn } from "@/lib/cn";

export interface CardStat {
  value: string;
  label: string;
}

export interface CardProps {
  image: string;
  tag: string;
  title: string;
  /** the line under the title (short subtitle or a longer description) */
  body?: string;
  /** optional metric row — shows a divider then the stats */
  stats?: CardStat[];
  /** Banner variant — image fills, content sits in a horizontal row */
  fullBleed?: boolean;
  href?: string;
  className?: string;
}

// Copy reveal: each item rises from the bottom + fades in on hover. The
// `card-copy` hook lets globals.css show everything on touch (no-hover) devices.
const revealItem =
  "card-copy translate-y-4 opacity-0 transition-all duration-slow ease-out-expo group-hover:translate-y-0 group-hover:opacity-100";

/**
 * Project / case-study card. One component, many variants:
 * carousel · grid · with-stats · full-bleed (= Banner). Fills its parent —
 * the section controls width/height; the Card never assumes a fixed size.
 *
 * Standard cards show the **image only** at rest; on hover a scrim fades in and
 * the copy rises from the bottom. The Banner variant keeps its copy always on.
 */
export function Card({
  image,
  tag,
  title,
  body,
  stats,
  fullBleed = false,
  href,
  className,
}: CardProps) {
  const interactive = !!href;
  const Comp = interactive ? "a" : "article";

  return (
    <Comp
      {...(interactive ? { href } : {})}
      data-cursor="no-glow"
      className={cn(
        "group relative block h-full w-full transform-gpu overflow-hidden outline-none",
        fullBleed ? "rounded-xl" : "rounded-bl-xl rounded-tr-xl",
        !fullBleed && "transition-shadow duration-base ease-standard hover:shadow-glow",
        interactive && "focus-visible:shadow-focus",
        className,
      )}
    >
      {fullBleed ? (
        // Banner — image drifts on scroll (parallax); no hover zoom
        <ParallaxImage src={image} />
      ) : (
        <img
          src={image}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-slow ease-standard group-hover:scale-105"
        />
      )}

      {fullBleed ? (
        <>
          {/* Banner: scrim + copy always visible */}
          <div className="pointer-events-none absolute inset-0 bg-scrim-frame" />
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-sm p-card">
            <Eyebrow label={tag} variant="solid" />
            <span className="text-title-strong text-surface-white">{title}</span>
            {body && <span className="text-body-sm text-surface-white/80">{body}</span>}
          </div>
        </>
      ) : (
        <>
          {/* Standard card: scrim fades in, copy rises from the bottom on hover */}
          <div className="card-scrim pointer-events-none absolute inset-0 bg-scrim-frame opacity-0 transition-opacity duration-slow ease-standard group-hover:opacity-100" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-xs p-card">
            <div className={revealItem}>
              <Eyebrow label={tag} variant="solid" />
            </div>
            <span className={cn(revealItem, "text-title-strong text-surface-white delay-75")}>{title}</span>
            {body && <span className={cn(revealItem, "text-body-sm text-surface-white/80 delay-100")}>{body}</span>}
            {stats && stats.length > 0 && (
              <div className={cn(revealItem, "flex w-full flex-col gap-xs delay-150")}>
                <span className="h-px w-full bg-glass-divider" />
                <div className="flex flex-wrap gap-lg">
                  {stats.map((s, i) => (
                    <div key={i} className="flex flex-col">
                      <span className="text-stat text-text-on-dark">{s.value}</span>
                      <span className="text-body-xs text-surface-white/80">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </Comp>
  );
}

export default Card;
