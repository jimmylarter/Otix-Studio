import { cn } from "@/lib/cn";

export type EyebrowVariant = "tint" | "solid" | "glass";
export type EyebrowSize = "default" | "sm";

export interface EyebrowProps {
  label: string;
  /** tint = teal glass on light · solid = solid teal on imagery · glass = white glass on gradient */
  variant?: EyebrowVariant;
  size?: EyebrowSize;
  className?: string;
}

const variantCls: Record<EyebrowVariant, string> = {
  tint: "bg-teal-tint ring-1 ring-inset ring-teal-tint-strong text-primary-blue",
  solid: "bg-primary-blue text-surface-white",
  glass: "bg-glass-fill ring-1 ring-inset ring-glass-border text-surface-white",
};

const sizeCls: Record<EyebrowSize, string> = {
  default: "text-eyebrow",
  sm: "text-eyebrow-sm",
};

/** Small uppercase label in a rounded badge (Geist Mono). Pure presentation. */
export function Eyebrow({ label, variant = "tint", size = "default", className }: EyebrowProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-lg px-sm py-xs2 font-mono uppercase",
        variantCls[variant],
        sizeCls[size],
        className,
      )}
    >
      {label}
    </span>
  );
}

export default Eyebrow;
