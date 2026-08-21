"use client";

import { cn } from "@/lib/cn";
import { type HeadingSegment } from "@/components/SectionHeader";
import { type ContactIcon } from "@/components/ContactRow";
import { type SelectOption } from "@/components/Input";
import { ContactPanel } from "@/components/ContactPanel";
import { Logo } from "@/components/Logo";

/**
 * Footer — the contact panel. Figma: `FOOTER` (36:605).
 *
 * ⚠️ CONTAINERED (CLAUDE.md §0.1): a gradient surface at radius 30, inset by the
 * gutter. The only section on a dark surface, so every child takes its `dark`
 * tone.
 *
 * ── The rise ⚠️ REMOVED 13 Aug ────────────────────────────────────────────────
 * **The footer is now an ordinary section. The page just scrolls.** It no longer
 * travels up over the testimonials, and nothing above it pins.
 *
 * That overlay was invented rather than designed — it came from Jimmy's brief, not
 * the Figma frame — and it was cut for a reason worth recording: it ate the
 * Testimonials' dwell time. The footer began covering the cards almost as soon as
 * they arrived, so the section a visitor was least likely to actually read was the
 * one carrying the social proof.
 *
 * ⚠️ If it is ever wanted back, do it the way it was done, not the way it was first
 * attempted. It worked with **no JavaScript at all**: a shared parent in
 * `app/page.tsx` with `lg:sticky lg:top-0` on the Testimonials, so they pinned
 * while this section scrolled over them.
 *
 * Three earlier attempts did it in JS — an IntersectionObserver trigger, then a
 * scroll-position transform on a `fixed` panel, then the same with a spacer — and
 * every one was poppy or glitchy. They were all fighting the browser: a fixed
 * element has to re-derive a position the scroller already knows, and any lag
 * between the two reads as jitter. Sticky lets the compositor do it, so it cannot
 * desync, it reverses on the way back up for free, and it needs no measurement, no
 * listener and no reduced-motion branch.
 *
 * `relative z-10` and the opaque background stay. They are what made it occlude
 * rather than blend, and they are harmless now — but they are also the only two
 * things this element had to carry for the effect, so leaving them means bringing
 * it back is a change to `page.tsx` alone.
 *
 * ── The form ──────────────────────────────────────────────────────────────────
 * No submit handler yet — there is no endpoint. `onSubmit` is prevented so the
 * page cannot navigate away and silently lose what someone typed. Wiring it is a
 * post-D9 task.
 */

export interface FooterContact {
  key: ContactIcon;
  label: string;
  value: string;
  href: string;
}

export interface FooterField {
  name: string;
  label: string;
  placeholder: string;
}

export interface FooterProps {
  eyebrow: string;
  heading: HeadingSegment[];
  body: string;
  contacts: FooterContact[];
  projectTypes: SelectOption[];
  budgets: SelectOption[];
  form: {
    name: FooterField;
    company: FooterField;
    email: FooterField;
    projectType: FooterField;
    budget: FooterField;
    message: FooterField;
    submit: string;
  };
  legalLeft: string;
  /** Split so the studio name can carry the bold without markup in content. */
  legalRight: { prefix: string; name: string };
  className?: string;
}

export function Footer({
  eyebrow,
  heading,
  body,
  contacts,
  projectTypes,
  budgets,
  form,
  legalLeft,
  legalRight,
  className,
}: FooterProps) {
  return (
    <>
      <footer
        // ⚠️ `id="contact"` is load-bearing. The nav CTA and both section CTAs all
        // href to `#contact`, and nothing on the page carried that id — every one
        // of them was a dead link that silently did nothing.
        id="contact"
        className={cn(
          // `bg-neutral-100` so the panel's gutter is opaque as it travels — the
          // page colour, not transparency. Without it you see the testimonials
          // through the 10px frame while the footer slides over them.
          "relative z-10 bg-neutral-100 px-gutter pb-gutter",
          className,
        )}
      >
        {/* ⚠️ `pb-block` (→80) against `pt-section-y` (→100). Measured from the
            frame: the panel is 1168 tall and the lockup ends at 1088.

            It went 100 → 60 → 32 → 80. The 32 was right only while the legal row
            was the last thing INSIDE the panel — a rule and two lines of small type
            need very little beneath them. Now that the row has moved out, the last
            thing in the panel is the lockup, and a large mark needs real clearance
            under it or it reads as cropped by the panel edge. */}
        {/* ⚠️ `overflow-hidden` is LOAD-BEARING, not tidiness. The contact form's glow
            (`bg-glow-form`, in `ContactPanel`) is deliberately larger than the panel
            it sits behind — `-inset-block`, so 80px past every edge — because a
            backdrop-blur needs texture reaching beyond its own box. Unclipped, that
            80px pushed the DOCUMENT 20px wider than the viewport and the whole page
            could be scrolled sideways. Found 13 Aug.

            Clipping here rather than on the glow's own wrapper on purpose: the glow
            keeps 50px of bleed past the form (the panel's `px-section-x`), and the
            selects' dropdowns stay well inside a panel this size. Clipped tighter,
            an open dropdown near the foot of the form would be cut off. */}
        <div className="overflow-hidden rounded-3xl bg-gradient-green px-section-x pb-block pt-section-y">
        <div className="flex flex-col gap-block">
          {/* Shared with the contact popup — see `ContactPanel`. The footer adds
              the logo and legal row beneath it; the popup adds a close control. */}
          <ContactPanel
            eyebrow={eyebrow}
            heading={heading}
            body={body}
            contacts={contacts}
            projectTypes={projectTypes}
            budgets={budgets}
            form={form}
          />

          {/* ⚠️ `w-3/4`. Figma's lockup is 1000 wide in the 1320 column — 75.8%,
              up from 854 (65%, `w-2/3`) before. The size goes on a WRAPPER rather
              than on `Logo`: its footer variant is `w-full`, and `cn` is a plain
              joiner, so a competing width class would be settled by stylesheet
              order rather than intent.

              ⚠️ NO `href`. With one, `Logo` wraps the svg in an `inline-flex` <a>
              that shrink-wraps — so `w-full` resolved against the link's intrinsic
              width and the lockup collapsed to its natural size, left-aligned. The
              component's own docs say to omit `href` for the decorative footer
              mark; the nav already carries the link home.

              ⚠️ SOLID `green-900`, mark AND wordmark — no opacity, no blend. It
              used to be the default lockup (green-300 diamonds, white wordmark) at
              `opacity-50 mix-blend-overlay`, which composited it into the gradient
              so it shifted as the panel darkened. That is gone: the frame now draws
              one flat colour, and a blend would fight it. `Logo` already takes
              `markClass`/`textClass`, so this needed no change to the component.

              If the blend is ever wanted back, the note that mattered was: opacity
              and `mix-blend-*` interact rather than stack — opacity creates its own
              stacking context, so what gets composited is an already-transparent
              mark. Split them across two elements if it reads as a plain fade. */}
          <div className="w-3/4 self-center">
            <Logo variant="footer" markClass="text-green-900" textClass="text-green-900" />
          </div>
        </div>
        </div>

        {/* ── Legal ────────────────────────────────────────────────────────────
            ⚠️ OUTSIDE the green panel (Figma `Footer`, 177:26). It sits on the
            page background beneath it, full-bleed, with no divider rule — the
            panel's own edge now does the separating that the rule used to.

            It stays INSIDE the `<footer>` element: it is footer content, and the
            landmark should contain it even though it is outside the surface.

            ⚠️ `px-4xl` (40) INSIDE the footer's `px-gutter` (10) = 50 from the
            viewport. It is DELIBERATELY NOT the page's 60 optical line, which is
            where the frame draws it (`x=60`, and `px-section-x` is what would match
            it) — but it is close to it.

            It went 50 (the frame) → 24 → 40 on 13 Aug. The first pull-in was too
            far: this row sits outside the panel, on the page itself, so it should
            not align to the panel's *content* like copy that had fallen out of it —
            but at 34 from the viewport it had detached from the page's rhythm
            entirely. 50 sits just inboard of the optical line: clearly page
            furniture, still visibly related to everything above it.

            ⚠️ `pb-xxs` (2) on top of the footer's `pb-gutter` (10) = 12 beneath the
            text. The 2 is not arbitrary rounding — it is the difference between the
            legal row sitting ON the page's bottom frame and sitting just inside it.

            ⚠️ `ink-600`, not `green-100`. The row has moved from a dark panel to
            the warm page, so the tone that was 15:1 there would be invisible here.
            This is the site's sub-copy tone on light. The whole 600/700/800
            argument from earlier in the day is moot — it was about legibility on
            the gradient, and the row is not on the gradient any more. */}
        <div className="flex flex-wrap items-center justify-between gap-x-lg gap-y-sm px-4xl pb-xxs pt-md text-body-sm text-ink-600">
          <span>{legalLeft}</span>
          {/* The lead-in stays regular; only the studio name is bold. Two spans
              rather than a `<strong>` around part of a string, so the weight is a
              rendering decision here and not markup living in `content.ts`.
              `text-body-sm-strong` is the token — not a bare `font-bold`, which
              would set weight without the matching tracking. */}
          <span>
            {legalRight.prefix}
            <span className="text-body-sm-strong">{legalRight.name}</span>
          </span>
        </div>
      </footer>
    </>
  );
}
