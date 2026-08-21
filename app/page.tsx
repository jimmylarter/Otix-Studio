import { Nav } from "@/components/Nav";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Work } from "@/components/sections/Work";
import { Services } from "@/components/sections/Services";
import { Banner } from "@/components/sections/Banner";
import { Process } from "@/components/sections/Process";
import { Pricing } from "@/components/sections/Pricing";
import { Testimonials } from "@/components/sections/Testimonials";
import { Footer } from "@/components/sections/Footer";
import { ContactPopup } from "@/components/ContactPopup";
import { content } from "@/content/content";

/**
 * Homepage — D8 assembly, in progress.
 *
 * The v1 assembly (14 sections, teal/navy) is preserved at git tag `v1-teal-navy`
 * and in `_archive-v1-teal/app/page.tsx`. Do NOT restore it: v2 has 11 sections and
 * every component was rebuilt (COMPONENTS.md).
 *
 * Section order (DESIGN_TOKENS.md §7):
 *   Hero → About → Banner 1 → Work → Services (incl. panel 07 / the quiz) → Process
 *   → Banner 2
 *   → Pricing → Testimonials → Footer
 *
 * ✅ ALL ELEVEN SECTIONS ASSEMBLED (12 Aug). Next is D9 — the Playwright
 * verification pass — plus the open questions in CMS_READINESS.md §3 and
 * RESPONSIVE_SPEC.md §7.
 *
 * Page frame: the Hero is FLUSH (full-bleed, no gutter); every other section is
 * CONTAINERED (inside the 10px gutter) — CLAUDE.md §0.1. There is no page
 * wrapper and no max-width, at any breakpoint.
 *
 * `Nav` lives here rather than in the Hero: it is fixed, it outlives the hero, and
 * nesting it inside a section that will eventually animate would put it in that
 * section's stacking context.
 */
export default function Home() {
  return (
    <>
      {/* `contacts` feeds the MOBILE menu's foot only — the same list the footer
          renders, passed rather than duplicated. */}
      {/* ⚠️ `hideOver` — the bar stays away over the Services reel, which pins for
          five viewport-heights and then opens a full-bleed quiz card. See the prop. */}
      <Nav
        hideOver={["services"]}
        links={content.nav.links}
        cta={content.nav.cta}
        contacts={content.footer.contacts}
      />

      <main>
        <Hero
          eyebrow={content.hero.eyebrow}
          heading={content.hero.heading}
          subhead={content.hero.subhead}
          cta={content.hero.cta}
          media={content.hero.media}
          archImages={content.hero.archImages}
          accentWords={content.hero.accentWords}
        />

        <About
          eyebrow={content.about.eyebrow}
          heading={content.about.heading}
          body={content.about.body}
          chart={content.about.chart}
        />

{/* ⚠️ RESTORED AND MOVED 13 Aug. It sat between Services and WhyOtix and was
            deleted when the quiz became panel 07 of the reel — two full-bleed
            interruptions two sections apart. It is back HERE, between About and Work,
            which is nowhere near the reel, so the reason it was cut no longer applies.
            It also carries a different image now; see `content.banner1`. */}
        <Banner id="banner-1" {...content.banner1} />

        <Work
          eyebrow={content.work.eyebrow}
          heading={content.work.heading}
          body={content.work.body}
          cta={content.work.cta}
          featured={content.work.featured}
          tall={content.work.tall}
          grid={content.work.grid}
        />

        {/* ⚠️ `<WhyOtix>` USED TO SIT BELOW THIS and is deleted — its header and quiz
            became panel 07 of this reel. `banner-1` was removed at the same time and
            for the same reason, but it is BACK, higher up the page between About and
            Work, where it is nowhere near the reel. `banner2` was never touched. */}
        <Services
          header={{
            eyebrow: content.services.eyebrow,
            heading: content.services.heading,
            body: content.services.body,
            cta: content.services.cta,
          }}
          panels={content.services.panels}
          finale={{
            eyebrow: content.whyOtix.eyebrow,
            heading: content.whyOtix.heading,
            body: content.whyOtix.body,
            image: content.whyOtix.image,
            quiz: content.quiz,
          }}
        />

        <Process
          eyebrow={content.process.eyebrow}
          heading={content.process.heading}
          steps={content.process.steps}
        />

        <Banner id="banner-2" {...content.banner2} />

        <Pricing
          eyebrow={content.pricing.eyebrow}
          heading={content.pricing.heading}
          body={content.pricing.body}
          tabs={content.pricing.tabs}
        />

        {/*
          ⚠️ THE FOOTER OVERLAY REVEAL IS GONE (13 Aug, Jimmy's call). Testimonials
          and Footer are now two ordinary siblings and the page scrolls normally.

          What was here: a shared `relative` parent with `lg:sticky lg:top-0` on the
          Testimonials, so they pinned at the top while the footer scrolled up over
          them. It was CSS-only and it did reverse correctly on the way back up —
          but it cost the Testimonials most of their dwell time, because the footer
          began covering the cards almost as soon as they arrived.

          If it is ever wanted back: the two MUST share a parent. A sticky element
          sticks within its own parent, so with the footer outside that wrapper
          there is nothing left for the testimonials to stick for. And it has to
          stay `lg:`-only — on a phone the testimonials are taller than the viewport,
          so pinning them at `top-0` hides their lower half behind the footer.
        */}
        <Testimonials
          eyebrow={content.testimonials.eyebrow}
          heading={content.testimonials.heading}
          items={content.testimonials.items}
        />

        <Footer {...content.footer} />
      </main>

      {/* Opens on any `a[href="#contact"]` — the nav CTA and both section CTAs.
          It intercepts those links rather than being wired to each one, so they
          stay real links to the footer if JavaScript never arrives. */}
      <ContactPopup
        eyebrow={content.footer.eyebrow}
        heading={content.footer.heading}
        body={content.footer.body}
        contacts={content.footer.contacts}
        projectTypes={content.footer.projectTypes}
        budgets={content.footer.budgets}
        form={content.footer.form}
      />
    </>
  );
}
