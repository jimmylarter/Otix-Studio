import { cn } from "@/lib/cn";

/**
 * ContactRow — a footer contact method. Figma: `Contact Method` (×3).
 *
 * A 50px glass circle holding a 24px green-300 icon, then an eyebrow label above
 * the value. Value is `Heading/H5` (26 Medium) — changed from 24 Bold during D1.
 *
 * The glass circle uses the SAME three tokens as `Eyebrow` — `shadow-glass`,
 * `backdrop-blur-glass`, `border-green` over `overlay-green-20` — but lives here
 * rather than being an Eyebrow variant. It appears in exactly one place, the props
 * differ (icon vs label), and the shared part is already tokenised, so there is
 * nothing left to abstract (COMPONENTS.md §7 decision 1).
 */

export type ContactIcon = "mail" | "phone" | "instagram";

export interface ContactRowProps {
  icon: ContactIcon;
  label: string;
  value: string;
  href: string;
  className?: string;
}

const ICONS: Record<ContactIcon, React.ReactNode> = {
  mail: (
    <path
      d="M3 6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-11Zm1.8.5 7.2 5.4L19.2 7"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  phone: (
    <path
      d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
    </>
  ),
};

export function ContactRow({ icon, label, value, href, className }: ContactRowProps) {
  return (
    <a
      href={href}
      className={cn(
        "group flex min-h-tap items-center gap-base rounded-sm",
        "focus-visible:shadow-focus focus-visible:outline-none",
        className,
      )}
    >
      <span
        className={cn(
          "flex h-contact w-contact shrink-0 items-center justify-center rounded-full",
          "border border-border-green bg-overlay-green-20 text-green-300",
          "shadow-glass backdrop-blur-glass",
          "transition-colors duration-base ease-smooth group-hover:text-neutral-0",
        )}
      >
        {/* The glyph grows, the circle does not — so the row's geometry is fixed
            and only the icon animates. 24px at 110% is 26.4px, well inside the
            50px circle, so nothing clips. */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className={cn(
            "h-icon w-icon",
            "transition-transform duration-slower ease-out-back",
            "group-hover:scale-110 group-hover:duration-slow group-hover:ease-cta-expand",
          )}
        >
          {ICONS[icon]}
        </svg>
      </span>

      {/* Figma stacks these at gap 0 (17px label + 31px value = the 48px column).
          `gap-xs` gives the label room to breathe against the 26px value. */}
      <span className="flex flex-col gap-xs">
        <span className="font-mono text-eyebrow uppercase text-green-300">{label}</span>
        {/*
          The value grows elastically on hover, matching the Cta and Card.
          `origin-left` so it expands rightward from its start rather than from the
          centre — otherwise the whole row shifts left as it scales. `inline-block`
          because transforms do not apply to inline elements.
        */}
        <span
          className={cn(
            "inline-block origin-left text-h5 text-neutral-0",
            "transition-elastic duration-slower ease-out-back",
            // green-200, a step LIGHTER than the green-300 label — so the value
            // stays dominant on hover instead of flattening into the same tone.
            "group-hover:scale-105 group-hover:text-green-200",
            "group-hover:duration-slow group-hover:ease-cta-expand",
          )}
        >
          {value}
        </span>
      </span>
    </a>
  );
}
