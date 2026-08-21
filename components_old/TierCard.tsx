import { Eyebrow } from "@/components/Eyebrow";
import { Cta } from "@/components/Cta";
import { cn } from "@/lib/cn";

export interface TierCardProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  price: string;
  /** included features (teal check) */
  features: string[];
  /** not-included features (grey minus) — shown after the included ones */
  excluded?: string[];
  ctaLabel?: string;
  ctaHref?: string;
  popular?: boolean;
  className?: string;
}

function Check() {
  return (
    <svg viewBox="0 0 14 14" fill="none" aria-hidden="true" className="size-3">
      <path d="M3 7.5l2.5 2.5L11 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Minus() {
  return (
    <svg viewBox="0 0 14 14" fill="none" aria-hidden="true" className="size-3">
      <path d="M3.5 7h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function FeatureItem({ label, included = true }: { label: string; included?: boolean }) {
  return (
    <li className={cn("flex items-center gap-sm text-body-sm", included ? "text-surface-white/80" : "text-surface-white/40")}>
      <span
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-sm",
          included ? "bg-teal-tint-soft text-primary-blue" : "bg-glass-hairline text-surface-white/40",
        )}
      >
        {included ? <Check /> : <Minus />}
      </span>
      {label}
    </li>
  );
}

/** Pricing tier. Dark card: eyebrow, title, price, features, CTA. `popular` adds the top tag + highlight. */
export function TierCard({
  eyebrow,
  title,
  subtitle,
  price,
  features,
  excluded,
  ctaLabel = "Get Started",
  ctaHref,
  popular = false,
  className,
}: TierCardProps) {
  return (
    <article
      className={cn(
        "group relative flex h-full cursor-pointer flex-col gap-base rounded-xl border bg-surface-navy px-2xl pb-2xl pt-3xl transition duration-base ease-standard hover:shadow-card",
        popular ? "border-primary-blue" : "border-glass-divider hover:border-primary-blue",
        className,
      )}
    >
      {popular && (
        // bespoke tab — anchored flush to the top edge, rounded bottom corners only
        <span className="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap rounded-b-lg bg-primary-blue px-md py-xs font-mono text-eyebrow-sm uppercase text-surface-white">
          Most Popular
        </span>
      )}

      <div className="flex flex-col gap-sm">
        <Eyebrow label={eyebrow} variant="tint" />
        <h3 className="text-h5 text-surface-white">{title}</h3>
        <p className="text-body-sm text-surface-white/70">{subtitle}</p>
        <div className="flex gap-xxs">
          <span className="self-start text-title-strong text-primary-blue">$</span>
          <span className="text-h2 leading-none text-surface-white">{price}</span>
          <span className="self-end text-title-strong text-surface-white/40">+</span>
        </div>
      </div>

      <span className="h-px w-full bg-glass-hairline" />

      <ul className="flex flex-1 flex-col gap-sm pb-sm pt-xs">
        {features.map((f, i) => (
          <FeatureItem key={`f-${i}`} label={f} />
        ))}
        {excluded?.map((f, i) => (
          <FeatureItem key={`x-${i}`} label={f} included={false} />
        ))}
      </ul>

      <Cta label={ctaLabel} href={ctaHref} tone={popular ? "dark" : "gradient"} fullWidth />
    </article>
  );
}

export default TierCard;
