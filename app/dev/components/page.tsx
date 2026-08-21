import { Eyebrow } from "@/components/Eyebrow";
import { Tag } from "@/components/Tag";
import { Logo } from "@/components/Logo";
import { Cta } from "@/components/Cta";
import { SectionHeader } from "@/components/SectionHeader";
import { Card } from "@/components/Card";
import { StatItem } from "@/components/StatItem";
import { TierCard } from "@/components/TierCard";
import { FeatureItem } from "@/components/FeatureItem";
import { StepCard } from "@/components/StepCard";
import { TestimonialCard } from "@/components/TestimonialCard";
import { Icon, PROCESS_ICONS, SERVICE_ICONS } from "@/components/Icon";
import { HeroArch } from "@/components/HeroArch";
import { Input } from "@/components/Input";
import { ContactRow } from "@/components/ContactRow";
import { BackgroundVideo } from "@/components/BackgroundVideo";
import { ServiceCard } from "@/components/ServiceCard";
import { PricingTabs } from "./PricingTabs";

/** Placeholder imagery — real assets come with the content in D8. */
const IMG = "/media/holding.jpg";

/**
 * /dev/components — the D4 component harness.
 *
 * Every component is built and reviewed HERE in isolation, with all variants and
 * states visible at once, before any section is assembled (CLAUDE.md §7).
 * The inventory and per-component variant/state list is COMPONENTS.md.
 */

function Row({ title, note, dark, children }: { title: string; note?: string; dark?: boolean; children?: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-lg border-t border-border-divider py-block">
      <header className="flex flex-col gap-xs">
        <h2 className="text-h4 text-ink-900">{title}</h2>
        {note ? <p className="max-w-measure text-body text-ink-600">{note}</p> : null}
      </header>
      <div
        className={
          dark
            ? "flex flex-wrap items-center gap-xl rounded-3xl bg-green-900 p-xl"
            : "flex flex-wrap items-center gap-xl"
        }
      >
        {children ?? <p className="font-mono text-body-sm text-ink-400">Not built yet.</p>}
      </div>
    </section>
  );
}

function Stub({ title, note }: { title: string; note?: string }) {
  return <Row title={title} note={note} />;
}

export default function DevComponents() {
  return (
    <main className="flex flex-col gap-xs p-section-x-flush">
      <header className="flex flex-col gap-sm py-block">
        <p className="font-mono text-eyebrow text-green-600">D4 · Component library</p>
        <h1 className="text-h2 text-ink-900">Otix Studio components</h1>
        <p className="max-w-measure text-body-lg text-ink-600">
          21 components, built one at a time. Each shows every variant and state side by
          side so drift is visible immediately.
        </p>
      </header>

      {/* ---------------- built ---------------- */}

      <Row title="Eyebrow" note="Glass pill. Only the text colour changes between contexts — the surface is identical. Text-only: no icon variant.">
        <Eyebrow label="About Otix" />
        <Eyebrow label="What our clients say" />
      </Row>
      <Row title="Eyebrow — on dark" note="variant=dark" dark>
        <Eyebrow label="AI-Integrated Design Studio" variant="dark" />
        <Eyebrow label="Spark" variant="dark" />
      </Row>
      <Row
        title="Eyebrow — the glass, over video"
        note="Figma applies GLASS (blur 4) + a green drop shadow. backdrop-blur only resolves against what is BEHIND it, so over the flat page it reads as a plain tinted pill — which is correct. Here it sits over the hero video, where the effect is actually visible."
      >
        <div className="relative w-full overflow-hidden rounded-3xl">
          <video
            className="h-media w-full object-cover"
            src="/media/background.mp4"
            poster="/media/background-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
          />
          <div className="absolute inset-0 flex items-center justify-center gap-xl">
            <Eyebrow label="AI-Integrated Design Studio" variant="dark" />
            <Eyebrow label="Our Process" variant="dark" />
          </div>
        </div>
      </Row>

      <Row title="Tag" note="Grey chip, sentence case — the case is what separates it from Eyebrow. Hugs its label, and stays grey on every surface including over imagery.">
        <Tag label="Web Design" />
        <Tag label="Apps & Dashboards" />
        <Tag label="SEO" />
      </Row>

      <Row title="Logo" note="Inline SVG, colours tokenised. Wordmark is outlined vector, outside the type system." dark>
        <Logo variant="nav" href="/" />
        <Logo variant="nav" markClass="text-neutral-0" textClass="text-green-300" />
      </Row>

      <Row title="Cta — tones" note="Identical geometry everywhere; only the three colours change. Hover mechanic is a placeholder until D6.">
        <Cta label="Lets chat" tone="mint" href="#" />
        <Cta label="Start project" tone="ink" href="#" />
        <Cta label="Get started" tone="green" href="#" />
      </Row>
      <Row title="Cta — states" note="disabled · loading · full-width">
        <Cta label="Disabled" tone="ink" disabled />
        <Cta label="Sending" tone="green" loading />
      </Row>
      <Row title="Cta — full width">
        <div className="w-full max-w-measure">
          <Cta label="Send message" tone="mint" fullWidth />
        </div>
      </Row>

      <Row title="SectionHeader — left">
        <SectionHeader
          eyebrow="About Otix"
          heading={[
            { text: "We don’t just build websites. We build " },
            { text: "growth engines.", accent: true },
          ]}
          body="Otix Studio is a boutique design and build studio that believes every business deserves digital tools that work as hard as they do."
        />
      </Row>
      <Row title="SectionHeader — center" note="Process and Testimonials. No body in Process.">
        <SectionHeader
          align="center"
          eyebrow="Our Process"
          heading={[{ text: "No guesswork, no " }, { text: "scope creep.", accent: true }]}
        />
      </Row>
      <Row title="SectionHeader — split" note="Heading left; body + action right. Collapses to one column below lg.">
        <div className="w-full">
          <SectionHeader
            align="split"
            eyebrow="Our Work"
            heading={[
              { text: "Websites, apps and dashboards we’ve " },
              { text: "delivered.", accent: true },
            ]}
            body="Websites that win customers, apps that keep them, dashboards that show the whole picture."
            action={<Cta label="Start project" tone="ink" href="#" />}
          />
        </div>
      </Row>
      <Row title="SectionHeader — on dark" dark>
        <div className="w-full">
          <SectionHeader
            tone="dark"
            eyebrow="Lets chat"
            heading={[{ text: "Let’s build something " }, { text: "great together.", accent: true }]}
            body="Tell us about your project and we’ll respond within 24 hours."
          />
        </div>
      </Row>

      {/* ---------------- not built yet ---------------- */}

      <Row
        title="Card — narrow + equal"
        note="Hover: the image goes full-bleed and the copy lifts onto it, colours inverting. Padding stays constant so the grid never shifts."
      >
        <div className="grid w-full gap-lg lg:grid-cols-3">
          <Card
            variant="narrow"
            image={IMG}
            tag="Web Design"
            title="Designing Brands for the Digital-First Era"
            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor."
            href="#"
          />
          <Card
            variant="equal"
            image={IMG}
            tag="Web Design"
            title="Designing Brands for the Digital-First Era"
            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
            href="#"
          />
          <Card
            variant="narrow"
            image={IMG}
            tag="Apps & Dashboards"
            title="Running the business out of spreadsheets"
            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod."
            href="#"
          />
        </div>
      </Row>

      <Row
        title="Card — featured"
        note="The outlier: side-by-side at rest, and on hover the image slides UNDER the copy column rather than the copy dropping onto a band. Stats appear here only."
      >
        <div className="w-full">
          <Card
            variant="featured"
            image={IMG}
            tag="Web Design"
            title="Designing Brands for the Digital-First Era"
            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            stats={[
              { value: "+68%", label: "Conversion rate" },
              { value: "+$42", label: "Avg order value" },
              { value: "6 wks", label: "To launch" },
            ]}
            href="#"
          />
        </div>
      </Row>

      <Row title="Card — banner" note="Permanently rolled over. Title left, copy right.">
        <div className="w-full">
          <Card
            variant="banner"
            image={IMG}
            tag="Web Design"
            title="Designing Brands for the Digital-First Era"
            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor."
          />
        </div>
      </Row>

      <Row title="StatItem" note="light · dark. Inside a Card it uses tone=auto and follows the rollover.">
        <StatItem value="+68%" label="Conversion rate" />
        <StatItem value="6 wks" label="To launch" />
      </Row>

      <Row
        title="HeroArch"
        note="NOT a carousel — a static inverted arch, biggest in the centre, tops dipping toward the middle. The run is 1572 wide against a 1440 frame, so the outer cards crop off both edges by design. Shown here on the dark hero surface."
      >
        <div className="w-full rounded-3xl bg-green-950 py-block">
          <HeroArch images={[IMG, IMG, IMG, IMG, IMG]} />
        </div>
      </Row>
      <Row title="StepCard" note="Gradient circle with shadow-elevated; glyph stroked in green-100. The rules connecting the circles belong to the section, not the card.">
        <div className="grid w-full gap-lg lg:grid-cols-4">
          <StepCard
            icon={<Icon name="discovery" className="h-step-glyph w-step-glyph" />}
            title="Discovery"
            description="We dig into your business, audience, and goals. By the end you will know exactly what we are building and why."
          />
          <StepCard
            icon={<Icon name="design" className="h-step-glyph w-step-glyph" />}
            title="Design"
            description="High-fidelity designs built to convert, not just look good. You see every screen before a line of code is written."
          />
          <StepCard
            icon={<Icon name="build" className="h-step-glyph w-step-glyph" />}
            title="Build"
            description="Clean, modern code. Fast, accessible and yours to keep, with a CMS so you can update it yourself."
          />
          <StepCard
            icon={<Icon name="launch" className="h-step-glyph w-step-glyph" />}
            title="Launch"
            description="We ship it, watch the numbers, and stay on hand for the inevitable can you just quickly requests."
          />
        </div>
      </Row>
      <Row
        title="TierCard — Websites"
        note="Identical surface on all three — only the CTA tone and the bespoke top tab mark the featured tier. Content verbatim from content.ts."
      >
        <div className="grid w-full gap-lg lg:grid-cols-3">
          <TierCard
            tier="Spark"
            name="The Launchpad"
            description="For new businesses ready to make their mark."
            price="2,500"
            features={[
              "Up to 5 custom pages",
              "AI chatbot — lead capture",
              "On-page SEO setup",
              "Google Analytics",
              "Mobile-responsive design",
              "2 rounds of revisions",
              "2 weeks post-launch support",
              { label: "CMS (content management)", included: false },
              { label: "E-commerce capability", included: false },
              { label: "Email automation", included: false },
            ]}
            cta={{ label: "Get started", href: "#" }}
          />
          <TierCard
            featured
            tier="Studio"
            name="The Growth Engine"
            description="For established businesses ready to scale."
            price="5,500"
            features={[
              "Up to 10 custom pages",
              "Advanced AI chatbot with FAQ training",
              "Booking system integration",
              "Email automation flows",
              "Full technical SEO",
              "CMS — edit content yourself",
              "Custom analytics dashboard",
              "3 rounds of revisions",
              "1 month post-launch support",
              { label: "E-commerce (add-on available)", included: false },
            ]}
            cta={{ label: "Get started", href: "#" }}
          />
          <TierCard
            tier="Summit"
            name="The Full Stack"
            description="For ambitious brands building something big."
            price="12,000"
            features={[
              "Unlimited pages",
              "Custom-trained AI assistant",
              "Full e-commerce + CRM integration",
              "AI-driven personalisation",
              "Advanced analytics + AI insights",
              "CMS included",
              "Unlimited revisions",
              "3 months post-launch support",
              "Dedicated project manager",
              "Priority retainer access",
            ]}
            cta={{ label: "Get started", href: "#" }}
          />
        </div>
      </Row>

      <Row
        title="TierCard — Apps & Dashboards"
        note="The second pricing tab. Two tiers, no featured tab and no excluded rows — same component, no new variant needed."
      >
        <div className="grid w-full gap-lg lg:grid-cols-2">
          <TierCard
            tier="Pulse"
            name="The Dashboard"
            description="For businesses drowning in spreadsheets."
            price="6,000"
            features={[
              "Your data on one clean screen",
              "Live numbers: sales, jobs, stock, bookings",
              "User logins & permissions",
              "AI insights & alerts",
              "Typically live in 4–6 weeks",
            ]}
            cta={{ label: "Get started", href: "#" }}
          />
          <TierCard
            tier="Forge"
            name="The Web App"
            description="For the idea you keep saying someone should build."
            price="15,000"
            features={[
              "Full product design & build",
              "Customer accounts, payments, notifications",
              "CMS/admin panel included",
              "Built to grow — not a throwaway prototype",
              "Typically live in 6–8 weeks",
            ]}
            cta={{ label: "Get started", href: "#" }}
          />
        </div>
      </Row>

      <Row title="FeatureItem" note="included · excluded. Same green-300 circle on both — the glyph changes and the label drops to 40%.">
        <ul className="flex flex-col gap-md rounded-3xl bg-gradient-green p-xl">
          <FeatureItem label="Up to 5 custom pages" />
          <FeatureItem label="AI chatbot — lead capture" />
          <FeatureItem label="CMS (content management)" included={false} />
          <FeatureItem label="E-commerce capability" included={false} />
        </ul>
      </Row>
      <Row title="TestimonialCard" note="The only non-white card — neutral-200 with a hairline, so it separates from the warm page without a shadow.">
        <div className="grid w-full gap-lg lg:grid-cols-3">
          <TestimonialCard
            quote="They rebuilt our booking flow and the drop-off just disappeared. First month back we took more covers than any month last year."
            name="LZ Granderson"
            role="Creative Producer"
            avatar={IMG}
          />
          <TestimonialCard
            quote="I had a spreadsheet for jobs, one for stock and one for invoices. Now it is one screen and I actually know what the business is doing."
            name="Marta Reyes"
            role="Operations Lead"
            avatar={IMG}
          />
          <TestimonialCard
            quote="Quoted fixed, delivered early, and they answered every email like actual humans. Rare combination."
            name="Tom Whitfield"
            role="Founder"
            avatar={IMG}
          />
        </div>
      </Row>
      <Row title="Icon" note="Streamline Core, supplied 12 Aug. Matched 1:1 to the Figma slots — 4 Process steps, 6 Services panels. Colours converted to currentColor; ids namespaced so they cannot clash.">
        <div className="flex w-full flex-col gap-lg">
          <div className="flex flex-wrap gap-xl rounded-3xl bg-gradient-green p-xl text-green-100">
            {PROCESS_ICONS.map((n) => (
              <span key={n} className="flex flex-col items-center gap-sm">
                <Icon name={n} className="h-step-glyph w-step-glyph" />
                <span className="font-mono text-eyebrow uppercase text-green-100">{n}</span>
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-xl text-accent-numeral">
            {SERVICE_ICONS.map((n) => (
              <span key={n} className="flex flex-col items-center gap-sm">
                <Icon name={n} className="h-step-glyph w-step-glyph" />
                <span className="font-mono text-eyebrow uppercase text-ink-600">{n}</span>
              </span>
            ))}
          </div>
        </div>
      </Row>

      <Stub title="Nav" note="top · scrolled · mobile-open" />
      <Row title="Input" note="Custom listbox for selects — the design has a styled green chevron a native <select> cannot render. Labels are visually hidden; placeholders are not accessible names.">
        <div className="grid w-full gap-base rounded-3xl bg-gradient-green p-xl lg:grid-cols-2">
          <Input name="name" label="Your name" placeholder="Alex Johnson" />
          <Input name="company" label="Company" placeholder="Acme Co." />
          <Input name="email" type="email" label="Email" placeholder="hello@yourbusiness.com" className="lg:col-span-2" />
          <Input
            name="projectType"
            type="select"
            label="Project type"
            placeholder="Select a project type…"
            options={[
              { value: "web", label: "Website" },
              { value: "app", label: "App / Dashboard" },
              { value: "ecom", label: "E-commerce" },
            ]}
            className="lg:col-span-2"
          />
          <Input
            name="budget"
            type="select"
            label="Budget"
            placeholder="Select a budget range…"
            options={[
              { value: "a", label: "$2k–5k" },
              { value: "b", label: "$5k–12k" },
              { value: "c", label: "$12k+" },
            ]}
            className="lg:col-span-2"
          />
          <Input name="message" type="textarea" label="Message" placeholder="Tell us about your project…" className="lg:col-span-2" />
          <Input name="err" label="With an error" placeholder="hello@yourbusiness.com" error="Enter a valid email address" className="lg:col-span-2" />
        </div>
      </Row>
      <Row title="ContactRow" note="Same three glass tokens as Eyebrow, but its own component — one use, different props." dark>
        <div className="flex flex-col gap-lg">
          <ContactRow icon="mail" label="Write" value="hello@otix.studio" href="mailto:hello@otix.studio" />
          <ContactRow icon="phone" label="Call" value="0424 249 667" href="tel:0424249667" />
          <ContactRow icon="instagram" label="Social" value="instagram" href="#" />
        </div>
      </Row>
      <Row title="SegmentedToggle" note="A real tablist — arrow keys move between tabs, roving tabindex, and it actually swaps the tier set below.">
        <PricingTabs />
      </Row>
      <Row
        title="BackgroundVideo"
        note="Ping-pong loop: plays forward, then walks backwards frame by frame, then forward again — so a clip that was never cut to loop cycles with no visible jump. The poster is the base layer and the LCP; the video mounts on top and fades in only once it can play, so there is never an empty frame. Not mounted at all under 640px or with reduced-motion — the poster is already the finished state, not a degraded one. Decorative throughout."
      >
        <div className="relative h-card w-full overflow-hidden rounded-2xl">
          <BackgroundVideo
            poster="/media/background-poster.jpg"
            mp4="/media/background.mp4"
            webm="/media/background.webm"
          />
        </div>
      </Row>
      <Row
        title="ServiceCard"
        note="The Services orbit card (13 Aug). One pill, and it is a QUESTION in the reader's words rather than a category label — the title underneath already says what the card is filed under. One layout, no variants — what changes is `distance`, 0 at the slot being read and 1 fully entering or leaving. It drives scale and blur TOGETHER: blur alone reads as a rendering fault, since nothing goes out of focus without also getting smaller. Shown at three fixed distances because the section itself only ever shows one of them sharp. The card takes its width from its parent — on the orbit that is 42% of the viewport, which is roughly what it is here."
      >
        <div className="flex w-full flex-col gap-xl">
          {/* ⚠️ BOTH LAYOUTS, because they are one component. `stacked` replaced
              `ServicePanel` on 13 Aug when the mobile Services section was rebuilt to
              match desktop — image on top rather than left, and a 4:3 crop rather than
              a square, because square ON TOP of copy takes most of a phone screen
              before a word is read. */}
          <div className="flex flex-col gap-sm">
            <p className="font-mono text-body-sm text-ink-400">layout=&quot;stacked&quot; — mobile carousel</p>
            <div className="w-1/4">
              <ServiceCard
                layout="stacked"
                question="Still running it on spreadsheets?"
                title="Apps & Dashboards"
                body={["Internal tools and customer dashboards that replace the spreadsheet everyone is quietly afraid of."]}
                image={IMG}
              />
            </div>
          </div>
          {[0, 0.5, 1].map((d) => (
            <div key={d} className="flex flex-col gap-sm">
              <p className="font-mono text-body-sm text-ink-400">layout=&quot;row&quot; · distance={d}</p>
              {/* ⚠️ Half-width, not full: the card is horizontal and the harness page
                  is full-bleed, so at 100% the image column alone would be wider than
                  it ever is in the section and the proportions would not be the ones
                  being reviewed. */}
              <div className="w-1/2">
                <ServiceCard
                  question="Launching a new business?"
                  title="Web Design & Development"
                  body={[
                    "Fast, accessible sites built to convert — designed and shipped by the same hands.",
                  ]}
                  image={IMG}
                  distance={d}
                />
              </div>
            </div>
          ))}
        </div>
      </Row>
    </main>
  );
}
