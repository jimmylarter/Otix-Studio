import { cn } from "@/lib/cn";
import { SectionHeader, type HeadingSegment } from "@/components/SectionHeader";
import { ContactRow, type ContactIcon } from "@/components/ContactRow";
import { Input, type SelectOption } from "@/components/Input";
import { Cta } from "@/components/Cta";

/**
 * ContactPanel — the copy-and-form block: heading, body and contact rows on the
 * left, the enquiry form on the right.
 *
 * ⚠️ EXTRACTED so the Footer and the contact popup are the same component, not two
 * copies of one layout. Figma's `POPUP CONTACT` (126:2) is the footer's own block
 * with the logo and legal row removed, on the same gradient at the same radius —
 * so it is one thing appearing twice, and CLAUDE.md §3 is explicit that repeats
 * consolidate into one component with props.
 *
 * What that buys: a field added to the form appears in both places, and the two
 * cannot drift into subtly different forms — which is exactly what happens when a
 * modal is built by copying the footer that inspired it.
 *
 * It renders no surface of its own. The Footer and the popup each supply the
 * gradient, radius and padding, because those differ: the footer is a page-width
 * panel, the popup is a dialog.
 */

export interface ContactPanelContact {
  key: ContactIcon;
  label: string;
  value: string;
  href: string;
}

export interface ContactPanelField {
  name: string;
  label: string;
  placeholder: string;
}

export interface ContactPanelForm {
  name: ContactPanelField;
  company: ContactPanelField;
  email: ContactPanelField;
  projectType: ContactPanelField;
  budget: ContactPanelField;
  message: ContactPanelField;
  submit: string;
}

export interface ContactPanelProps {
  eyebrow: string;
  heading: HeadingSegment[];
  body: string;
  contacts: ContactPanelContact[];
  projectTypes: SelectOption[];
  budgets: SelectOption[];
  form: ContactPanelForm;
  /** Set on the heading so a dialog can point `aria-labelledby` at it. */
  headingId?: string;
  className?: string;
}

export function ContactPanel({
  eyebrow,
  heading,
  body,
  contacts,
  projectTypes,
  budgets,
  form,
  headingId,
  className,
}: ContactPanelProps) {
  return (
    <div className={cn("grid gap-col lg:grid-cols-5", className)}>
      <div className="flex flex-col gap-block lg:col-span-2">
        {/* ⚠️ `lg:w-4/5` on the body only. `max-w-measure` (68ch) is already on it
            but does nothing here — this column is narrower than 68ch at every
            width, so the copy was running the full column and sitting flush with
            the heading above it. A PROPORTION holds the shorter line at every
            viewport, which is the point: it lets the heading read as the wider
            element. `lg:` because below that the column is narrow enough already. */}
        <SectionHeader
          eyebrow={eyebrow}
          heading={heading}
          body={body}
          bodyClassName="lg:w-4/5"
          tone="dark"
          headingId={headingId}
        />

        <div className="flex flex-col gap-xl">
          {contacts.map((c) => (
            <ContactRow key={c.key} icon={c.key} label={c.label} value={c.value} href={c.href} />
          ))}
        </div>
      </div>

      {/* `noValidate` so our own messages show rather than the browser's native
          bubbles, which cannot be styled and ignore the tokens.

          No submit handler yet — there is no endpoint. `onSubmit` is prevented so
          the page cannot navigate away and silently lose what someone typed. */}
      {/* ── The glass panel. Figma `NEW FORM` (172:2753). ─────────────────────
          `relative isolate` so the glow below can be positioned against it and
          kept behind the form with `-z-10` without escaping into the footer.

          ⚠️ NO `lg:mt-4xl`. It used to drop the form to line up with the TITLE
          rather than the eyebrow above it, which was right while the form was an
          invisible column of fields — the offset made the two columns read as one
          block. Now that the form is a real panel with its own edge, the top of
          that panel IS the alignment, and pushing it down 40px just left a notch
          in the section. Removed 13 Aug. */}
      <div className="relative isolate lg:col-span-3">
        {/*
          ⚠️ THIS IS WHAT MAKES THE FROST VISIBLE, and it is not decoration.
          `backdrop-filter: blur()` blurs what is BEHIND an element; behind this
          panel is the footer's flat `gradient-green`, and blurring a flat gradient
          returns the same flat gradient. Without something textured back here the
          frost renders identically to a plain translucent fill.

          Deliberately LARGER than the panel and offset up-left, so the blur has a
          gradient running across the whole surface rather than a symmetrical pool
          that would read as a stain centred behind the form.
        */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-block -z-10 bg-glow-form"
        />

        {/* `noValidate` so our own messages show rather than the browser's native
            bubbles, which cannot be styled and ignore the tokens.

            No submit handler yet — there is no endpoint. `onSubmit` is prevented so
            the page cannot navigate away and silently lose what someone typed.

            ⚠️ `p-5xl` (48) — the frame's own value. It is what separates the fields
            from the panel edge now that the panel is a real surface rather than an
            invisible column.

            32 was tried on 13 Aug and reverted the same day: the argument for it was
            that 48 against the fields' `gap-lg` (20) made the frame read wider than
            the rhythm inside it. On the page that turned out to be wrong — the panel
            is a large surface and a generous inset is what makes it read as one,
            rather than as a box drawn tightly around six fields. Don't re-derive it. */}
        <form
          noValidate
          onSubmit={(e) => e.preventDefault()}
          className={cn(
            "relative flex flex-col gap-lg rounded-3xl p-5xl",
            "border border-border-glass bg-overlay-glass-panel backdrop-blur-panel",
          )}
        >
          {/* ⚠️ Labels are VISIBLE now (`showLabel` defaults true). They used to be
              `sr-only` with the placeholder carrying the only visible description,
              which fails WCAG 3.3.2 the moment someone types and the placeholder
              disappears along with it. This is a defect fix, not a restyle. */}
          <div className="grid gap-lg sm:grid-cols-2">
            <Input {...form.name} tone="dark" required />
            <Input {...form.company} tone="dark" />
          </div>

          <Input type="email" {...form.email} tone="dark" required />
          <Input type="select" {...form.projectType} options={projectTypes} tone="dark" />
          <Input type="select" {...form.budget} options={budgets} tone="dark" />
          <Input type="textarea" {...form.message} tone="dark" />

          <Cta label={form.submit} tone="mint" fullWidth className="mt-md" />
        </form>
      </div>
    </div>
  );
}
