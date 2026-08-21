import type { ReactNode } from "react";
import { Eyebrow } from "@/components/Eyebrow";
import { SectionHeader } from "@/components/SectionHeader";
import { ContactRow } from "@/components/ContactRow";
import { Input, type InputOption } from "@/components/Input";
import { Cta } from "@/components/Cta";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/cn";

export interface FooterContact {
  icon: ReactNode;
  label: string;
  value: string;
  href?: string;
}

export interface FooterProps {
  eyebrow: string;
  heading: string;
  body: string;
  contacts: FooterContact[];
  projectTypes: InputOption[];
  budgets: InputOption[];
  submitLabel?: string;
  legalLeft: string;
  legalRight: string;
  className?: string;
}

/** Site footer — contact info + enquiry form, big wordmark, legal row. */
export function Footer({
  eyebrow,
  heading,
  body,
  contacts,
  projectTypes,
  budgets,
  submitLabel = "Send Message",
  legalLeft,
  legalRight,
  className,
}: FooterProps) {
  return (
    <footer className={cn("rounded-xl bg-surface-navy px-section-x pb-3xl pt-section-y text-text-on-dark", className)}>
      <div className="flex flex-col gap-block">
        <div className="flex flex-col gap-sm">
          {/* eyebrow spans the top so heading + form share the same top edge */}
          <Eyebrow label={eyebrow} variant="tint" />
          <div className="flex flex-wrap items-start gap-block lg:flex-nowrap lg:gap-col">
            {/* left — heading + contact methods; flexes to fill so the gap (not the form) is the fluid part */}
            <div className="flex basis-full flex-col gap-4xl lg:flex-1">
              <SectionHeader heading={heading} body={body} tone="dark" />
              <div className="flex flex-col gap-lg">
                {contacts.map((c) => (
                  <ContactRow key={c.label} icon={c.icon} label={c.label} value={c.value} href={c.href} />
                ))}
              </div>
            </div>

            {/* right — enquiry form (fixed width) */}
            <form className="flex basis-full flex-col gap-md lg:basis-1/2">
            <div className="grid gap-md sm:grid-cols-2">
              <Input name="name" label="Name" placeholder="Your name" />
              <Input name="company" label="Company" placeholder="Company" />
            </div>
            <Input name="email" kind="email" label="Email" placeholder="you@business.com" />
            <Input name="projectType" kind="select" label="Project type" placeholder="Select a project type…" options={projectTypes} />
            <Input name="budget" kind="select" label="Budget" placeholder="Select a budget range…" options={budgets} />
            <Input name="message" kind="textarea" label="Message" placeholder="Tell us about your project…" />
            <Cta variant="arrow" tone="dark" fullWidth label={submitLabel} className="mt-md" />
            </form>
          </div>
        </div>

        {/* big wordmark */}
        <div className="flex justify-center py-5xl">
          <Logo className="h-20 w-auto text-text-on-dark" />
        </div>

        {/* legal */}
        <div className="flex flex-col gap-md">
          <span className="h-px w-full bg-glass-hairline" />
          <div className="flex items-center justify-between text-body-sm text-surface-white/40">
            <span>{legalLeft}</span>
            <span>{legalRight}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
