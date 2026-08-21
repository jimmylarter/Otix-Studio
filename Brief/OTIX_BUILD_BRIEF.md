# Otix Studio — Website Build Spec Pack

> **Status:** Brief for the spec-pack session (Cowork).
> **Lifespan:** The *process* instructions in this file are for one session. The *design decisions* are permanent — they get promoted into `CLAUDE.md`, `DESIGN_TOKENS.md`, and `RESPONSIVE_SPEC.md` as those deliverables are produced. Keep this file afterwards as a record of intent.

---

## Context

I'm Jimmy, a senior UI/UX designer. I'm building the Otix Studio website (my AI-first web design agency) with Claude Code.

**Stack:** Next.js, TypeScript, Tailwind CSS, Sanity CMS.

**Figma** (desktop only, no mobile design):
https://www.figma.com/design/kjttuAHwXTYbU8LVWYR2cM/Otix-Studio?node-id=1-3&t=hGxH7YbIKOhrdBi9-1

The designs are on the **🏠 Design** page/artboard. Work from that page only — ignore any other pages in the file (exploration, scratch, archive) unless I point you at them.

Before any build work starts, I need you to produce a spec pack that will live in the repo and act as the contract for the build. Do not write any site code in this session.

---

## HOW TO WORK WITH ME — OVERRIDES EVERYTHING BELOW

Produce **ONE deliverable at a time**. After each one, STOP and wait for my explicit approval before starting the next. Do not chain deliverables. Do not produce a deliverable I have not asked for yet.

The deliverable list below is **SCOPE, NOT A TASK QUEUE**. It's there so you understand the shape of the whole job — not so you execute it end to end.

Each stop is a **revision loop, not a rubber stamp**. I will request changes. Revise and re-present until I approve, then move on.

If you're unsure whether to continue, stop and ask.

---

## LAYOUT — GLOBAL RULE

> Read this first. It overrides any inference you make from the Figma frame width.

The site is **FULL WIDTH**. There is NO container max-width. NO centred content wrapper. NO 1440/1600/1800px ceiling. Ever.

The entire page sits inside a gutter on all four sides:

- **10px** left, right, top and bottom on desktop/tablet
- **5px** left, right, top and bottom on mobile

Everything else fills the remaining space edge to edge, at every viewport.

The Figma frame width is a **PROPORTIONAL REFERENCE ONLY**. It is not a container. Do not reproduce it as a max-width. Every horizontal measurement in the Figma file must be translated to a fluid equivalent — `%`, `fr`, `clamp()`, `minmax()` — never a fixed px width.

The gutter is one of the very few fixed px values in the system. Token it as `space-gutter` (10px desktop → 5px mobile).

The gutter is a **PAGE-LEVEL FRAME, not section padding**. Sections still have their own internal vertical rhythm via `space-section`. Do not apply the gutter to every section.

**The ONLY exception to full width:** body copy is capped at 65–75ch for readability, even though its container is full width. Long-form paragraphs do not run edge to edge.

---

## NAVIGATION — STICKY BEHAVIOUR

> Specified. Do not invent.

The nav is fixed to the top of the viewport and uses **hide-on-scroll-down, reveal-on-scroll-up**.

**Critical:** it must respect the page gutter **while fixed** — 10px from the left, right and top edges (5px on mobile). It does NOT go edge to edge. Use the `space-gutter` token for the fixed offsets — do not use `inset-x-0`.

### Behaviour

- Scrolling **down**: the nav hides (translates up and out).
- Scrolling **up**: the nav reveals immediately, regardless of scroll position.
- The nav background transitions to a solid colour once scrolled — it is not solid over the hero.

### This must not flicker

Naive implementations flap in and out on small scroll jitter or trackpad wobble. Required:

- A movement threshold before the nav changes state (propose a value)
- The nav **never** hides near the top of the page — define a safe zone
- The nav is always visible at scroll position 0
- Throttle/rAF the scroll listener — do not run state updates on every scroll event

### Specify for my approval

- Hide and reveal durations and easing. **Reveal should be faster than hide** — the user asked for it, so it should feel immediate.
- Background fade timing. It must NOT snap. Consider a subtle backdrop-blur.
- Handle the layout shift — going fixed removes the nav from flow. The page must not jump.
- Initial state over the hero: is the nav transparent? If so, link contrast must hold against the **worst frame** of the background video, not the average one.
- Mobile: same behaviour, plus how hide-on-scroll interacts with the open menu state. **The nav must NOT hide while the mobile menu is open.**

---

## HOMEPAGE SECTIONS

Figma frame names, in scroll order:

1. HERO
2. ABOUT
3. BANNER-1
4. SERVICES
5. WORK
6. QUOTE-1
7. WHY OTIX
8. PROCESS
9. BANNER-2
10. QUOTE-2
11. PRICING
12. TESTIMONIALS
13. FAQS

Plus **LAYOUT components** — not homepage sections. These live in `layout.tsx` and appear on every page:

- NAV
- FOOTER

### SHARED COMPONENTS — note this

BANNER-1, BANNER-2, QUOTE-1 and QUOTE-2 are **the same design with different content**. Build ONE component with a content-driven variant, used four times. Do not build four separate sections.

More broadly: before proposing the component inventory, look for repeated patterns across sections and consolidate them. If two sections share a layout and differ only in content, that's one component with props — not two components. Flag every consolidation you find and let me confirm it.

Frame names in Figma are the source of truth — the same name is used for the component, the file, and the section ID. **One name, everywhere.**

---

## BUILD ORDER

Do not deviate.

1. Tokens
2. Component inventory (list only)
3. Build every component in isolation, all variants and states
4. Assemble homepage section by section from approved components

---

## CTA HOVER

> Specified. Do not invent.

The primary CTA contains an arrow icon inside a filled circle, sitting within the button. This is the hover mechanic — do not propose an alternative.

### On hover

The circle **expands to fill the entire CTA**. The button's final hover state is the circle's colour, edge to edge. The fill originates from the circle's actual position — it is not a background fade or a left-to-right wipe. The circle scales up from where it sits.

Simultaneously, the arrow icon animates **continuously left to right**: it travels right, exits the icon area, and a second arrow enters from the left to replace it — reading as a continuous loop, not a single nudge. Mask the icon area so arrows are clipped at the boundary.

### Motion feel

Expansion is **fast and confident with a slight elastic overshoot** — spring-like, not linear, not a plain ease. The retraction on hover-out is **slower and softer** than the expansion. This asymmetry is deliberate: it's what makes the interaction feel expensive rather than bouncy.

Propose exact durations and cubic-bezier/spring values for my approval — do not just pick defaults. Show me the easing curve reasoning.

### Also specify

- **Label colour transition** — the text must stay legible throughout the expansion, including mid-transition when the fill is partially covering it
- **Active/press state** — distinct from hover
- **Focus-visible state** — must be clearly visible and must not rely on the hover animation
- **Touch** — there is no hover on mobile. Specify what a tap looks like. The arrow loop should not run permanently on mobile.
- **prefers-reduced-motion** — the colour change may remain; the expansion and arrow loop must not

---

## ASSETS

### Hero background video

The hero has a full-bleed background video. **Figma cannot represent this** — it will read as a static image. Do not build it as one.

The video loops continuously. It is decorative and ambient — no narrative, no sound, nothing to seek or scrub. No controls, no sound toggle.

Treat the video as a design decision, not a technical detail. Come back to me with a spec covering:

- **Poster frame** — what shows before load / on slow connections
- **Fallback** — for `prefers-reduced-motion`, blocked autoplay, and mobile
- **Mobile** — do we serve video at all, or a static poster?
- **Encoding, format and a file-size budget** — this is the biggest LCP risk on the site
- **A seamless loop point** — no visible jump on repeat
- **Overlay / scrim treatment** — contrast for the headline AND the nav links must hold on the **worst frame** of the video, not the average one
- **`object-fit: cover` crop behaviour** at full width — where's the safe area across viewports?

Autoplay requires `muted` + `playsinline`. Video is decorative — it must never carry meaning, and it must be safe to remove entirely. **The site must still look premium with the poster frame alone.**

I'll supply the video file and poster before the hero is assembled.

### Logo

I'll supply the logo as an **SVG**. Inline it as a React component — not an `<img>` tag — so it inherits `currentColor` and can be animated. Use my file; do not trace or regenerate from the Figma export.

### All other assets

Export from Figma locally up front. **Figma asset URLs expire after 7 days.**

---

## CMS APPROACH

Sanity is **NOT wired up in this phase**, but the build must be CMS-ready from the start.

Every component receives its content as **props** — no hardcoded strings inside components, ever. Homepage content lives in a local `content.ts` during the build. Sanity schemas will be derived afterwards from the established prop shapes, so the component API effectively becomes the schema.

**Layout logic never goes into the CMS — content only.**

---

## DELIVERABLE 1 — `DESIGN_TOKENS.md` + `tailwind.config.ts`

The Figma file uses **colour styles and text styles, not variables**. That's fine — read the styles via the Figma MCP and map them directly to tokens, preserving the style names. Token names in code should match the style names in Figma.

**Spacing, radius and sizing are NOT styled in the file.** For these:

1. Audit every distinct value used across the design
2. Show me the distribution — each value and how often it appears
3. Propose a **rationalised scale** — not one token per value found
4. Flag outliers so I can decide whether they're intentional or drift
5. If the file turns out to be very loose (30+ distinct spacing values, no discernible rhythm), tell me — I'd rather fix Figma than tokenise chaos

**Do not invent a scale silently.** STOP and get my approval on the scale before writing any token files.

### Token rules

- All type and spacing tokens are **named fluid tokens containing `clamp()`** (e.g. `text-display`, `text-h1`, `space-section`) so I never write arbitrary Tailwind values
- Letter-spacing in `em`, not px, so tracking scales with type size
- Line-heights unitless
- Include structural fluid tokens: `space-section`, `space-block`
- `space-gutter` is a fixed exception: 10px desktop, 5px mobile
- Include sizing tokens: the `ch` cap on body copy, icon sizes
- Include motion tokens: durations and easing curves, including the CTA hover spring and the nav hide/reveal
- **Do NOT create a container max-width token. There is no container.**

---

## DELIVERABLE 2 — `CLAUDE.md` (hard guardrails)

- The **LAYOUT GLOBAL RULE** above is the first and most important rule.
- No container max-width. No centred wrapper. Full width, always.
- No fixed-px containers or columns. Fluid only: `%`, `fr`, `clamp()`, `minmax()`.
- No hex values outside the token layer. Always token reference.
- No arbitrary Tailwind values. No `mt-[37px]`, no `bg-[#0a0a0a]`.
- No hardcoded content strings inside components. All copy is passed in as props from `content.ts`.
- Body copy capped at 65–75ch regardless of viewport width.
- Images: `width: 100%` + `aspect-ratio` + `object-fit: cover`. Never fixed heights.
- Tap targets minimum 44px.
- Accessibility baseline: visible focus states, semantic HTML, correct heading order, `prefers-reduced-motion` respected.

### Styling architecture — one system, not per-section styles

- Styling is **Tailwind utility classes driven by tokens**. Do NOT write per-section CSS.
- **NO CSS Modules.** No `hero.module.css`, no `services.css`, no per-component stylesheet.
- **NO styled-components, no CSS-in-JS.**
- There is **ONE CSS file: `globals.css`**. It contains font loading, `@tailwind` directives, CSS custom properties, the reset, and only the keyframes Tailwind cannot express (CTA spring, arrow loop).
- Anything that feels like it needs its own stylesheet is a signal the **token layer is missing something**. STOP and tell me — do not create a stylesheet as a workaround.

Add an **ESLint rule banning arbitrary Tailwind values** so drift is caught mechanically, not by eye.

---

## DELIVERABLE 3 — Component inventory

Derived from the named Figma frames above. **Homepage components only** — do not try to predict the whole site. We extend the layer when we get to the other pages.

Consolidate repeated patterns (see SHARED COMPONENTS above).

For each component: name, variants, states, where it's used, which tokens it consumes, and its content props.

---

## DELIVERABLE 4 — Build the component layer

Build each component **in isolation** with every variant and state: default, hover, active, focus, disabled, loading, empty.

Every component takes content as props. Nothing hardcoded. Every component must work at any width — no component assumes a fixed container.

**The primary CTA and the NAV are the highest-craft components on the site** — build them to the specs above, and expect me to iterate on the motion.

Render them all on a **`/dev/components` review page** — every component, every variant, side by side — so I can approve the layer in one pass before any section is assembled. This page stays in the repo as a regression check.

---

## DELIVERABLE 5 — `RESPONSIVE_SPEC.md`

There is no mobile design. **Do NOT invent one.** Surface the decisions and let me make them.

Walk me through mobile section by section. For each section, give me the reflow options with a recommendation and the trade-off, I choose, you write up the decision.

Cover at minimum:

- **NAV** — open menu state, overlay vs drawer, and how it interacts with hide-on-scroll
- **PRICING** — four tiers with tabbed switching. This does not survive a naive vertical stack. Give me real options (swipe carousel, accordion, sticky tier selector).
- **HERO** — visual placement relative to headline, display type drop, and whether the background video is served on mobile at all
- **WORK and TESTIMONIALS** — carousel, stack, or horizontal scroll
- **PROCESS** — how a stepped/numbered sequence reflows vertically
- **FAQS** — accordion behaviour and tap targets
- **Column stack order per section** — which column wins when they collapse (rarely just left-to-right)
- **Sticky CTA** — yes or no

Fluid `clamp()` scaling handles most sizing. Breakpoints are for **structural layout changes only**, plus the gutter step-down from 10px to 5px.

---

## DELIVERABLE 6 — Motion + states spec

Figma is silent on all of this, and **invented motion is where "generic AI website" creeps in**. Specify explicitly, for my approval:

- **NAV** — hide/reveal timing, threshold, background fade (per the NAVIGATION section above)
- **CTA hover** — exact durations, easing/spring values, and the arrow loop timing (per the CTA HOVER section above)
- **Hero video** — load sequence, poster-to-video transition, loop, fallback states
- All other **hover states** and their timing/easing
- **Scroll reveal** behaviour (IntersectionObserver, thresholds, stagger)
- **FAQS** accordion open/close motion
- **PRICING** tab switch transition
- **Page transitions**
- **Loading and empty states**
- **`prefers-reduced-motion` fallbacks**

---

## DELIVERABLE 7 — `CMS_READINESS.md`

Per component: what's intended to be editable content vs what's structural.

I'm the only editor — **don't design a page builder for an audience of one.**

- **Likely editable:** hero copy, about, services, work items, quotes, banners, pricing tiers and features, testimonials, FAQs
- **Likely structural:** navigation, footer layout, section order

This document becomes the basis for the Sanity schemas later.

---

## DELIVERABLE 8 — Section prompts

One prompt per homepage section, ready to hand to Claude Code. Each covers: layout, components used, content props, mobile reflow, motion, states.

**Rule baked into every section prompt:** assemble from existing components only. If a section needs a component that doesn't exist, STOP and flag it — do not build it inline.

---

## DELIVERABLE 9 — Verification pass

A **Playwright script** that screenshots each built section and compares it against the exported Figma frame.

Because the site is full width and the Figma frame is not, compare at the Figma frame's width (e.g. 1440px) for proportional fidelity — then **also screenshot at 1920px and 2560px** to confirm the layout scales rather than breaks or centres. Output a written list of deviations.

This runs after every section is assembled — **the build gets verified against the design, not just instructed by it.**

---

## START HERE — DO NOT PRODUCE ANY DELIVERABLES YET

Read the Figma file, then come back to me with:

1. What colour and text styles exist, and anything that isn't styled
2. The spacing/radius/sizing distribution and your proposed rationalised scale
3. Anything ambiguous or undefined in the design
4. Your proposed component inventory, including any consolidations you've spotted

**That's all. STOP there and wait for my approval before producing any files.**
