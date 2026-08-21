import { cn } from "@/lib/cn";

/**
 * OptionCard — one selectable answer in the quiz. NOT in Figma: the WhyOtix panel
 * (36:268) is drawn empty, so this is designed to the system rather than exported
 * from it. Flagged in COMPONENTS.md as an INTRODUCED component.
 *
 * ── Why it is a radio and not a button ────────────────────────────────────────
 * `role="radio"` inside the step's `role="radiogroup"`. The distinction is not
 * pedantry: a screen reader announces "2 of 4, selected" for a radio and just
 * "button" for a button, which is the entire orientation a non-sighted user gets
 * on a screen whose only content is four choices.
 *
 * Roving tabindex — only the selected option (or the first, before anything is
 * chosen) is tabbable, so Tab moves PAST the group rather than through every
 * option. Arrow keys move within it. That is the platform behaviour for radios and
 * the parent `Quiz` owns the key handling.
 *
 * ── The surface ───────────────────────────────────────────────────────────────
 * The panel behind these is `neutral-0`, so the rows CANNOT be white — they would
 * have no edge at all. `neutral-100` at rest with an `border-input` hairline is the
 * quietest thing that still reads as a control.
 *
 * Selected goes to `green-50` + a `green-400` edge + `shadow-glass`. Deliberately
 * NOT a saturated green fill: the row still has to carry `ink-900` text at AA, and
 * six of these stacked in brand green would fight the CTA for attention.
 *
 * ⚠️ The four state properties move on ONE transition (`transition-option`). Split
 * across separate transitions the border lands before the fill and a single select
 * reads as two events.
 *
 * `active:scale-press` is the tactile feedback the brief asks for — 0.985, which is
 * felt rather than seen. It is a `transform`, so `prefers-reduced-motion` in
 * globals.css already removes it; the colour change survives, which is the correct
 * split (CLAUDE.md §5).
 */

export interface OptionCardProps {
  label: string;
  description?: string;
  selected: boolean;
  /** Roving tabindex — the parent decides which single option is reachable by Tab. */
  tabbable: boolean;
  onSelect: () => void;
  className?: string;
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-icon-sm w-icon-sm">
      <path
        d="M5 12.5l4.5 4.5L19 7.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function OptionCard({
  label,
  description,
  selected,
  tabbable,
  onSelect,
  className,
}: OptionCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      tabIndex={tabbable ? 0 : -1}
      onClick={onSelect}
      className={cn(
        "group flex min-h-option w-full items-center gap-base rounded-lg border px-xl py-base text-left",
        "transition-option duration-base ease-smooth",
        "focus-visible:shadow-focus focus-visible:outline-none",
        "active:scale-press",
        selected
          ? "border-green-400 bg-green-50 shadow-glass"
          : "border-border-input bg-neutral-100 hover:border-green-400 hover:bg-neutral-200",
        className,
      )}
    >
      <span className="flex min-w-0 flex-1 flex-col gap-xxs">
        <span className="text-body-lg-strong text-ink-900">{label}</span>
        {description ? (
          <span className="text-body-sm text-ink-600">{description}</span>
        ) : null}
      </span>

      {/* The dot. `shrink-0` because a long option label must not squash it into an
          ellipse — it is the only thing on the row carrying the selected state. */}
      <span
        aria-hidden="true"
        className={cn(
          "flex h-radio w-radio shrink-0 items-center justify-center rounded-full border",
          "transition-option duration-base ease-smooth",
          selected
            ? "border-green-600 bg-green-600 text-neutral-0"
            : "border-border-input bg-neutral-0 text-transparent group-hover:border-green-400",
        )}
      >
        <Check />
      </span>
    </button>
  );
}
