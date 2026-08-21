# CLAUDE.md — Otix Studio build guardrails (v2)

Hard rules for building this site. They override defaults and inference. If a design detail seems to require breaking one of these, **STOP and flag it** — do not work around it.

Stack: Next.js · TypeScript · Tailwind CSS · Sanity (CMS wired later). Tokens live in `tailwind.config.ts` / `DESIGN_TOKENS.md` — that is the only place raw values exist.

> **This is the v2 build** (green / neutral / ink). The v1 teal-navy build is finished and archived — git tag `v1-teal-navy` and the gitignored `_archive-v1-teal/` folder. **Never copy a value, colour or class out of the archive.** It is reference for *structure and logic only*; every visual decision in it is superseded.

---

## Spec pack — always consult before building

This repo carries a spec pack that is the **contract** for the build. Before writing or changing any code, read the relevant docs below and follow them exactly. They override inference. If code and a spec doc disagree, the spec doc wins — fix the code or STOP and flag the conflict. When a decision changes, update the doc in the same change so the pack never goes stale.

- `DESIGN_TOKENS.md` — every colour, type, spacing, radius, sizing and motion token. Source for all values. ✅ **v2**
- `CLAUDE.md` — these guardrails. ✅ **v2**
- `COMPONENTS.md` — component inventory: variants, states, tokens, content props. ✅ **v2** *(D3 confirmed; D4 built — every entry now records what was actually built)*
- `RESPONSIVE_SPEC.md` — per-section mobile reflow decisions. ✅ **v2, APPROVED 12 Aug.** There is no mobile design in Figma, so it began as proposal; the PROPOSED rows are now contract and keep their label only to record that they came from reasoning, not a drawing. §5.1 Hero and §5.10 Pricing still want real frames.
- `MOTION_SPEC.md` — the asymmetric motion language, per-component choreography, the three invented interactions, scroll behaviour, reduced-motion. ✅ **v2** *(D6 — replaces the v1 file entirely; nothing carried across unexamined)*
- `CMS_READINESS.md` — editable vs structural per component; basis for Sanity schemas. ✅ **v2** *(D7 — replaces the v1 file; §3 is the actionable list of `content.ts` shape fixes D8 must make)*
- `content/content.ts` — all homepage copy (verbatim from Figma), passed to components as props.
- Section prompts *(D8)* and the Playwright verification pass *(D9)*.

**Figma is the source of truth for all tokens.** File `8MlsF0YwRlv2PYgaRP0cgb`, frame `[D] Homepage` (`36:34`). Its variable collections and styles are *exported* into `tailwind.config.ts` — not interpreted. The file has no remote style dependencies; every style in it is local.

---

## 0. LAYOUT — the global rule (most important)

**The site is FULL WIDTH. There is no container, no centred wrapper, no max-width ceiling. Ever.**

- No `max-w-*` container, no `mx-auto` page wrapper, no 1440/1600/1800 ceiling.
- The page sits inside a **gutter**: `10px` desktop/tablet, `5px` mobile. Use the `gutter` token (`var(--space-gutter)`), never `inset-x-0`.
- The gutter is a **page-level frame**, not section padding. Sections keep their own vertical rhythm via `section-y` / `block`.
- Every horizontal measurement from Figma is a **proportional reference only** — translate it to a fluid equivalent (`%`, `fr`, `clamp()`, `minmax()`). The 1440px Figma frame is never reproduced as a fixed width.
- **Only exception:** long-form body copy is capped at `max-w-measure` (68ch, the 65–75ch rule) for readability — even though its container is full width.

### 0.1 Section geometry — two variants, one optical line

Every section is one of two kinds. Both land content on the **same 60px optical line**. This is deliberate compensation for the gutter, **not drift** — do not "fix" it by unifying the values.

| Variant | Gutter | Horizontal | Vertical | Applies to |
|---|---|---|---|---|
| **Containered** | yes (10px) | `section-x` (50) | `section-y` (100) | sections that draw a **surface** |
| **Flush** | none | `section-x-flush` (60) | `section-y-flush` (120) | sections with **no surface** |

`10 + 50 = 60` · `0 + 60 = 60`

**What decides it is whether the section paints a surface, not where it sits in the
page.** A section with a fill (and its 30px radius) is inset by the gutter so the
panel floats; a section that sits directly on the page background is full-bleed and
carries the whole 60 itself. Either way content lands on the same optical line.

Measured from the Figma frame — sections are `x=10, w=1420` when containered and
`x=0, w=1440` when flush:

| | Sections |
|---|---|
| **Containered** *(fill + radius 30)* | Work · Pricing · Footer |
| **Containered** *(no section fill — the `Card` is the surface)* | Banner 2 |
| **Flush** *(no surface)* | **Hero** · About · **Services** · Process · Testimonials |

> ⚠️ **Services went Flush → Containered → Flush, all on 13 Aug, and it is FLUSH.**
> It briefly painted `gradient-services` inset by the gutter, which by the rule above
> made it containered (`10 + 50`); that panel was removed when the section went back to
> the page cream, so it paints no surface and carries the whole 60 itself (`0 + 60`).
> The note that recorded the first move outlived the second and is deleted with this
> correction — **the surface decides, and the surface changed back.**
>
> ⚠️ **Both branches, since 13 Aug.** The phone build briefly kept the green panel after
> desktop dropped it; it has been rebuilt to match, so Services is FLUSH at every width
> and the section paints no surface anywhere. See `RESPONSIVE_SPEC.md` §5.4.
>
> ⚠️ **`find-your-fit` is a section in its own right on mobile** — panel 07 is lifted out
> of Services below `md` rather than sitting inside it. It is flush too: the CARD is the
> surface, not the section.
>
> WhyOtix is gone: its quiz became panel 07 of the Services reel. Banner 1 was deleted
> — its image is that panel's background.

> ⚠️ **Corrected 12 Aug (D8).** This table previously read "Containered: every
> section except the Hero / Flush: Hero only". That was wrong, and it is a silent
> 10px error rather than an obvious one — a flush section built as containered
> lands its content on 50 instead of 60 and simply looks very slightly off. The
> About section shipped with exactly that bug and was corrected.

If a new section is added, it follows its **surface**: fill → containered, no fill
→ flush.

---

## 1. Values — tokens only

- **No hex** outside `tailwind.config.ts`. Always a token (`bg-green-600`, not `bg-[#315c4a]`).
- **No arbitrary Tailwind values.** No `mt-[37px]`, no `bg-[#0a0a0a]`, no `w-[1440px]`, no `text-[80px]`. Every spacing, size, colour, radius and duration is a named token. Enforced by ESLint (§6).
- **No fixed-px containers or columns.** Layout widths are fluid only: `%`, `fr`, `clamp()`, `minmax()`, `flex-1`. Fixed px is allowed only for genuinely fixed things already tokenised (icon sizes, the gutter, hairline borders).
- Type and structural spacing come from the **named fluid tokens** (`text-h1`, `p-section-y`, …) — never hand-rolled `clamp()` in a component.

### 1.1 The three colour scales

They are **not interchangeable** — each has a job:

- `green-*` — the brand. Eyebrows, italic accent words, CTAs, dark surfaces.
- `neutral-*` — **warm** (hue 40°). Page and section backgrounds only.
- `ink-*` — **pure grey, 0% saturation**. Text only. Never use `neutral-*` for body text; warm-on-warm reads muddy, which is exactly why the two scales differ.

`neutral-0` (#FFFFFF), `neutral-50` (#FBFBFA) and `ink-50` (#FAFAFA) are three different colours and all three are in use. Do not consolidate them.

### 1.2 Type faces — strict usage

| Token | Face | Allowed use |
|---|---|---|
| `font-sans` | Manrope | everything by default |
| `font-mono` | Geist Mono | **eyebrows only** |
| `font-serif` | Adelle *Regular Italic* | **accent words inside headings only** |

> ⚠️ There is no `font-serif-condensed`. It existed for the Services reel's oversized
> numerals, which no longer exist, and could never have been right anyway: the kit
> ships adelle-condensed in italic 600/700 only while the design uses italic 400.
> Removed 13 Aug.

⚠️ **Adelle replaced Libre Baskerville on 13 Aug.** It is served from **Adobe Typekit** (kit `nzb3tlw`, loaded by a `<link>` in `app/layout.tsx`) — the ONLY font on the site that is not self-hosted, and therefore the only one that can fail to arrive. Georgia is the fallback.

The kit carries adelle 300/400/600 in roman and italic, but the design uses exactly **one face: italic 400**. The weight lives on the accent TYPE tokens (`h1-accent`, `h2-accent`, `numeral`), so anything using `font-serif` with a different size token inherits that token's weight and can silently land on a different Adelle face — a different face, not a heavier rendering of the same one.

⚠️ **Semibold (600) was trialled and reverted on 13 Aug.** At the accent sizes (60–200px) it matched Manrope's weight instead of sitting under it, so the italic stopped reading as an aside. If it is ever revisited, the change is those three tokens plus the `font-normal` on `Nav`'s menu numerals.

Geist Pixel is **removed** from the build.

---

## 2. Content — CMS-ready from day one

- **No hardcoded copy inside components.** Every string, image and list is passed in as **props** from `content/content.ts`. Components are pure presentation.
- Homepage copy in `content.ts` must be the **exact copy from Figma, verbatim** — do not paraphrase or "improve" it. (The one exception: testimonials copy, which is written fresh.)
- Copy carries over unchanged from v1. Re-verify each section's strings against the v2 Figma frame during D8 assembly; flag any that have changed rather than silently editing.
- Prop shapes are the contract — Sanity schemas are derived from them later. Layout logic never goes into content; content only.
- **Headings with an italic accent word** are stored as segment arrays, not raw strings with markup — so the CMS can express the accent without HTML.

---

## 3. Components

- **Assemble from existing components only.** If a section needs something that doesn't exist yet, **STOP and flag it** — never build a new component inline inside a section.
- **Frame name = component name = file name = section id.** One name, everywhere, from the Figma frame. *(Exception on record: the Figma frame `36:241` is misnamed "WORK" but is the **WhyOtix** section. Use `WhyOtix`.)*
- Consolidate repeats: one component with props, not two that differ only in content. Banner is a **Card variant**, not its own component.
- Every component works at **any width** — none assumes a fixed container.
- Every component takes content as props and handles all its states (default, hover, active, focus, disabled, loading, empty) — the `Cta` and `Nav` are the highest-craft pieces.

The confirmed inventory is **D3 / `COMPONENTS.md`**. Do not infer it from the v1 archive — v1 had 14 sections, v2 has 11 (Quotes ×2 and FAQs are cut), so `Quote`, `QuoteMark` and `AccordionItem` are **not** part of v2.

**Carried over from v1 unchanged** (design-agnostic logic only): `useRevealed`, `Carousel`, and the IntersectionObserver reveal patterns.

---

## 4. Styling architecture — one system

- Styling is **Tailwind utility classes driven by tokens**. No per-section CSS.
- **No CSS Modules.** No `hero.module.css`, no per-component stylesheet.
- **No styled-components, no CSS-in-JS.**
- There is **ONE** CSS file: `globals.css`. It contains only: font loading, `@tailwind` directives, the CSS custom properties (incl. the `--space-gutter` breakpoint step), the reset, and the **few keyframes Tailwind can't express**.
- If something feels like it needs its own stylesheet, that's a signal the **token layer is missing something**. STOP and say so — do not add a stylesheet as a workaround.

### 4.1 Elevation

Four treatments, all tokenised. Do not invent a fifth.

| Token | Use |
|---|---|
| `shadow-elevated` | cards, hero carousel — a 4-layer stack whose last layer is a hairline ring |
| `shadow-sunken` | form inputs (inset) |
| `shadow-glass` + `backdrop-blur-glass` | eyebrow pills |
| `backdrop-blur-nav` | the nav bar |

> ⚠️ `shadow-glass` / `backdrop-blur-glass` **approximate** Figma's `GLASS` material effect, which has no CSS equivalent. This is the one token in the system that is an interpretation rather than an export — verify it against the Figma render and flag if it can't be matched.

---

## 5. Accessibility & media baseline

- **Visible focus** on every interactive element (`shadow-focus` token) — must not depend on the hover animation.
- Semantic HTML; correct, single `<h1>` and logical heading order per page.
- **Tap targets ≥ 44px** (`min-h-tap`).
- **`prefers-reduced-motion` respected** everywhere — colour changes may remain; expansions, loops and scroll reveals must not.
- Images: `width: 100%` + `aspect-ratio` + `object-fit: cover`. **Never fixed heights.**
- Decorative media (hero video, card imagery) is safe to remove — it must never carry meaning.
- The nav, while fixed, respects the gutter (`10px`/`5px` offsets via the `gutter` token, not `inset-x-0`) and never hides while the mobile menu is open.
- **Contrast:** the warm page (`neutral-100`) with `ink-600` sub-copy is the tightest common pairing — check it holds AA at every size it's used, and never put `ink-400`/`ink-500` on `neutral-*` for anything other than placeholder text.

---

## 6. Enforcement — ESLint bans arbitrary values

Drift is caught mechanically, not by eye. `eslint-plugin-tailwindcss` is installed and CI fails on arbitrary values. The live config is `eslint.config.mjs`:

```js
import tailwind from "eslint-plugin-tailwindcss";

export default [
  { ignores: ["_archive-v1-teal/**"] },        // v1 archive is not linted
  ...tailwind.configs["flat/recommended"],
  {
    settings: { tailwindcss: { config: "tailwind.config.ts", callees: ["clsx", "cn", "cva"] } },
    rules: {
      "no-restricted-syntax": [
        "error",
        { selector: "Literal[value=/-\\[[^\\]]+\\]/]", message: "No arbitrary Tailwind values — add a token to tailwind.config.ts instead." },
        { selector: "TemplateElement[value.raw=/-\\[[^\\]]+\\]/]", message: "No arbitrary Tailwind values — add a token to tailwind.config.ts instead." },
      ],
      "tailwindcss/classnames-order": "warn",
      "tailwindcss/no-contradicting-classname": "error",
    },
  },
];
```

If a real value is missing, the fix is **add a token** (in Figma *and* here), never an inline arbitrary value.

`next dev` does not run ESLint, so this never blocks local development — it runs on `npm run lint` and `next build`.

---

## 7. Build order (do not deviate)

1. **D1 Tokens** ✅ — exported from Figma
2. **D2 Guardrails** ✅ — this file
3. **D3 Component inventory** (list only, no code)
4. Strip the v1 visual layer from the repo
5. **D4** Build every component in isolation — all variants and states — on `/dev/components`
6. **D5–D7** Responsive, motion and CMS specs
7. **D8** Assemble the homepage section by section from approved components
8. **D9** Playwright verification pass

Nav sticky behaviour, the CTA hover mechanic, and the hero video are **specified** in the brief — build to spec, don't invent. Motion values come from the motion tokens and D6.

---

## 8. Working practices

- **A `tailwind.config.ts` change requires a dev-server restart.** `globals.css` and component edits hot-reload.
- **Do not run `git` from the agent sandbox.** It cannot delete files inside the mounted folder, so every git write leaves an orphaned `.git/*.lock` that blocks the next command. Version control is Jimmy's, run from his own terminal.
- Token changes are made in **Figma first**, then exported here — never the other way round.
