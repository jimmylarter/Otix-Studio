import { cn } from "@/lib/cn";

export interface StepCardProps {
  number: string;
  title: string;
  body: string;
  className?: string;
}

/** Numbered process step. Teal-tint card; number + divider top, title + body bottom. */
export function StepCard({ number, title, body, className }: StepCardProps) {
  return (
    <article
      className={cn(
        "flex h-full flex-col justify-between rounded-bl-xl rounded-tr-xl border border-teal-tint-strong bg-teal-tint p-2xl",
        className,
      )}
    >
      <div className="flex flex-col gap-md">
        <span className="text-h4-strong text-primary-blue">{number}</span>
        <span className="h-px w-full bg-teal-tint-strong" />
      </div>
      <div className="flex flex-col gap-base">
        <h3 className="text-h6 text-text-on-light">{title}</h3>
        <p className="text-body text-text-muted-light">{body}</p>
      </div>
    </article>
  );
}

export default StepCard;
