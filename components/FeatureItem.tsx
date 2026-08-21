import { cn } from "@/lib/cn";

/**
 * FeatureItem — one row in a pricing tier's feature list.
 * Figma: `Item` → `Image+Overlay` (18×18 green-300 circle) + label, gap 12.
 *
 * TWO states, both on the same green-300 circle — only the glyph and the label
 * opacity change:
 *   included (26 rows) — tick glyph  (Figma vector 10×8), label at full opacity
 *   excluded  (4 rows) — minus glyph (Figma vector 10×2), label at 40%
 *
 * e.g. "CMS (content management)" and "E-commerce capability" are excluded on the
 * entry tier. The circle is NOT dimmed — only the text.
 */

export interface FeatureItemProps {
  label: string;
  /** Defaults to included. `false` renders the minus glyph and dims the label. */
  included?: boolean;
  className?: string;
}

export function FeatureItem({ label, included = true, className }: FeatureItemProps) {
  return (
    <li className={cn("flex items-start gap-md", className)}>
      {/* `h-/w-` not `size-`: icon sizes live in width/height, not the `size` scale,
          so `size-icon-sm` would silently generate nothing. */}
      <span className="mt-xs flex h-icon-sm w-icon-sm shrink-0 items-center justify-center rounded-full bg-green-300">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-icon-sm w-icon-sm">
          <path
            d={included ? "M6 12.5l4 4 8-8" : "M7 12h10"}
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-green-950"
          />
        </svg>
      </span>
      <span className={cn("text-list-item text-green-100", !included && "opacity-40")}>{label}</span>
    </li>
  );
}
