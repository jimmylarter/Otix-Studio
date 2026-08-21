"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Input — the footer form field. Figma: `Input` (×6).
 *
 * Surface: neutral-0, radius 6, `border-input` hairline, `shadow-sunken`.
 * Height 50, padding 16 left / 32 right. Placeholder is ink-400.
 *
 * TYPE IS 16px (`text-body`), NOT the 18px in Figma. Two reasons: form fields
 * should sit a step below body copy rather than matching it, and 16px is the hard
 * floor — iOS Safari auto-zooms on focus for anything smaller.
 * ⚠️ Figma still says 18. Update the input text style there to keep the pack honest.
 *
 * Four types. `select` is a CUSTOM listbox, not a native <select>: the design has
 * a styled green chevron and the same sunken treatment, which a native control
 * cannot be made to render consistently across browsers.
 *
 * The `error` state is INTRODUCED — it is not in the Figma design, but a form
 * without one is not shippable. Flagged in COMPONENTS.md.
 *
 * Labels are visually hidden by default: the design shows placeholder-only fields.
 * The label still exists for screen readers — placeholders are not accessible names.
 */

export type InputType = "text" | "email" | "textarea" | "select";

/**
 * Which ground the field is sitting on.
 *
 * ⚠️ `dark` is the one PRODUCTION uses — `ContactPanel` is the only consumer and
 * it only ever renders on the footer's gradient (and in the contact popup, which
 * is the same panel). `light` survives for `/dev/components`, and for whenever a
 * form lands on the warm page.
 */
export type InputTone = "light" | "dark";

export interface SelectOption {
  value: string;
  label: string;
}

export interface InputProps {
  type?: InputType;
  name: string;
  /** Always required — visually hidden unless `showLabel`. */
  label: string;
  placeholder?: string;
  options?: SelectOption[];
  required?: boolean;
  error?: string;
  /**
   * ⚠️ Defaults to TRUE since 13 Aug. It used to default to false, with the
   * placeholder carrying the only visible description of the field — which fails
   * WCAG 3.3.2 the moment someone types, because the placeholder disappears and
   * takes the label with it. A visible label is the fix, not a nicety.
   */
  showLabel?: boolean;
  tone?: InputTone;
  className?: string;
}

const FIELD_BASE = [
  /**
   * ⚠️ `border-solid` is NOT redundant. The `select` renders as a `<button>` — it
   * is a custom listbox, not a native `<select>` — and `globals.css` resets
   * `button { border: 0 }`, which sets `border-style: none`. Tailwind's `border`
   * only sets border-WIDTH, so the select was drawing 1px of nothing: two fields
   * with a crisp edge and two with none at all. Stating the style restores it.
   * (Found 13 Aug — it is also why the 40% stroke looked heavier than it was: the
   * edged fields had nothing consistent to sit beside.)
   */
  "w-full rounded-sm border border-solid text-body",
  "transition-shadow duration-base ease-smooth",
  "focus:outline-none focus-visible:shadow-focus",
].join(" ");

/**
 * ⚠️ `dark` does NOT carry its own `backdrop-filter`, and that is deliberate. It
 * sits inside the panel's frost, and a blur inside a blur composites against the
 * already-blurred parent — which reads as mud rather than glass, and is a
 * long-standing Safari trouble spot. Six of them recompositing on every keystroke
 * is not free either.
 *
 * `shadow-glass-field` does the work instead: a 1px white top highlight over a
 * soft recess. The HIGHLIGHT is what reads as glass; the blur never was.
 *
 * ⚠️ It also replaces `shadow-sunken` here, which is an inset BLACK shadow built
 * for white inputs — over a translucent dark field it only adds murk.
 *
 * ── The dark placeholder ─────────────────────────────────────────────────────
 * ⚠️ `green-100` at 70% is the FLOOR, not a taste call. Measured on this ground:
 *   85% → 6.04:1 · 75% → 5.11 · 70% → 4.68 · 65% → 4.28 (fails) · 60% → 3.90.
 * 1.4.3 wants 4.5 and a placeholder is text, so anything under 70 is a real
 * failure rather than a soft one.
 *
 * There was room to scale it back here — unlike the field's BORDER, which had no
 * headroom at all — precisely because the visible label now carries the field's
 * meaning. A placeholder is an EXAMPLE of what to type, not a description of what
 * the field is, so it can afford to sit back. If the labels are ever hidden again,
 * this has to go back up.
 */
const FIELD_TONE: Record<InputTone, string> = {
  light: "border-border-input bg-neutral-0 text-ink-900 shadow-sunken placeholder:text-ink-400",
  dark: "border-border-glass-field bg-overlay-glass-field text-ink-50 shadow-glass-field placeholder:text-green-100/70",
};

const LABEL_TONE: Record<InputTone, string> = {
  light: "text-ink-600",
  dark: "text-ink-50",
};

/**
 * ⚠️ The chevron follows the tone too. It was hard-coded `green-600` — the brand
 * green, which is right on a white field and nearly invisible on the dark glass
 * one, where it sits at roughly 1.4:1 against the fill. `green-300` is the tone
 * this site already uses for marks on dark (price symbols, accents on the footer).
 */
const CHEVRON_TONE: Record<InputTone, string> = {
  light: "text-green-600",
  dark: "text-green-300",
};

function Chevron({ open, tone }: { open?: boolean; tone: InputTone }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn(
        "h-icon w-icon shrink-0 transition-transform duration-base ease-smooth",
        CHEVRON_TONE[tone],
        open && "rotate-180",
      )}
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Input({
  type = "text",
  name,
  label,
  placeholder,
  options = [],
  required,
  error,
  showLabel = true,
  tone = "light",
  className,
}: InputProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<SelectOption | null>(null);

  const invalid = Boolean(error);
  const FIELD = cn(FIELD_BASE, FIELD_TONE[tone], invalid && "border-error shadow-focus-error");

  return (
    <div className={cn("flex flex-col gap-sm", className)}>
      <label
        htmlFor={id}
        className={cn("text-body-sm-strong", LABEL_TONE[tone], !showLabel && "sr-only")}
      >
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>

      {type === "textarea" ? (
        <textarea
          id={id}
          name={name}
          placeholder={placeholder}
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? errorId : undefined}
          className={cn(FIELD, "min-h-field-lg resize-y p-base")}
        />
      ) : type === "select" ? (
        <div className="relative">
          <button
            type="button"
            id={id}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? errorId : undefined}
            onClick={() => setOpen((o) => !o)}
            onBlur={() => setOpen(false)}
            className={cn(FIELD, "flex h-field items-center justify-between gap-base px-base text-left")}
          >
            {/* The custom listbox has no real `::placeholder`, so the unselected
                state is styled here by hand — and it has to follow the tone, or
                `ink-400` sits on the dark field at roughly 2:1 and vanishes. */}
            <span className={cn(!selected && (tone === "dark" ? "text-green-100/70" : "text-ink-400"))}>
              {selected?.label ?? placeholder}
            </span>
            <Chevron open={open} tone={tone} />
          </button>

          {/* ⚠️ The open list follows the tone as well. A white popover dropping
              out of a dark glass field is a hard flash of light, and it makes the
              selected value appear to change colour the instant you pick it. */}
          {open ? (
            <ul
              role="listbox"
              aria-label={label}
              className={cn(
                "absolute inset-x-0 top-full z-10 mt-xs overflow-hidden rounded-sm shadow-elevated",
                tone === "dark"
                  ? "border border-border-glass-field bg-green-900"
                  : "border border-border-input bg-neutral-0",
              )}
            >
              {options.map((o) => (
                <li key={o.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected?.value === o.value}
                    // onMouseDown so it fires before the button's onBlur closes the list.
                    onMouseDown={() => {
                      setSelected(o);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex min-h-tap w-full items-center px-base text-left text-body",
                      "transition-colors duration-fast ease-smooth",
                      tone === "dark"
                        ? "text-ink-50 hover:bg-green-800"
                        : "text-ink-900 hover:bg-neutral-100",
                    )}
                  >
                    {o.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <input type="hidden" name={name} value={selected?.value ?? ""} readOnly />
        </div>
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? errorId : undefined}
          className={cn(FIELD, "h-field px-base")}
        />
      )}

      {invalid ? (
        <p id={errorId} className="text-body-sm text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
