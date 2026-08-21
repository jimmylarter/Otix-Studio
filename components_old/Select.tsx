"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { InputOption } from "@/components/Input";

export interface SelectProps {
  name: string;
  label?: string;
  placeholder?: string;
  options: InputOption[];
  defaultValue?: string;
  error?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Custom accessible select (listbox pattern) so the menu matches the design.
 * Keyboard: ↑/↓/Home/End to move, Enter/Space to choose, Esc to close.
 * A hidden input carries the value for normal form submission.
 */
export function Select({ name, label, placeholder, options, defaultValue, error, disabled, className }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue ?? "");
  const [active, setActive] = useState(() => Math.max(0, options.findIndex((o) => o.value === defaultValue)));
  const rootRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  function choose(i: number) {
    const o = options[i];
    if (!o) return;
    setValue(o.value);
    setActive(i);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        setActive((a) => Math.min(options.length - 1, a + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((a) => Math.max(0, a - 1));
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(active);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <input type="hidden" name={name} value={value} readOnly />
      <button
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-label={label ?? placeholder}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        className={cn(
          "flex h-field w-full items-center justify-between rounded-sm border bg-surface-white px-base text-body shadow-sunken outline-none transition-shadow duration-base ease-standard disabled:cursor-not-allowed disabled:opacity-40",
          error
            ? "border-error focus-visible:shadow-focus-error"
            : "border-border-on-light focus-visible:border-primary-blue focus-visible:shadow-focus",
          open && !error && "border-primary-blue shadow-focus",
        )}
      >
        <span className={selected ? "text-text-on-light" : "text-text-on-light/30"}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className={cn("h-icon w-icon shrink-0 text-text-on-light transition-transform duration-base ease-standard", open && "rotate-180")}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          id={`${id}-list`}
          role="listbox"
          aria-label={label ?? placeholder}
          className="absolute inset-x-0 top-full z-50 mt-xs max-h-64 overflow-auto rounded-sm border border-border-on-light bg-surface-white py-xs shadow-menu"
        >
          {options.map((o, i) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(i);
              }}
              className={cn(
                "cursor-pointer px-base py-sm text-body",
                i === active ? "bg-teal-tint text-primary-blue" : "text-text-on-light",
                o.value === value && "font-bold",
              )}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Select;
