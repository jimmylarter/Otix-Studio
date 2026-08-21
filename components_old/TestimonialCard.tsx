import { QuoteMark } from "@/components/QuoteMark";
import { cn } from "@/lib/cn";

export interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  avatar: string;
  className?: string;
}

/** Testimonial card. Quote mark + quote, then avatar + name + role. */
export function TestimonialCard({ quote, name, role, avatar, className }: TestimonialCardProps) {
  return (
    <article
      className={cn(
        "flex h-full flex-col justify-between gap-xl rounded-bl-xl rounded-tr-xl border border-border-card-light bg-surface-white p-4xl",
        className,
      )}
    >
      <div className="flex flex-col items-start gap-sm text-left">
        <QuoteMark className="h-3xl w-auto text-primary-blue opacity-20" />
        <p className="text-body-lg text-text-muted-light">{quote}</p>
      </div>
      <div className="flex items-center gap-base">
        <img src={avatar} alt="" className="h-avatar w-avatar shrink-0 rounded-full object-cover" />
        <div className="flex flex-col gap-xxs">
          <span className="text-body-sm-strong text-primary-blue">{name}</span>
          <span className="font-mono text-eyebrow-sm uppercase text-text-on-light/40">{role}</span>
        </div>
      </div>
    </article>
  );
}

export default TestimonialCard;
