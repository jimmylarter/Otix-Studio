import { Logo } from "@/components/Logo";
import { QuoteMark } from "@/components/QuoteMark";
import { Eyebrow } from "@/components/Eyebrow";
import { Pill } from "@/components/Pill";
import { Cta } from "@/components/Cta";
import { Card } from "@/components/Card";
import { WorkCard } from "@/components/WorkCard";
import { SectionHeader } from "@/components/SectionHeader";
import { Input } from "@/components/Input";
import { StepCard } from "@/components/StepCard";
import { TestimonialCard } from "@/components/TestimonialCard";
import { AccordionItem } from "@/components/AccordionItem";
import { PricingTiers } from "@/components/PricingTiers";
import { ContactRow } from "@/components/ContactRow";
import { FeatureCard } from "@/components/FeatureCard";
import { Footer } from "@/components/Footer";
import { content } from "@/content/content";

const iconMail = (
  <svg viewBox="0 0 24 24" fill="none" className="h-icon w-icon">
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const iconPhone = (
  <svg viewBox="0 0 24 24" fill="none" className="h-icon w-icon">
    <path d="M6 3h3l2 5-2.5 1.5a11 11 0 005 5L15 11l5 2v3a2 2 0 01-2 2A15 15 0 014 5a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const iconInsta = (
  <svg viewBox="0 0 24 24" fill="none" className="h-icon w-icon">
    <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
  </svg>
);

/**
 * /dev/components — the component review page (Deliverable 4).
 * Right now it proves the FOUNDATIONS render (fonts, colour, type, radius,
 * brand assets). Each built component gets appended as its own section.
 * Token-pure: no arbitrary Tailwind values anywhere on this page.
 */

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-sm border-t border-border-divider pt-lg">
      <span className="font-mono text-eyebrow-sm uppercase text-primary-blue">{label}</span>
      {children}
    </div>
  );
}

const colours: [string, string][] = [
  ["primary-blue", "bg-primary-blue"],
  ["primary-navy", "bg-primary-navy"],
  ["surface-light", "bg-surface-light"],
  ["surface-white", "bg-surface-white"],
  ["text-on-dark", "bg-text-on-dark"],
  ["error", "bg-error"],
];

const radii: [string, string][] = [
  ["sm", "rounded-sm"],
  ["md", "rounded-md"],
  ["lg", "rounded-lg"],
  ["xl", "rounded-xl"],
  ["pill", "rounded-pill"],
  ["full", "rounded-full"],
];

export default function ComponentsDevPage() {
  return (
    <main className="flex flex-col gap-block bg-surface-white px-section-x py-section-y text-text-on-light">
      <header className="flex flex-col gap-sm">
        <span className="font-mono text-eyebrow uppercase tracking-wide text-primary-blue">Otix · dev</span>
        <h1 className="font-sans text-h2 text-text-on-light">Component Layer</h1>
        <p className="max-w-measure text-body text-text-muted-light">
          Foundations first. Components are appended here as they&apos;re built.
        </p>
      </header>

      {/* FONTS */}
      <Row label="Fonts">
        <div className="flex flex-col gap-xs">
          <p className="font-sans text-h4 text-text-on-light">Manrope — the primary typeface</p>
          <p className="font-mono text-body text-text-on-light">Geist Mono — eyebrows, CTAs, accents</p>
          <p className="font-pixel text-h3 text-text-on-light">Geist Pixel — quotes</p>
        </div>
      </Row>

      {/* TYPE SCALE */}
      <Row label="Type scale">
        <div className="flex flex-col gap-sm">
          <p className="text-h1 text-text-on-light">H1 — We build things that work</p>
          <p className="text-h2 text-text-on-light">H2 — Everything you need</p>
          <p className="text-h3 text-text-on-light">H3 — Our process</p>
          <p className="text-h4 text-text-on-light">H4 — Web Design &amp; Development</p>
          <p className="text-h5 text-text-on-light">H5 — The Dashboard</p>
          <p className="text-h6 text-text-on-light">H6 — SEO &amp; Analytics</p>
          <p className="font-pixel text-quote text-text-on-light">Quote — 3 seconds count</p>
          <p className="text-body-lg text-text-on-light">Body Lg — intelligent, bespoke websites (Regular)</p>
          <p className="text-body text-text-on-light">Body — clean modern code (Regular)</p>
          <p className="text-body-sm text-text-on-light">Body Sm — supporting copy (Regular)</p>
          <p className="text-title-strong text-text-on-light">Title Strong — Miso Kitchen (Bold)</p>
          <p className="text-body-sm-strong text-text-on-light">Sm Body Strong — LZ Granderson (Bold)</p>
          <p className="text-stat text-text-on-light">Stat — +68% (Bold)</p>
          <p className="font-mono text-eyebrow uppercase text-primary-blue">Eyebrow — AI-INTEGRATED (14)</p>
          <p className="font-mono text-eyebrow-sm uppercase text-primary-blue">Sm Eyebrow — CREATIVE PRODUCER (12)</p>
          <p className="font-mono text-cta uppercase text-text-on-light">Cta — START PROJECT</p>
        </div>
      </Row>

      {/* COLOUR */}
      <Row label="Colour">
        <div className="flex flex-wrap gap-base">
          {colours.map(([name, bg]) => (
            <div key={name} className="flex flex-col gap-xs">
              <div className={`h-cta w-contact rounded-lg ring-1 ring-border-divider ${bg}`} />
              <span className="font-mono text-eyebrow-sm text-text-muted-light">{name}</span>
            </div>
          ))}
        </div>
      </Row>

      {/* RADIUS */}
      <Row label="Radius">
        <div className="flex flex-wrap items-end gap-base">
          {radii.map(([name, r]) => (
            <div key={name} className="flex flex-col gap-xs">
              <div className={`h-contact w-contact bg-primary-blue ${r}`} />
              <span className="font-mono text-eyebrow-sm text-text-muted-light">{name}</span>
            </div>
          ))}
        </div>
      </Row>

      {/* BRAND ASSETS */}
      <Row label="Brand assets">
        <div className="flex flex-wrap items-center gap-block">
          <div className="flex items-center rounded-xl bg-surface-navy px-lg py-md">
            <Logo className="h-md w-auto text-text-on-dark" />
          </div>
          <div className="flex items-center rounded-xl bg-surface-light px-lg py-md">
            <Logo className="h-md w-auto text-primary-navy" />
          </div>
          <QuoteMark className="h-3xl w-auto text-primary-blue" />
        </div>
      </Row>

      {/* EYEBROW */}
      <Row label="Eyebrow — variants + sizes">
        <div className="flex flex-wrap items-center gap-base">
          <Eyebrow label="About Otix" variant="tint" />
          <Eyebrow label="Creative Producer" variant="tint" size="sm" />
          <div className="rounded-xl bg-surface-navy p-md"><Eyebrow label="Wellness" variant="solid" /></div>
          <div className="rounded-xl bg-gradient-blue p-md"><Eyebrow label="Why Otix" variant="glass" /></div>
        </div>
      </Row>

      {/* PILL */}
      <Row label="Pill — static service tags (About)">
        <ul className="flex flex-wrap items-start gap-base">
          {["Websites", "Dashboards", "Apps", "E-Commerce Builds", "SEO & Analytics", "Retainer & Support"].map((p) => (
            <li key={p}>
              <Pill label={p} />
            </li>
          ))}
        </ul>
      </Row>

      {/* CTA */}
      <Row label="Cta — hover to see the circle fill + arrow loop">
        <div className="flex flex-col gap-base">
          <div className="flex flex-wrap items-center gap-base rounded-xl bg-surface-navy p-lg">
            <Cta label="Start Project" href="#" tone="dark" />
            <Cta label="Lets Chat" href="#" variant="text" tone="dark" />
            <Cta label="Start Project" href="#" tone="dark" scrollCue />
          </div>
          <div className="flex flex-wrap items-center gap-base rounded-xl bg-surface-light p-lg">
            <Cta label="Start Project" href="#" tone="light" />
            <Cta label="Lets Chat" href="#" variant="text" tone="light" />
          </div>
          <div className="flex flex-wrap items-center gap-base rounded-xl bg-gradient-blue p-lg">
            <Cta label="Start Project" href="#" tone="gradient" />
            <Cta label="Lets Chat" href="#" variant="text" tone="gradient" />
          </div>
          <div className="flex flex-col gap-base rounded-xl bg-surface-navy p-lg">
            <Cta label="Send Message" href="#" tone="dark" fullWidth />
            <div className="flex flex-wrap gap-base">
              <Cta label="Loading" tone="dark" loading />
              <Cta label="Disabled" tone="dark" disabled />
            </div>
          </div>
        </div>
      </Row>

      {/* CARD */}
      <Row label="Card — grid, with-stats, and full-bleed (Banner)">
        <div className="flex flex-col gap-base">
          <div className="grid grid-cols-2 gap-base">
            <div className="h-80">
              <Card image="/media/hero-poster.jpg" tag="Restaurant" title="Miso Kitchen" body="Studio Tier — AI Booking" href="#" />
            </div>
            <div className="h-80">
              <Card
                image="/media/hero-poster.jpg"
                tag="E-Commerce"
                title="Aura Supplements"
                body="Full e-commerce with an AI product quiz and subscriptions."
                href="#"
                stats={[
                  { value: "+68%", label: "Conversion" },
                  { value: "+$42", label: "Avg order" },
                  { value: "6 wks", label: "To launch" },
                ]}
              />
            </div>
          </div>
          <div className="aspect-banner">
            <Card image="/media/hero-poster.jpg" tag="Wellness" title="Veda Studio" body="Studio Tier — Class AI" fullBleed href="#" />
          </div>
        </div>
      </Row>

      {/* WORK CARD */}
      <Row label="WorkCard — hover: image grows, bg → gradient, glow behind (with + without stats)">
        <div className="rounded-xl bg-surface-navy p-lg">
          <div className="grid gap-lg lg:grid-cols-3">
            <div className="lg:col-span-2">
              <WorkCard
                image="/media/holding.jpg"
                tag="E-Commerce"
                title="Aura Supplements"
                body="Full e-commerce store with AI product recommendation quiz, subscription model, and editorial brand identity."
                href="#"
                stats={[
                  { value: "+68%", label: "Conversion rate" },
                  { value: "+$42", label: "Avg order value" },
                  { value: "6 wks", label: "To launch" },
                ]}
              />
            </div>
            <WorkCard
              image="/media/holding.jpg"
              tag="Restaurant"
              title="Miso Kitchen"
              body="Restaurant site with AI booking, digital menu, and staff training chatbot."
              href="#"
              stats={[{ value: "+210%", label: "Direct bookings" }]}
            />
            <WorkCard
              image="/media/holding.jpg"
              tag="Restaurant"
              title="Veda Wellness Studio"
              body="Studio website with AI class scheduling and member portal."
              href="#"
            />
          </div>
        </div>
      </Row>

      {/* SECTION HEADER */}
      <Row label="SectionHeader — split, centered, left, tones">
        <div className="flex flex-col gap-block">
          {/* split, light */}
          <SectionHeader
            eyebrow="About Otix"
            heading={["We don’t just build websites. We build ", { highlight: "growth engines" }]}
            body="Otix Studio is a boutique design and build studio that believes every business deserves digital tools that work as hard as they do."
            split
          />
          {/* centered, light */}
          <SectionHeader
            eyebrow="Services"
            heading={["Everything you need to ", { highlight: "win online" }]}
            align="center"
          />
          {/* left, light, with body */}
          <SectionHeader
            eyebrow="FAQs"
            heading="Got a question?"
            body="Straight answers, no jargon. If yours isn’t here, ask — the chatbot in the corner was built for this."
          />
          {/* split, dark */}
          <div className="rounded-xl bg-surface-navy p-lg">
            <SectionHeader
              eyebrow="Our Work"
              heading={["Websites, apps and dashboards we’ve ", { highlight: "shipped" }]}
              body="Here’s the actual work, for actual businesses, with the results still attached."
              split
              tone="dark"
            />
          </div>
          {/* split, gradient */}
          <div className="rounded-xl bg-gradient-blue p-lg">
            <SectionHeader
              eyebrow="Why Otix Studio"
              heading="Your website should work while you sleep."
              body="Most studios build things that look good. We build things that think."
              split
              tone="gradient"
            />
          </div>
        </div>
      </Row>

      {/* INPUT */}
      <Row label="Input — text, email, select, textarea, error, disabled">
        <div className="grid gap-base rounded-xl bg-surface-navy p-lg sm:grid-cols-2">
          <Input name="name" label="Name" placeholder="Alex Johnson" />
          <Input name="company" label="Company" placeholder="Acme Co." />
          <Input name="email" kind="email" label="Email" placeholder="hello@yourbusiness.com" className="sm:col-span-2" />
          <Input
            name="ptype"
            kind="select"
            label="Project type"
            placeholder="Select a project type…"
            options={[
              { value: "web", label: "Website" },
              { value: "app", label: "App / Dashboard" },
              { value: "ecom", label: "E-commerce" },
            ]}
          />
          <Input
            name="budget"
            kind="select"
            label="Budget"
            placeholder="Select a budget range…"
            options={[
              { value: "a", label: "$2k–5k" },
              { value: "b", label: "$5k–12k" },
              { value: "c", label: "$12k+" },
            ]}
          />
          <Input name="message" kind="textarea" label="Message" placeholder="Tell us about your project…" className="sm:col-span-2" />
          <Input name="err" label="With error" placeholder="you@" error="Please enter a valid email address." />
          <Input name="dis" label="Disabled" placeholder="Disabled field" disabled />
        </div>
      </Row>

      {/* STEP CARD */}
      <Row label="StepCard — numbered process step">
        <div className="grid gap-base sm:grid-cols-3">
          <div className="h-80">
            <StepCard number="01" title="Discovery" body="We dig into your business, audience, and goals until we know exactly what success looks like." />
          </div>
          <div className="h-80">
            <StepCard number="02" title="Strategy" body="We map the sitemap, user journey, and AI opportunities — where automation moves the needle." />
          </div>
          <div className="h-80">
            <StepCard number="03" title="Design" body="High-fidelity designs built to convert. You see every screen before a line of code is written." />
          </div>
        </div>
      </Row>

      {/* TESTIMONIAL CARD */}
      <Row label="TestimonialCard (copy written fresh)">
        <div className="grid gap-base rounded-xl bg-surface-light p-lg sm:grid-cols-2">
          <TestimonialCard
            quote="Otix rebuilt our site in three weeks and bookings jumped almost overnight. It finally feels like the business online."
            name="Priya Nair"
            role="Owner, Veda Studio"
            avatar="/media/hero-poster.jpg"
          />
          <TestimonialCard
            quote="They didn’t just design something pretty — the AI booking flow does real work every single day. Worth every cent."
            name="Marco Silveira"
            role="Founder, Miso Kitchen"
            avatar="/media/hero-poster.jpg"
          />
        </div>
      </Row>

      {/* ACCORDION */}
      <Row label="AccordionItem — click to open/close">
        <div className="flex max-w-measure flex-col gap-2xl">
          <AccordionItem
            question="What does your process look like?"
            answer="A quick discovery call, then strategy, design, build, launch and ongoing support — no guesswork, no scope creep."
            defaultOpen
          />
          <AccordionItem
            question="Do you use AI in your work?"
            answer="Yes — AI is woven into the foundation of every build, from lead-capture chatbots to automations and smart search, wherever it genuinely earns its keep."
          />
          <AccordionItem
            question="Do you offer support after a project goes live?"
            answer="Absolutely. We stick around after launch with updates, backups and tweaks — from $99/month, with a real human answering the emails."
          />
        </div>
      </Row>

      {/* PRICING — toggle swaps the tier set */}
      <Row label="Pricing — toggle between Websites (3) and Apps & Dashboards (2)">
        <div className="rounded-xl bg-gradient-blue p-lg">
          <PricingTiers tabs={content.pricing.tabs} />
        </div>
      </Row>

      {/* CONTACT ROW */}
      <Row label="ContactRow (footer)">
        <div className="flex flex-col gap-lg rounded-xl bg-surface-navy p-lg">
          <ContactRow href="mailto:hello@otix.studio" label="Write" value="hello@otix.studio" icon={iconMail} />
          <ContactRow href="tel:0424249667" label="Call" value="0424 249 667" icon={iconPhone} />
          <ContactRow href="#" label="Social" value="instagram" icon={iconInsta} />
        </div>
      </Row>

      {/* FEATURE CARD */}
      <Row label="FeatureCard (Services 3-up)">
        <div className="grid gap-base sm:grid-cols-3">
          <FeatureCard image="/media/hero-poster.jpg" title="SEO & Analytics" body="Being invisible on Google is a hobby, not a business. Every build ships with SEO foundations and analytics wired in." />
          <FeatureCard image="/media/hero-poster.jpg" title="Brand Identity" body="Logo, colours, type, tone of voice — the full kit, so everything you put into the world looks like it came from the same place." />
          <FeatureCard image="/media/hero-poster.jpg" title="Retainer & Support" body="Updates, backups, tweaks and quick requests. We stick around after launch — from $99/month, with a real human on email." />
        </div>
      </Row>

      {/* FOOTER */}
      <Row label="Footer (layout)">
        <Footer
          eyebrow="Get In Touch"
          heading="Let’s build something great together."
          body="Tell us about your project and we’ll respond within 24 hours. Or skip ahead and book a free 30-minute discovery call."
          contacts={[
            { icon: iconMail, label: "Write", value: "hello@otix.studio", href: "mailto:hello@otix.studio" },
            { icon: iconPhone, label: "Call", value: "0424 249 667", href: "tel:0424249667" },
            { icon: iconInsta, label: "Social", value: "instagram", href: "#" },
          ]}
          projectTypes={[
            { value: "web", label: "Website" },
            { value: "app", label: "App / Dashboard" },
            { value: "ecom", label: "E-commerce" },
          ]}
          budgets={[
            { value: "a", label: "$2k–5k" },
            { value: "b", label: "$5k–12k" },
            { value: "c", label: "$12k+" },
          ]}
          legalLeft="2025 Otix Studio"
          legalRight="Designed by Otix Studio"
        />
      </Row>
    </main>
  );
}
