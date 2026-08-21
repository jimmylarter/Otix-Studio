import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface ContactRowProps {
  icon: ReactNode;
  label: string;
  value: string;
  href?: string;
  className?: string;
}

/** Footer contact method — teal icon circle + small label + value. */
export function ContactRow({ icon, label, value, href, className }: ContactRowProps) {
  const inner = (
    <>
      <span className="grid size-13 shrink-0 place-items-center rounded-full bg-teal-tint text-primary-blue ring-1 ring-inset ring-teal-tint-strong transition-colors duration-base ease-standard group-hover:bg-primary-blue group-hover:text-surface-white">
        {icon}
      </span>
      <span className="flex flex-col items-start gap-xxs">
        <span className="font-mono text-eyebrow-sm uppercase text-surface-white/40">{label}</span>
        <span className="relative inline-block">
          <span className="text-title-strong text-surface-white transition-colors duration-base ease-standard group-hover:text-primary-blue">
            {value}
          </span>
          <span className="absolute -bottom-xs2 left-0 h-px w-full origin-left scale-x-0 bg-primary-blue transition-transform duration-base ease-standard group-hover:scale-x-100" />
        </span>
      </span>
    </>
  );

  const cls = cn(
    "group inline-flex items-center gap-base rounded-sm outline-none focus-visible:shadow-focus",
    className,
  );

  return href ? (
    <a href={href} className={cls}>
      {inner}
    </a>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

export default ContactRow;
