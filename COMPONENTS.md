# COMPONENTS.md — Otix Studio v2

**Deliverable 3.** The confirmed component inventory. **List only — no code.**
Derived by walking all 11 section frames in Figma (`36:34`), not inferred from v1.

Rules that govern this list are in `CLAUDE.md` §3. In short: assemble sections from
these components only; if a section needs something not listed here, **STOP and flag
it**. Frame name = component name = file name.

**20 components.** 5 shared, 5 cards, 4 form/interactive, 6 structural/utility.
Plus one **deferred** (`StatChart`, §5).

> **Not in v2:** `Quote`, `QuoteMark`, `AccordionItem` — the Quote ×2 and FAQ
> sections were cut. Do not port them from `_archive-v1-teal/`.

---

## Legend

**Tokens** column lists the *distinctive* tokens only — every component uses the
type and spacing ramp by default. **States** must all be built in D4 even where the
Figma file only shows the default.

---

## 1. Shared — used across sections

### `Logo`
| | |
|---|---|
| Figma | `Logo Container` → `Logo Icon` (4 diamonds) + `Logo Text` (`otix` + `studio`) |
| Asset | `Supplied Files/otix-studio-logo.svg` — **updated 12 Aug** |
| Used in | Hero nav, Footer |
| Variants | `nav` (24px ref) · `footer` (150px ref) |
| States | default, hover *(nav only — links home)* |
| Variants | `nav` · `footer` · **`mark`** — ⚠️ **ADDED 13 Aug**: the four diamonds alone, cropped square, decorative. Used as the oversized watermark behind the Services reel. |
| Tokens | `green-300` (mark) · `neutral-0` (wordmark) · `w/h-watermark` |
| Props | `variant`, `href` |
| ⚠️ The `mark` viewBox is derived, not eyeballed | `-0.199 0.325 23.352 23.352` — the group's bounds **padded by one unit a side**, because `stroke` is centred on the path so half the 1.8768 width lies outside them. Cropped to the bounds exactly, each diamond's outer corner arrives flat: invisible at nav size, ~32 real pixels at watermark size. If the stroke width changes, the padding changes. Each rect is a 5.5088 square rotated 45° **about its own top-left corner**, which puts the group's real bounds well off the origin. Cropping to exactly the group's box is what lets it rotate about its own centre without wobbling — the full `0 0 139 24` lockup viewBox cannot. |
| ⚠️ `mark` is announced as nothing | `aria-hidden`, no `role`, no `aria-label`. The page already has the lockup in the nav and the footer; a decorative watermark naming the brand a third time is noise. |
| Notes | Ship as **inline SVG**, not `<img>` — the colours must be tokenisable. Source is `139×24`: four rotated `<rect>` diamonds stroked `#98C3B1` (= `green-300`, stroke-width 1.877, rx 0.33) plus two `<path>` filled `white` for the wordmark. **Convert both to `currentColor`/token classes on import** so the lockup can flip per surface. The wordmark is outlined vector, not live text — deliberately outside the type system. |

### `Eyebrow`
| | |
|---|---|
| Figma | `Overlay+Border` — 15 uses across 8 sections |
| Used in | every section except Banner |
| Variants | `light` (green-600 on warm bg) · `dark` (**green-300** on dark) |
| States | default *(static — not interactive)* |
| Tokens | `rounded-xl` (20) · `shadow-glass` · `backdrop-blur-glass` · `border-on-dark` · `text-eyebrow` (Geist Mono 13, 0.1em, uppercase) |
| Props | `label`, `variant` |
| Notes | ⚠️ The glass treatment **approximates** Figma's `GLASS` effect — verify against the render (CLAUDE.md §4.1). **Text-only — deliberately no icon variant.** The 50×50 icon circle that shares this surface lives inside `ContactRow`; see §7 decision 1. **Two variants, not three** — the `accent` variant listed here until 13 Aug never existed in code. |
| ⚠️ The two variants are not one colour at two lightnesses | `dark` went neutral-0 → **green-300** on 13 Aug (Hero, the three Pricing tier pills, the Footer/contact header) so the pill carries the brand tint on dark ground. `light` did **not** follow it and cannot: measured on the real translucent fill, green-300 on the warm page is **1.39:1** — invisible — against green-600's 5.44:1. Dark went 14.96:1 → **7.67:1** on green-950, 6.47:1 at the gradient's light end. Both still AA. Measure before touching either; the pill's translucent fill means neither ratio is readable off the token names. |

### `Cta`
| | |
|---|---|
| Figma | `Link` — 8 uses across 4 sections |
| Used in | Hero nav, Work, WhyOtix, Pricing (×4), Footer |
| Variants | `dark` · `light` · `full-width` (Footer + TierCard) |
| States | **default, hover, focus, active, disabled, loading** |
| Tokens | `rounded-full` · `text-label` (14, 0.06em, uppercase) · `min-h-tap` · `shadow-focus` |
| Props | `label`, `href`, `variant`, `fullWidth?`, `type?` |
| ⚠️ `type="submit"` | Added 13 Aug. ⚠️ **Currently unused** — it was added for the Quiz's email step, which was then cut; kept because a form needing the real CTA as its submit control will come up again (the footer form is the obvious next one). A form needs the real CTA as its submit control — wrapping this in another `<button>` is invalid HTML and breaks keyboard activation. Ignored when `href` is set. **In a `flex-col` parent it also needs `self-start`**, or the parent's default `align-items: stretch` overrides the pill's own `w-auto` and spreads it across the container. |
| Notes | Structure is label + a 36px circle holding an arrow icon. **Highest-craft piece** — the circle-expand hover mechanic is specified in the brief and D6, do not invent. Widths observed 160 / 198 / 358 / 700 — all fluid, never fixed. |

### `ContactPanel`
| | |
|---|---|
| Figma | the block shared by `FOOTER` (36:605) and `POPUP CONTACT` (126:2) |
| Used in | Footer · ContactPopup |
| Props | `eyebrow`, `heading[]`, `body`, `contacts[]`, `projectTypes[]`, `budgets[]`, `form`, `headingId?` |
| Notes | **Built ✅ (D8).** Extracted rather than copied: the popup frame *is* the footer's block minus the logo and legal row, on the same gradient at the same radius — one thing appearing twice, which CLAUDE.md §3 says consolidates. A field added to the form now appears in both, and the two cannot drift into subtly different forms, which is what happens when a modal is built by copying the footer that inspired it. Renders **no surface of its own**: each parent supplies gradient, radius and padding, because a page-width panel and a dialog need different ones. |

### `ContactPopup`
| | |
|---|---|
| Figma | `POPUP CONTACT` (126:2) — 1420×818, radius 30, gradient fill, close at 1322,52 |
| Used in | mounted once in `app/page.tsx` |
| States | closed · sliding in · open · sliding out |
| Props | same as `ContactPanel` less `headingId` |
| ⚠️ How it opens | By **intercepting clicks on `a[href="#contact"]`**, not by threading a callback through every CTA. That order matters: those stay REAL links to the footer, so before hydration or without JS "Start Project" still reaches the contact form — the dialog is an enhancement on top. A callback would have replaced a working link with a dead button. One delegated listener also means a CTA added later is wired by writing the same href. |
| ⚠️ Modal obligations | `role="dialog"` + `aria-modal`, named by the panel's heading via `aria-labelledby` (pointing at visible text rather than an `aria-label` that drifts when the copy changes) · Escape closes · body scroll locked while open · focus moves to the close button and **returns to the CTA that opened it**, without which a keyboard user is dropped at the top of the document. |
| ⚠️ Mount then animate | Open sets state, and a `requestAnimationFrame` sets the visible state on the NEXT frame. A transition cannot run from a state the element was never painted in, so the two must be separate frames — otherwise it appears instead of sliding. Close mirrors it with a delay before unmount. |

### `Tag`
> **`mint` variant added (D8).** The card tag now inverts with the rollover: grey at
> rest, `green-300` once the copy is sitting on the image, label staying `ink-900`.
> ⚠️ It is a real **variant**, not a `bg-green-300` class from `Card`, because both
> are single classes and `green` is declared **before** `ink` in the colour scales —
> verified in the emitted CSS, `.bg-green-300` lands on line 557 and `.bg-ink-100`
> on 562, so the override would have silently lost. The hover override is fine only
> because `group-hover` adds a pseudo-class and outranks it; the banner's permanent
> state has no pseudo-class and must go through the variant.

| | |
|---|---|
| Figma | `Muted` — 8 uses |
| Used in | Work (6), Banner 1, Banner 2 |
| Variants | `light` · `dark` |
| States | default *(static)* |
| Tokens | `rounded-full` · `text-tag` (14, Medium, -0.02em) · `neutral-*` |
| Props | `label`, `variant` |

> ⚠️ **`ServiceCard` uses it for a QUESTION, not a category (13 Aug).** "Still running
> it on spreadsheets?" rather than "Web Apps". The component did not change — this is
> recorded because it widens what `Tag` MEANS: it is now "the small pill", not "the
> category pill", and a future variant should not assume the label is a noun.
>
> ⚠️ A second pill was hand-rolled inside `ServiceCard` first and removed. There is one
> pill component; anything pill-shaped goes through it, or the system has two.

### `SectionHeader`
| | |
|---|---|
| Figma | `Section Title` / `Section Heading` / `Header` / `Intro Frame` / `Testimonial Header` / `Subheading` — the same pattern under six names |
| Used in | About, Work, Services, WhyOtix, Process, Pricing, Testimonials, Footer |
| Variants | `left` · `center` (Process, Testimonials) · `split` (heading left, body + CTA right — Work, WhyOtix, Pricing) |
| States | default; scroll-reveal *(D6)* |
| Tokens | `text-h2` + `text-h2-accent` *(2px larger than `text-h2` — see DESIGN_TOKENS.md)* · `text-body-lg` · `gap-block` |
| Props | `eyebrow?`, `heading` *(segment array)*, `body?`, `action?`, `align` |
| Notes | **Heading takes a segment array**, not a string — so the italic accent word (`growth engines.`, `delivered.`, `Let's build.`) is expressible without HTML (CLAUDE.md §2). `eyebrow` and `body` are both optional — Process has no body, Testimonials has no CTA. |
| ⚠️ A trailing full stop is set in **Manrope** | Added 13 Aug. Adelle's period is a circle; every other full stop on the page is Manrope's rounded square, so left in the serif it was the one round dot in the design and read as a smudge. The component peels a trailing `.` off the accent segment and wraps it `font-sans not-italic`, **inside** the `<em>` so it keeps the accent's tracking and cannot wrap onto a line alone. Deliberately NOT split into its own content segment — that would put a typographic choice into the CMS payload (§2). The regex preserves an authored `\n` after the stop, which Work and Pricing both rely on. |

---

## 2. Cards

### `Card`
| | |
|---|---|
| Figma | `Article Card` → `Image` + `Article Details` → `Article Content` → (`Article Info` + `Article Description`) |
| Used in | Work (4), WhyOtix (2), Banner 1, Banner 2 |
| Variants | `narrow` (426 ref) · `equal` (648 ref) · `featured` (870 ref) · **`banner`** (full-bleed) |
| States | default, **hover (specified — see below)**, focus-within |
| Tokens | `shadow-elevated` · `rounded-md` (8, image overlay) · `rounded-3xl` (30, card) · `bg-scrim-green` |
| Props | `image`, `tag`, `title`, `description`, `stats?`, `variant`, `href?` |
| Notes | Composes `Tag` + `StatItem`. **Banner is a Card variant, not its own component** (CLAUDE.md §3). Work row 1 = featured + narrow; row 2 = two equal. |
| ⚠️ Image band = TWO tokens | Figma uses **270** for `narrow` and **300** for the wider `equal`. One token covering both split the difference and matched neither — `clamp(…, 300px)` only reached 300 at a 1553px viewport, leaving equal ~10px short at 1440 and narrow ~20px over. Now `h-media` (270) and `h-media-wide` (300); `equal` takes the wide one. |
| ⚠️ Featured copy position | **Settled 12 Aug: the copy stays at the TOP** of its column, with `mt-auto` pinning the stats to the bottom. It was removed → reinstated → removed again — do not reinstate the travel without asking. `transitionProperty.flex` went with it. |
| ⚠️ Featured scrim | **`scrim-green-right`**, a right-to-left ramp — not the bottom-right corner ramp it used to have. A corner ramp is built for copy that ends up bottom-right; against top-aligned copy it leaves the heading sitting on bare image. |

**Hover is designed, not invented — and each variant rolls over differently.**
Three `Rollover Example` frames give the hover state per variant. The shared idea is
*the image grows to full-bleed and the copy lifts onto it* — but **where** the copy
lands differs, so this is three layouts, not one mechanic at three sizes.

| Variant | Figma | At rest | On hover |
|---|---|---|---|
| `narrow` | `36:988` | image top band 416×**270**, copy below on the card | image **416×559** (full), copy overlays **bottom**, block grows 265→**289** |
| `equal` | `36:1041` | image top band 638×**300**, copy below on the card | image **638×559** (full), copy overlays **bottom**, block 241→**265** |
| `featured` | `36:998` | image **left half** 415×559, copy in a right column 445×559 | image **860×559** (full width), copy overlays as a **full-height right column** (445 wide), stats included |

`featured` is the meaningful outlier: at rest it is side-by-side, and on hover the
image slides under the copy column rather than the copy dropping onto a band.

**Ratios, not pixels.** Every figure above is measured at the 1440 frame and is a
**proportional reference only** (CLAUDE.md §0). The cards are fluid — the rollover
layout is bound to the *variant*, not to a viewport width, so a `featured` card keeps
its side-column rollover as it narrows. How each rollover behaves once there is no
hover (touch) and at mobile widths is **D5**; choreography is **D6**.

### `HeroArch`
> ⚠️ **Cards float (13 Aug)** — `animate-step-float`, the Process circles' animation,
> staggered by index into a wave. Needed `FLOAT_HEADROOM` inside the clipper (padding +
> equal negative margin) so the up-beat is not sliced off cards 1 and 5, which sit at
> `top: 0`. See MOTION_SPEC §4.5a.

| | |
|---|---|
| Figma | `Carrousel` (1440×630) inside `HERO` — **the layer name is misleading** |
| Used in | Hero |
| Variants | — |
| States | static; scroll/entrance reveal *(D6)* |
| Tokens | `rounded-2xl` · `shadow-elevated` |
| Props | `images[5]` |
| Responsive | 5 cards at `md`+; **middle 3 below `md`** with a wider spread — five cards on a phone are ~55px each. ⚠️ No mobile hero design exists; confirm in D5. |
| Notes | **NOT a carousel.** A static inverted arch of five cards — biggest in the centre, tops dipping toward the middle so the run hangs as a valley. Measured: 220×260 / 280×340 / 380×480 / 280×340 / 220×260, top offsets 0 / 80 / **150** / 90 / 0, gap 48. The run is **1572 wide against a 1440 frame**, so the outer cards deliberately crop off both viewport edges. Cards 2 and 4 are NOT mirrored (80 vs 90) — that asymmetry is in the design and is preserved. Geometry is expressed as percentages of the arch's own width, inline rather than tokenised: they are composition proportions for one bespoke arrangement, not reusable tokens. |

### `LiquidImage`
| | |
|---|---|
| Figma | — **not in the design** |
| Used in | HeroArch (all 5 cards) |
| States | idle · rippling · zoomed; falls back to a static image |
| Props | `src`, `alt?` |
| Notes | ⚠️ **INVENTED INTERACTION**, agreed with Jimmy — belongs in MOTION_SPEC.md as a deliberate addition. Hand-rolled WebGL (no three.js: the shader is ~30 lines, a 150KB library for one effect is not worth it). A radial wave emanates from the pointer with exponential falloff; the same eased `strength` also drives a 6% in-shader zoom, so the image expands **inside its frame** and the zoom cannot drift out of sync with the ripple. Falls back to a plain `<img>` under `prefers-reduced-motion`, on coarse pointers, or without WebGL — the fallback IS the rest state, so nothing is lost. |
| ⚠️ Context lifecycle | **The WebGL context is created on `pointerenter` and destroyed once the water settles — never on mount.** Browsers cap a *page* at ~16 live contexts and silently kill the oldest past that; a killed canvas paints as a broken "sad" icon. HeroArch alone renders 8 instances (5 desktop + 3 mobile, both in the DOM) and StrictMode double-mounts in dev, which blew the cap and killed the images. Two further traps found the hard way: `loseContext()` **permanently poisons the canvas element**, so each hover must build a *brand-new* `<canvas>` — freeing the context is not enough; and the texture must be uploaded with `UNPACK_FLIP_Y_WEBGL` (GL's origin is bottom-left, HTML's is top-left) — correct the inversion there, **not** by negating the pointer Y, which would leave the ripple tracking correctly on an upside-down image. The `<img>` is never faded out; the opaque canvas simply occludes it, because canvas removal is synchronous while React state is not and fading would race it into a white flash. |

### `RotatingWord`
| | |
|---|---|
| Figma | — **not in the design** |
| Used in | Hero (the `h1` accent slot) |
| States | typing · holding · deleting; static under reduced motion |
| Props | `words: string[]` |
| Notes | ⚠️ **INVENTED INTERACTION (D8), Jimmy's idea.** The accent word deletes and retypes through `harder / smarter / faster` with an editing caret — see MOTION_SPEC.md §4.4 for timings. `words[0]` is the **resting word**: server render, first paint and reduced-motion all show it, so it must match the Figma frame. |
| ⚠️ Layout | **The box hugs the word and the line reflows** — "than you do." slides in and out as characters come and go. Settled after two rejected alternatives (both pinned the box to the longest word so the sentence could not move: left-aligned, then right-aligned to also pin the caret). A fixed box leaves a visible hole whenever the word is short. The cost is accepted, not overlooked: the line is centred, so every keystroke shifts the words on **both** sides. To undo, use an `inline-grid` with an invisible sizer — not a `min-width`, which cannot know the font's metrics. |
| ⚠️ a11y | The animated span is `aria-hidden` with a static word exposed instead, so the `h1`'s accessible name never changes. |

### `StepCard`
> ⚠️ **Row below `lg`, column from `lg` (13 Aug)** — circle left, copy right on mobile.
> `items-start` so the disc lines up with the title rather than the middle of a
> variable-length copy block; `relative` + `z-10` on the disc are what let `Process`'s
> vertical connector run behind the card and end under the circle. See RESPONSIVE_SPEC
> §5.7a.

| | |
|---|---|
| Figma | `Icon Section` → `Icon Container` (120×120) + `Text Section` |
| Used in | Process (4) |
| Variants | — |
| States | default; scroll-reveal cascade *(D6)* |
| Tokens | `rounded-full` (icon circle) · `text-h5` (title) · `text-body-lg` |
| Props | `icon`, `title`, `description` |
| Notes | The oversized `01` / `02` numerals in **Services** are a different thing — see `SectionNumeral` (§4). |

### `TierCard`
| | |
|---|---|
| Figma | `SPARK` → `Pricing container` + `Separator` + `List` (10 × `Item`) + `Link` |
| Used in | Pricing (3) |
| Variants | `default` · `featured` |
| States | default, hover, focus-within |
| Tokens | `rounded-3xl` · `shadow-elevated` · `text-stat-display` (price) · `text-stat-symbol` (`$` / `+`) · `border-divider` (separator) |
| Props | `tier`, `name`, `description`, `price`, `features[]`, `cta`, `featured?` |
| Notes | Composes `Eyebrow` (tier name) + `FeatureItem` + `Cta` (full-width). Price is `$` + amount + `+` as three nodes — the symbols use `Stat/Symbol`, the amount uses `Stat/Display`. |

### `TestimonialCard`
| | |
|---|---|
| Figma | `Card 01`…`Card 5` → `Client Photo and Text Container` + `Client Info Container` |
| Used in | Testimonials (5) |
| Variants | — |
| States | default; carousel active/inactive |
| Tokens | `rounded-3xl` · `text-body-lg` (quote) · `text-body-sm-strong` (name) |
| Props | `quote`, `name`, `role`, `avatar` |
| Notes | Includes a decorative quote-mark vector — **inline SVG in the component**, not the v1 `QuoteMark` component (which is cut). Copy is written fresh, not from Figma (CLAUDE.md §2). |

---

## 3. Form and interactive

### `Nav`
| | |
|---|---|
| Figma | `NAV` → `Logo Container` + `Links` + `Link` |
| Used in | Hero (fixed, page-level) |
| Variants | `top` (transparent) · `scrolled` (solid + blur) · `mobile-open` |
| States | default, scrolled, hidden, mobile-menu-open; per-link hover/focus/active |
| Tokens | `backdrop-blur-nav` (15) · `rounded-lg` (16) · `text-label` · `gutter` |
| Props | `links[]`, `cta` |
| Notes | **Highest-craft piece.** Sticky/hide-on-scroll behaviour is specified in the brief and D6 — build to spec. Respects the gutter, never `inset-x-0`. Must not hide while the mobile menu is open (CLAUDE.md §5). |

> ⚠️ **`hideOver` (13 Aug)** — element ids the bar stays hidden over regardless of
> scroll direction. Currently `["services"]`: the reel pins for five viewport-heights
> and then opens a full-bleed quiz card, and a floating bar reappearing on every
> upward nudge read as chrome that had not been told what was going on.
>
> ⚠️ **Nav decides this, not the section.** The alternative was Services pushing state
> up to the page and back down, which makes the page a client component and couples
> two siblings. An id and a rect keeps the knowledge where the behaviour is.
>
> ⚠️ The test is `top <= 0 && bottom >= innerHeight` — the element **covers** the
> screen. Plain `isIntersecting` was tried and was far too eager: it hid the bar as
> soon as one pixel of the section appeared, a whole viewport before it took over.

### `Input`
| | |
|---|---|
| Figma | `Input` — 6 in Footer (5 × 50 tall, 1 × 184 textarea) |
| Used in | Footer form |
| Variants | `text` · `email` · `textarea` · `select` |
| States | **default, hover, focus, filled, disabled, error** |
| Tokens | `rounded-sm` (6) · `shadow-sunken` · `border-input` · `text-body-lg` · `ink-400` (placeholder) · `shadow-focus-error` |
| Props | `type`, `name`, `label`, `placeholder`, `required?`, `error?` |
| Notes | The form is 6 fields: name + company *(paired, half-width)*, email, **2 selects** (`Select a project type…`, `Select a budget range…` — each with a `keyboard_arrow_down` icon), and a textarea. Selects must be a **custom accessible listbox**, not a native `<select>` — the design has a styled chevron and matching sunken treatment. Error state is introduced, not designed. |

### `ContactRow`
| | |
|---|---|
| Figma | `Contact Method` → `Overlay+Border` (50×50 icon) + `Column` (label + detail) |
| Used in | Footer (3) |
| Variants | — |
| States | default, hover, focus |
| Tokens | `text-eyebrow` (label) · `text-h5` (value) · `min-h-tap` |
| Props | `icon`, `label`, `value`, `href` |
| Notes | Composes `Eyebrow` in its `icon` variant. Values are `Heading/H5` (26 Medium) — changed from 24 Bold during D1. |

### `SegmentedToggle`
| | |
|---|---|
| Figma | `Link` (339×50) → two `Background` tabs |
| Used in | Pricing |
| Variants | — |
| States | default, selected, hover, focus, keyboard-navigable |
| Tokens | `rounded-full` · `text-label` · `min-h-tap` |
| Props | `options[]`, `value`, `onChange` |
| Notes | Switches the tier set (`WEBSITES` ↔ `APPS & DASHBOARDS`). Must be a real tablist for a11y, not two buttons. |

### `OptionCard` — ⚠️ **INTRODUCED (13 Aug)**
| | |
|---|---|
| Figma | **none** — the WhyOtix panel (36:268) is drawn empty |
| Used in | Quiz |
| Variants | — |
| States | default, hover, focus-visible, selected, pressed |
| Tokens | `min-h-option` (68) · `rounded-lg` · `scale-press` (0.985) · `transition-option` · `border-input` → `green-400` · `neutral-100` → `green-50` · `h-radio`/`w-radio` (22) |
| Props | `label`, `description?`, `selected`, `tabbable`, `onSelect` |
| ⚠️ Radio, not button | `role="radio"` inside the step's `radiogroup`. A screen reader announces "2 of 4, selected" for a radio and only "button" for a button — on a screen whose entire content is four choices, that announcement *is* the orientation. Roving tabindex, so Tab moves past the group rather than through every option; the parent owns the arrow keys. |
| ⚠️ Not white | The panel behind these is `neutral-0`, so the rows cannot be. `neutral-100` + an `border-input` hairline is the quietest thing that still reads as a control. Selected is `green-50`, deliberately **not** a saturated fill: the row still carries `ink-900` text at AA, and six brand-green rows would fight the CTA. |
| ⚠️ One transition | All four state properties move on `transition-option`. Split apart, the border lands before the fill and one select reads as two events. |

### `QuizStepper` — ⚠️ **INTRODUCED (13 Aug)**
| | |
|---|---|
| Figma | **none** |
| Used in | Quiz |
| States | per-segment: empty · filling · full |
| Tokens | `h-stepper` (4) · `bg-neutral-200` track · `bg-green-600` fill · `duration-slow`/`ease-smooth` |
| Props | `current`, `total`, `valueText` |
| ⚠️ Segments, not a bar | A continuous bar answers "how far along am I"; segments also answer "how many are left" — and the second is the question someone deciding whether to start is actually asking. Six short bars read as a small commitment, one bar at 16% reads as a big one. |
| ⚠️ One progressbar | A single `role="progressbar"` with `aria-valuetext`; the segments are `aria-hidden`. Marking each segment up as a step makes a screen reader read six near-identical items on every step change. `aria-valuenow` is the step NUMBER against min 1 / max 6, not a percentage — "3 of 6" beats "50". |
| ⚠️ scale-x, not width | The fill is a transform on an inner span with a left origin. Width is not composited and this animates while a whole step transitions beside it. |

---

## 4. Structural and utility

### `Carousel`
| | |
|---|---|
| Used in | Testimonials (scroll strip) — the Hero uses `HeroArch`, not this |
| Variants | `start` (snap strip). The `center` variant is no longer needed — v2's hero is a static arch. |
| Status | ❌ **CUT from v2** (D4, Jimmy's call) — not needed. The Hero uses `HeroArch` (a static composition, not a carousel) and Testimonials does not need a scroll strip. |
| Notes | The ported v2 file is saved at `_archive-v1-teal/_snapshots/Carousel.v2.tsx` if a scrolling strip is ever wanted — it is design-agnostic, so it will still drop in. **The v1 source also remains at `components_old/Carousel.tsx`.** Not in `components/`, not built, not linted. |

### `BackgroundVideo`
| | |
|---|---|
| Figma | `HERO Container` fill = `VIDEO` + `GRADIENT_RADIAL` |
| Assets | `public/media/background.mp4` · `.webm` · `background-poster.jpg` — **new, 12 Aug** |
| Used in | Hero |
| States | playing, poster-only (mobile), reduced-motion |
| Props | `poster`, `mp4`, `webm`, `pingPong?` |
| Notes | **Built ✅ (D4) — carried from v1**, pointed at the new source video. `src`/`poster` in the v1 signature above was wrong: it takes **both** sources so the browser can pick. The poster `<img>` is the **base layer and the LCP**, always rendered; the video mounts on top and fades in only once it can play, so there is never an empty frame. Not mounted at all under 640px or with reduced-motion — the poster is already the finished state, not a degraded one. The hero has a video fill *plus* a radial gradient overlay — both are needed. Purely decorative; safe to remove (CLAUDE.md §5). |
| Ping-pong loop | **`pingPong` now defaults to ON** (D4, Jimmy's call): forward → reverse → forward, so the footage never cuts. Browsers cannot play video in reverse — `playbackRate` rejects negative values — so the reverse pass walks `currentTime` backwards on rAF. It steps by **real elapsed time**, not a fixed amount per frame, so it runs at the same speed on a 120Hz screen as a 60Hz one. `loop` is set only when ping-pong is OFF: the two are mutually exclusive, because a looping video never fires the `ended` event this depends on. |
| ⚠️ Mount check is not a media query | The 640px / reduced-motion test runs **once on mount** and deliberately does not re-evaluate on resize. Swapping a background video in and out while someone drags a window would be worse than either state. |

> **The v2 video is ~5.7× lighter than v1's** — 1.0 MB mp4 / 1.08 MB webm / 47 KB
> poster, against 5.7 MB / 4.9 MB / 402 KB. The v1 files (`hero.mp4`, `hero.webm`,
> `hero-poster.jpg`) are now unused and should be deleted from `public/media/` —
> they would otherwise ship as ~11 MB of dead weight.

### `ServiceCard` — ⚠️ **INTRODUCED (13 Aug)**
| | |
|---|---|
| Figma | `SERVICES UPDATE CLAUDE` (264:762) — a concept board, not a measured frame |
| Used in | Services — **both branches**: the desktop orbit and the mobile carousel |
| Variants | **`layout`: `row` (desktop) · `stacked` (mobile)**. Depth is `distance` (0–1), which is not a variant. |
| States | default only — it is not interactive; the card is a surface, the CTA lives in the section header |
| Tokens | `bg-neutral-0` · `shadow-elevated` · `rounded-3xl` *(card)* / `rounded-2xl` *(image)* · `p-xl` · `gap-2xl` / `gap-lg` / `gap-base` / `gap-sm` · `text-service-title` · `text-body` · `text-ink-900` / `text-ink-600` |
| Props | `question`, `title`, `body`, `image`, `layout`, `distance`, `className` |
| Composes | `Tag` *(the question pill)* · `next/image` |
| Notes | Pure presentation. The reel places it on the arc and passes `distance`; the card knows nothing about scroll, the orbit or its own index. |
| ⚠️ Why a new component, not a `ServicePanel` variant | They share content and almost no presentation — `ServicePanel` is copy on a glass surface for a dark ground, this is a horizontal card with a media column for the page cream. A third mode would have made six panels carry machinery none of them use. Flagged per CLAUDE.md §3. |
| ⚠️ `distance` drives blur AND scale — on DIFFERENT ramps | Never one alone: blur by itself reads as a rendering fault (nothing goes out of focus without also getting smaller), and scale alone was the green build's, right *there* because those cards were frosted and blurring a frosted card makes the two effects stop meaning different things. `AWAY_SCALE = 0.86` runs linearly from 0; `AWAY_BLUR_PX = 6` **holds at zero until `BLUR_HOLD` (0.3)** then ramps over the rest, so the active card stays sharp across 60% of the gap to its neighbour (13 Aug). **Depth is continuous, focus is not** — the same dead zone on both would flatten the arc into identical cards near the middle. The filter is dropped entirely inside the dead zone, not set to `blur(0px)`, so the card being read is never on its own compositor layer. |
| ⚠️ `origin-center` | The reel positions the card by its centre, so scaling from anywhere else would move it as well as resize it. |
| ⚠️ The image is a PROPORTION, not px | `w-2/5` in `row`, `w-full` in `stacked`. The reel scales the card at every viewport; a fixed media width would stop tracking it (CLAUDE.md §0). `sizes` is declared per layout, or Next serves the largest candidate for a picture that is never more than a third of a desktop card. |
| ⚠️ The ASPECT changes with the layout, not just the position | `aspect-square` in `row`, **`aspect-media` (4:3)** in `stacked`. Square works BESIDE copy because it matches the copy block's height; square ON TOP of copy, in a card three-quarters of a phone wide, takes most of the screen before a word is read. |
| ⚠️ `layout` is a PROP, not a breakpoint class | The two branches of `Services` are separate renders — one pinned and orbiting, one a swipe strip — so the card is never asked to change shape mid-life. Responsive classes would imply a fluidity that does not exist and would put both layouts in the DOM at every width. |
| ⚠️ `distance` is 0 on mobile | The strip has no depth: which card you are reading is decided by the scroller, not by a value we compute. A swipe-derived distance would blur cards the browser considers fully visible. |
| ⚠️ One pill, and it is a QUESTION | Was `tags: string[]` — category labels. A category pill says what the card is filed under, which the title underneath already says; a question says whether the card is about YOU, which the title cannot. The prop is singular so it cannot quietly become a list again. |
| ⚠️ `h3`, and all six are always in the DOM | The section's heading is the `h2`, so a service sits one level below (CLAUDE.md §5). The orbit culls far cards for the compositor — `orbitBox(d, force)` opts these six out of that, because culling meant only **two of six service headings existed in the rendered DOM**. Measured: all six are in the server HTML, four vanished on hydration. Google indexes the rendered DOM. |
| Padding | `p-xl` (24), against `QuizPanel`'s 48 in the same row of seven. Flagged in AUDIT §3 and **left as-is on Jimmy's call — the cards do not need a shared padding rule.** |

#### Interior rhythm — matched to `Card`, 13 Aug

| | value | why |
|---|---|---|
| image → pill | `gap-2xl` (28) | In `stacked` this is the root's only gap, so it governs image → pill alone. Larger than the copy block's internal 20 on purpose: the picture needs more separation from the text block than the text block has internally, or the pill reads as a caption on the image rather than the head of the copy. ⚠️ **Deliberately NOT `Card`'s `gap-lg`** — that card's image is full-bleed with a padded panel beneath, so its 20 is measured between different edges. Copying the number would have matched the token and not the spacing. |
| pill → title | `gap-base` (16) | Taken from `Card`. The two are ONE GROUP in a wrapper, tighter inside the pair than between pairs — that is what makes the pill read as belonging to the title rather than as a third item in an evenly-spaced stack. `Card` reaches this with `contents` on a flattened group; here it is a real wrapper, because this column has no `mt-auto` stats row to pin. |
| title → copy | `gap-lg` (20) | Taken from `Card`. |
| copy inset | `px-lg` (20) in `stacked`, `pr-lg` in `row` | The COPY carries it, not the card, so the image stays tight to its own corner while the text is held off the edges. Stacked, the copy sits 44 from the card edge against the image's 24 — mirroring how `Card` insets its copy panel by `p-section-x` over a full-bleed image. **20 rather than the `section-x` token**, because that clamp is a fluid 20 → 50 tuned for SECTION gutters and its upper end would eat the measure inside a card. At phone widths the two resolve to the same number. |

---

### `QuizPanel` — ⚠️ **INTRODUCED (13 Aug)**
| | |
|---|---|
| Figma | none — designed in build from Jimmy's brief |
| Used in | Services, as **panel 07** (desktop reel) and as an open block below the carousel (mobile / reduced motion) |
| Variants | driven by `expand` 0→1, not by a variant name: `0` = frosted card · `1` = expanded, quiz open |
| States | default · the quiz owns its own states |
| Tokens | `rounded-3xl` · `bg-overlay-glass-panel` *(frost; blur now inline and interpolated — see below)* · `bg-green-950` *(veil)* + `bg-scrim-green-corner` *(rotated, legibility)* · `text-h2` / `text-h2-accent` · `p-5xl md:p-6xl` *(fallback; the reel overrides with `padX`/`padY`)* |
| Props | `eyebrow`, `heading` *(segments)*, `body`, `image`, `quiz`, `expand`, `padX`, `padY`, `headScale`, `className` |
| Notes | **Replaces the `WhyOtix` section**, which is deleted, and inherits the deleted `banner1`'s image. Composes `Eyebrow` + `Quiz`. |
| ⚠️ Why a component, not a `ServicePanel` variant | `ServicePanel` is copy on a surface with no state of its own; this is a two-state photographic container owning an interactive child. A third mode would have made six panels carry machinery only the seventh needs. Flagged per CLAUDE.md §3. |
| ⚠️ ONE heading that grows, anchored top-left | Rebuilt 13 Aug, then rebuilt again. A cross-fade between a centred and a corner header read as a blink; a **token swap** at a threshold (`text-service-title` → `text-h2`) was tried next and it visibly stepped, because a class cannot animate between two type tokens. It is now a single element **rendered at the open size and scaled DOWN** — `origin-top-left`, `headScale` passed by the reel as `service-title ÷ h2` at the current viewport. Only down-scaling stays sharp, and a transform cannot re-wrap, so the line breaks are the open state's at every scale. ⚠️ `transform` does not change layout, so a negative margin reclaims the height it still reserves. ⚠️ Only the `h2` scales: the eyebrow and body sit outside it, or a 13px mono pill became 7px. |
| ⚠️ The FACE still steps, and only the face | Serif-italic-`green-300` cannot be interpolated from Manrope-roman-white — there is no in-between to render — so the accent arrives at `HEADING_STEP` (0.12), early in the move where the ease is travelling fastest. As a card the title is plain Manrope, matching the six `ServiceCard` titles beside it; open it carries the accent every section heading carries. |
| 🔴 ⚠️ The frost's BLUR fades to 0 as it opens | Not a design choice — a Chrome constraint. `backdrop-filter` samples the **backdrop root**, which here is the viewport; once the card is taller than the screen its frost extends past the top edge, the blur has nothing outside the root to sample, and the clamped result reads as a **pale gradient band across the top of the window** that follows the scroll and paints over the nav. Confirmed by isolating it live: killing this element's `backdrop-filter` removed the band, clipping its top edge to the viewport also removed it, and `translateZ(0)` "fixed" it only by making the element its own backdrop root — i.e. by silently disabling the blur. The radius rides down on the same ramp as the frost's opacity, so the open state is a flat wash with no `backdrop-filter` element at all. Costs almost nothing: at `FROST_MIN` 0.5 with `opacity` halving it again, toggling the blur when open is very nearly invisible. **This applies to any frosted panel taller than the viewport.** |
| ⚠️ NO height cap | The open card **hugs its content and runs off the bottom of the screen**; the page scrolls to the rest once the pin releases. A `maxH` that capped it to the viewport and scrolled the quiz inside was built and reverted the same day — it turned a card that continues into a fixed-height box with its own scroll container inside a scrolling page, and the quiz laid out wrong in the one it did not expect. |
| ⚠️ The gap to the next section is the NEXT section's | `Services` reserves only the open card's overflow below the fold (`panelH + gutter − viewport`) as `paddingBottom`, so it ends exactly where the card ends. Process's own `section-y-flush` top padding provides the gap. A local spacer was added 13 Aug and removed the same day — it doubled the gap to ~240 because it duplicated rhythm the next section already carries. |
| ⚠️ Spacing follows `SectionHeader` | eyebrow → heading `md` (12), heading → body **`2xl` (28)**. Deliberately not uniform, because `SectionHeader`'s is not either. |
| ⚠️ Open, it is inset EQUALLY on all four sides | `padX` and `padY` both interpolate **48 → 100**. The sides went 60 → 120 → 100 across 13 Aug: 60 (the site's flush line) was too close to the edge, because every other section at 60 has the PAGE around it doing the containing and this one is the whole viewport with nothing outside it; 120 over-corrected into a letterbox. Both props are kept rather than collapsed into one, so the day they need to differ is a one-line change. |
| ⚠️ Its MOBILE padding is `Work`'s CONTAINER tokens, not a card's | `px-section-x py-section-y` (13 Aug), replacing a flat `p-5xl md:p-6xl`. On mobile this panel is a section-level surface, not a card, and `Work` is `mx-gutter … px-section-x py-section-y`; since the Find Your Fit section is `px-gutter`, the two now land content on the same optical line — 25 from the screen edge at 375, 60 at 1440. It is a REDUCTION sideways (48 → 20 on a phone) and an increase vertically (48 → 56). The desktop reel still overrides both with `padX`/`padY` because it interpolates them. ⚠️ These tokens and the section's `px-gutter` are a SET; if the section stops being gutter-inset this silently stops matching `Work`. |
| 🔴 ⚠️ NO fixed height on the mobile instance | It sat in an `h-quiz` block (a fixed clamp, 560 → 650) left over from when it was a block inside Services. Once the padding grew, the content outgrew that box, the panel painted past it, and **Process was laid out under the overflow**. Its height is its content's height. `h-quiz` still governs `Quiz`'s own desktop geometry — only the outer spacer went. |
| ⚠️ The sub-copy stays | Reversed 13 Aug. It was built to collapse as the quiz opened; with the heading anchored top-left there is room for both, and the copy is what says the quiz has no sales pitch before you start answering. It steps `text-body` → `text-body-lg` on the same scale mechanism as the heading (`BODY_SCALE = 16/18`) rather than swapping classes, which would snap 2px mid-expansion. |
| ⚠️ It hugs its content | No height is set by the reel. The quiz's slot opens from 0 to its measured height, and the card's height follows — which is what lets it be short as a card and taller than the viewport once open. The sub-copy **collapses** as the quiz arrives rather than just fading, or its height stayed reserved as a band of nothing. |
| ⚠️ Expanded, it is EDGE TO EDGE | `top`/`left` interpolate to **0**, not to the gutter, and the width to the full viewport. Every other surface sits inside the 10px page frame; open, this one is not a panel on a page, it is the page. ⚠️ **The 30px radius stays** — briefly interpolated to 0 and reverted the same day: keeping it is what makes the open state read as the same card that grew rather than a screen that replaced it. |
| ⚠️ It does not own its own position | The parent interpolates `top`/`left`/`width` inline (centred card → page gutter). **No height and no bottom inset** — the card runs off the bottom of the screen when open, which is what gives the quiz somewhere to scroll to. The mobile fallback is then free: render it in a normal block at `expand={1}`. |
| ⚠️ The scrim is load-bearing | Measured on the real asset behind the expanded heading: **1.93:1 unscrimmed, 13.93:1 with it**. The bright sky is the top third and the corner heading sits in it. Re-measure if the image is swapped. |
| ⚠️ The quiz keeps its own white surface | Deliberately not restyled onto the photograph. Its option rows, radios and focus rings need 3:1 for control boundaries (WCAG 1.4.11) and no scrim strength gives a photograph that reliably. |

### ~~`ServicePanel`~~ — ⚠️ **SUPERSEDED 13 Aug**

The Services copy block: eyebrow, title, body, corner glyph, optionally on a glass
surface. It was the desktop reel's right-hand column, then the mobile carousel's card.

**Why it went:** the mobile Services section was rebuilt to match desktop — page cream,
no green panel — at which point both branches were rendering the same content in the
same visual language through two different components. `ServiceCard` gained a
`layout="stacked"` variant and this had no consumer left. CLAUDE.md §3, resolved.

**What went with it:** `overlay-glass-card`, `backdrop-blur-card`, `w/h-service-glyph`
and `-sm`, the `panelEyebrow` prop on `Services`, and `icon` on each service in
`content.ts`. All are recorded in `DESIGN_TOKENS.md` §7b and `CMS_READINESS.md`.

**Worth keeping from it:**

- **The glass had to be a FILL, not a blur.** `backdrop-filter` only shows where there
  is texture behind it, so a blur-led card looked frosted where the wheel passed and
  plain everywhere else — the material appeared and disappeared as you scrolled.
  `overlay-glass-card` (white at 7%) was there regardless of the backdrop.
- **The cards hugged their own content.** `h-full` was removed deliberately: equal
  heights left the two shortest services as mostly empty box, which the hairline
  dividers they replaced never did, because a line has no interior to leave empty.

`components/ServicePanel.tsx` is unreferenced and can be deleted.

---

### `StatItem`
| | |
|---|---|
| Figma | `Stat Item` → `Stat Value` + `Stat Label` |
| Used in | Work (3, inside a Card) |
| Tokens | `text-stat-value` · `text-body-sm` · `green-600` |
| Props | `value`, `label` |

### `FeatureItem`
| | |
|---|---|
| Figma | `Item` → `Image+Overlay` (18×18 green-300 circle) + label — 30 in Pricing |
| Used in | TierCard |
| Variants | `included` (26 rows) · `excluded` (4 rows) |
| Tokens | `text-list-item` · `green-300` (circle) · `green-100` (label) |
| Props | `label`, `included?` |
| Notes | The circle is identical in both states — only the **glyph** changes (Figma vector `10×8` tick vs `10×2` minus) and the **label drops to 40% opacity**. The circle is never dimmed. Excluded examples: "CMS (content management)", "E-commerce capability", "Email automation", "E-commerce (add-on available)". |

### `Icon`
| | |
|---|---|
| Figma | the stroked glyph set — service icons, step glyphs, contact marks, chevrons, ticks |
| Used in | ServicePanel, StepCard, ContactRow, Input, FeatureItem, Cta |
| Variants | by `name` — a union type, not a free string, so a typo is a type error rather than an empty box |
| Tokens | `w/h-icon-sm` (16) · default 24 · `w/h-icon-lg` (32) · `w/h-service-glyph-sm` (48) · `w/h-service-glyph` (100) · `w/h-step-glyph` (48) |
| Props | `name`, `className` |
| Notes | ⚠️ **Backfilled 13 Aug — built during D4 but never inventoried.** Inline SVG on `currentColor` so it takes its colour from the parent; never an `<img>`. Decorative by default — where the adjacent heading already names the thing, the icon carries no accessible name rather than repeating it (CLAUDE.md §5). |

### `ParallaxImage`
| | |
|---|---|
| Used in | — ⚠️ **verify.** Present in `components/` and never mentioned in this document before 13 Aug. |
| Notes | ⚠️ **Backfilled 13 Aug as a stub.** This entry records that the file exists and is undocumented; it does not yet describe it. Either write it up properly or delete the component — an inventory with a placeholder in it is better than one that silently omits a file, but only until someone closes it. |

### ~~`ServiceNumerals`~~ — ⚠️ **DELETED 13 Aug**

The reel's oversized numerals, later the service glyphs at numeral size, down the left
of the desktop Services section.

**Why it went:** each service card now carries its own image, so the column was a second
visual for the same service — and the left of the composition is where the section title
lives. Once the column was removed, the only thing importing the component was the
`/dev/components` harness: a component kept alive by the page that exists to review
components.

**Worth keeping from it,** because both were hard-won and neither is obvious:

- **Geometry in `em` of the type's own fluid size.** Window, pitch, rule and gaps were
  all `em`, so the column scaled with the type with no measurement, no resize listener
  and no JS layout read. From the design ÷200: rule `0.6em`, gap `0.08em`, numeral
  `1em`, pitch `1.76em`.
- **A constant pitch, deliberately unlike Figma's.** The design's pitch is 327px because
  its "next" numeral is genuinely smaller and occupies less layout; the build scaled it
  with a transform, which does not affect layout, so pitch was constant. A constant pitch
  moves linearly with scroll — a size-dependent one drifts and stutters.
- **One colour, not two.** The design drew active in `accent-numeral` (#9CB0A8) and next
  in divider grey; those are the same colour, since #9CB0A8 at 45% over the warm page
  resolves to ≈#CED6D2. Interpolating one token's opacity reproduced both rest states
  *and* every position between them.

`components/ServiceNumerals.tsx` is unreferenced and can be deleted.

---

## 5. Deferred

*Nothing is deferred. `StatChart` was the only entry and it is now built — see §2.*

### `StatChart` — ✅ **BUILT (D8, 12 Aug)**
| | |
|---|---|
| Figma | `Visitor Growth Chart` (36:99) — a **holding graphic**. This is DESIGNED, not exported. |
| Used in | About |
| States | hidden → revealed (once, on scroll); static under reduced motion |
| Props | `series: [ChartSeries, ChartSeries]`, `labels[]`, `statLabel`, `caption` |
| Tokens | `h-chart` · `chart-dot` · `transition-stroke` · `transition-reveal` **(all new)** · `duration-expand` · `duration-slowest` · `green-50` tracks, `green-700`/`green-200` bars, `green-600` line |
| ⚠️ DESIGNED, NOT EXPORTED | Jimmy's brief was explicitly to beat the placeholder, not reproduce it. **Do not "correct" this back toward the Figma frame.** Its greys (`#8C8C8C`, `#D9D9D9`) stay out of the token layer. |
| What it is | Paired bars in full-height tracks · a trend line that **chases** up the primary series with a dot landing on each peak as it passes · a stat card that pops **inside the plot** and counts up · a centred key beneath. Value labels were tried and removed (12 Aug) — with dots on every peak they were one layer too many. |
| ⚠️ The line must interpolate, not approximate | Drawn with **Catmull-Rom → cubic Bézier**, which passes through every point exactly. An earlier midpoint-quadratic version only approximated them, so the curve slid off the dots. The `/6` on the neighbour delta stops steep changes overshooting into loops. |
| ⚠️ The line draws with a CLIP WIPE, not `stroke-dashoffset` | **This is what caused the visible gaps.** `vector-effect="non-scaling-stroke"` resolves dash lengths in *screen* units while `pathLength="1"` normalises in *user* units; the two disagreeing rendered the line as dashes with real breaks. A `clip-path` wipe has no such interaction and reveals strictly left-to-right, which is what "chasing" wants anyway. **Do not reintroduce a dash-based draw-on while `non-scaling-stroke` is on the path.** |
| ⚠️ Three layers, in order | bars → line → dots. The line must sit **above the bars and below the dots**, which is why it is its own layer rather than living inside the columns. That z-order is what lets the dots' 2px `border-neutral-0` ring read as a halo instead of a break in the line. |
| ⚠️ NO `gap` between columns | Load-bearing. The dots are DOM (a circle inside a `preserveAspectRatio="none"` SVG is squashed to an ellipse) and the line is SVG (CSS cannot draw between points) — two systems that must agree on one x. They only agree if columns tile the plot **exactly**; a flex `gap` makes column centres stop being `(i+0.5)/n` and the line drifts off the bars by a few px, worse at some widths than others. All spacing is percentages INSIDE each column, derived from four constants at the top of the file. |
| The track is the idea | Each bar sits in a full-height `green-50` pill: gives the column shape before anything animates, shows the headroom left, and removes the need for gridlines entirely. |
| Headroom | The axis max is the tallest value **× 1.18**. Without it the peak dot and its value label are clipped by the plot's top edge. |
| ⚠️ Card placement | Top-left, inside the plot, over the short early bars — the one region a rising series leaves empty. That is what makes it part of the graphic rather than a caption above it. It would collide with the data on a falling series. |
| ⚠️ Percentage is DERIVED | Computed from the first and last value, never authored. A hand-written figure would silently contradict the chart the moment anyone edited the numbers. |
| ⚠️ `data-reveal` placement | Must sit on a real box inside the `<figure>` — not on the figure itself (the hook searches descendants) and never on a `display: contents` element, which has no box for IntersectionObserver to see. |

### `Quiz` — ⚠️ **INTRODUCED (13 Aug)**
| | |
|---|---|
| Figma | `Article Card` (36:266) — a 1320 × 650 card, image 470 × 640 at a 5px inset, panel 840 × 640. **The shell is exported; the panel is drawn EMPTY and everything inside it is designed.** |
| Used in | `QuizPanel` — panel 07 of the Services reel on desktop, the `find-your-fit` section on mobile. ⚠️ **Not `WhyOtix`**, which is deleted. |
| Replaces | the two reused Work cards that used to sit here — the same two projects appearing twice on one page |
| ⚠️ No start screen | Question 1 IS the opening screen. The section header above the card carries the invitation ("Find your fit" / "Not sure which package you need?"), which is what made a separate start card redundant — the same sentence twice, forty pixels apart, read as a toll booth in front of the questions. |
| Screens | 5 questions · reveal (6) |
| Props | `content: QuizContent`, `onComplete?` |
| Tokens | `h-quiz` (650) · `h-quiz-media` · `h-quiz-media-sm` · `basis-quiz-media` (35.61%) · `transition-dissolve` · `transition-unlock` · `animate-step-in-up`/`-down` **(all new)** |
| ⚠️ Recommends the REAL tiers | Spark/Studio/Summit for websites, Pulse/Forge for apps. The brief said Pulse/Forge/Orbit, but on this site Pulse and Forge are the *Apps & Dashboards* tiers and Orbit does not exist — a quiz recommending "Forge" for a small website points at the $15,000 Web App card three sections down. The app ladder has **two** rungs against three scope buckets, so two buckets share a tier. That is the pricing being honest; do not invent a third app tier to tidy the table. |
| ⚠️ Fixed height at `lg`+ | Six screens of different lengths in an auto-height panel means the card grows and shrinks under the cursor on every step. **Not** applied below `lg`, where the layout stacks and content sets its own height. |
| ⚠️ Enter is an ANIMATION, exit is a transition | The incoming screen plays `animate-step-in-*` on mount, keyed by index. The first build used a transition, which from React needs a `requestAnimationFrame` to paint the start state — and rAF does not fire in a backgrounded tab, so the panel was left permanently blank. **Do not convert the entrance back to a transition.** `key={index}` is load-bearing: it is what remounts the node so the animation replays. |
| ⚠️ Pointer/Enter advances, arrow keys do not | A keyboard user arrowing through four options would be thrown forward on the first press. Arrows move and select in place (platform radio behaviour); only deliberate activation advances, after a 320ms beat so the selected state is seen. |
| ⚠️ AN EXPLORER, NOT A LEAD FORM | Jimmy, 13 Aug: *"I just want to make it easier for the user to explore options."* Check any proposed change against that sentence. It collects **no contact detail** — an earlier build had an email gate with the result blurred behind it and both were cut. **Do not add capture back in**; it would change what the component is for. Abandoning is not failure: someone who answers two questions and scrolls on has been helped. Optimise for answers being easy to change, not for finishing. |
| ⚠️ Back is an ICON on the question's top line, far right | 13 Aug. It was a text link in the foot row. **Not a close button** — it is `Arrow` from `Cta` rotated 180°, the same glyph every CTA uses, pointing the other way; a cross would read as "dismiss the quiz", a far more destructive action than "go back one question". `aria-label` carries `content.back`, so the authored word is still the accessible name. Hidden on step 1, present on the reveal (where it keeps the answers). |
| ⚠️ A cream disc that inverts to green | 13 Aug. It was the popup's bare-circle-on-hover, and that was too quiet here: the popup's close sits on a DARK panel where a white glyph carries itself, while this is a grey arrow on a WHITE card with nothing separating it from the surface until you hover — a control you have to hunt for. `neutral-100` at rest is the PAGE colour, so the disc reads as a piece of the page set into the card; hover fills `green-600` with a `neutral-0` arrow, the same inversion `Tag` and the Work cards use. Measured: `ink-600` on `neutral-100` **6.19:1**, `neutral-0` on `green-600` **7.61:1** — legible in both states, not just one. ⚠️ **The arrow is `icon-xl` (36).** It went 32 → 40 → 36 → 32 → 34 → 33 → 36 across 13 Aug — rejected on pass three, chosen on pass seven, with nothing about the glyph changed in between; what changed was the disc's fill and the control's position. **Settle a control's surface and position before sizing its glyph** — see DESIGN_TOKENS. |
| ⚠️ Positioned unlike `ContactPopup`'s close | **Position:** on the panel's own padding (`2xl`/`5xl`), *not* pulled into the corner. The popup's close is at 24 precisely so it does NOT line up with the reading column — a close belongs to the dialog, not its content. This one belongs WITH the question: same top line, far right of the same row. ⚠️ The 50px target against the heading's ~48px line box is why they look level; that is a coincidence of measurement, not something the layout enforces — recheck if the heading token changes. |
| ⚠️ The question block reserves `pr-7xl` | The button is absolutely positioned and takes no space, so a long question would run underneath it. Reserved on EVERY step including step 1, where there is no button: conditional padding would make the first question wrap differently from the rest and re-flow the title the moment you pressed back. |
| ⚠️ The escape link is GONE | The "Or just email us" mailto, previously live on every screen. A deliberate reversal of the brief, not a tidy-up: the quiz already ends in a CTA, the section sits above a contact form, and a permanent mailto competing with the primary action on all six screens read as an apology for the quiz existing. `content.escape` is **kept but unused** — see `CMS_READINESS`. |
| ⚠️ The foot row only renders on the REVEAL | It holds `Start again` and nothing else now. Conditional rather than always-present-and-sometimes-empty, because an empty flex row still consumes the column's `gap-xl` — that put phantom space under every question screen. |
| ⚠️ The stepper is the LAST thing in the card, visually only | 13 Aug: above the question → above the back/skip row → **below it**, at the very bottom. 🔴 It is moved with **`order-last`, not by re-ordering the JSX** — flex `order` affects paint order only, so the DOM keeps the progress bar BEFORE the controls that change it. A screen reader hears "step 2 of 5", then Back / Start again, which is the order that makes sense when you cannot see the layout. **Do not tidy this by moving the element down in the source.** |
| ⚠️ Question heading is `text-service-title` | 13 Aug: `h5` (22 → 26) → `h4` (24 → 32) → **`service-title` (28 → 40)**, the same token the service cards use — a question and a service name are both the head of a card the reader is being asked to consider, so they sit at one rank. **One render serves all five questions**, so there is no per-question class to keep in step. ⚠️ **The REVEAL's heading tracks it and must keep doing so** — the question and its answer are the same kind of thing at the same size; letting one drift makes the reveal read as a different screen rather than the end of the same one. |
| ⚠️ Question → options gap is `3xl` (32) | Against `xl` (24) elsewhere in the card. Deliberately asymmetric: **the gap has to grow with the type above it or the hierarchy inverts.** At 24 under a 40px heading the options read as part of the question rather than the answer to it. If the heading token moves again, this moves with it. |
| ⚠️ Branch invalidation | Changing the step-1 answer **deletes** the step-3 answer: its options belong to the old branch and its `tier` points at the wrong ladder. |
| ⚠️ Reveal sentence is a template | `reveal.lead` placeholders are step ids; each option carries a `phrase`. The phrases must **qualify** the build noun, never restate it — "a marketing website" + "as a full marketing site" stuttered on first build. Read it aloud with each substitution before editing. |
| `onComplete` | An ANALYTICS hook, not a submission, and nothing depends on it. The useful question it could answer is "which tiers do people land on, and where do they stop" — which tells you whether the *pricing* is legible. Not a lead feed. |
| Escape hatch | `Or just email me` is live on **every** screen, as a quiet text link — never a second button competing with the primary action. |

---

## 5b. Sections — the D8 assembly

⚠️ **Backfilled 13 Aug.** The ten section files under `components/sections/` had no
entries here, only scattered mentions. They are assemblies, not components — they
own layout and scroll state and compose the inventory above — but they are the
files most often edited, so they need to be findable.

Geometry per CLAUDE.md §0.1: **containered** sections draw a surface and sit inside
the 10px gutter (`section-x` 50); **flush** sections have no surface and are
full-bleed (`section-x-flush` 60). Both land on the same 60px optical line.

| Section | Geometry | Composes |
|---|---|---|
| `Hero` | flush | ⚠️ **Gained a `Cta` under the sub-copy on 13 Aug**, absolutely positioned (`top-full`) so it takes no height and the arch below does not move. 🔴 It needs `z-10`: `HeroArch` is a later sibling at the same `z-index: auto`, so without it the button painted UNDER the arch and never received hover — a stacking bug that looked like a broken rollover. |
| `Hero` | flush | Nav · Eyebrow · RotatingWord · BackgroundVideo · HeroArch · Carousel |
| `About` | flush ⚠️ | SectionHeader · StatChart |
| `Work` | containered | SectionHeader · Card ×4 |
| `Services` | flush | SectionHeader · **ServiceCard ×6** — orbiting *(desktop)* or in a Carousel *(mobile)* · Cta · Logo *(mark, as the wheel)* · **QuizPanel (panel 07)** *(desktop only — see below)* |
| `find-your-fit` | flush | ⚠️ **MOBILE ONLY, added 13 Aug.** `QuizPanel` at `expand={1}` as its own `<section>` below Services, rather than a seventh card inside it. On desktop the same panel is 07 of the reel and has no section of its own. |
| ~~`WhyOtix`~~ | — | ⚠️ **DELETED 13 Aug.** Its header and `Quiz` became `QuizPanel`, panel 07 of the Services reel. `components/sections/WhyOtix.tsx` is unreferenced and can be removed. |
| `Process` | flush | SectionHeader · StepCard |
| `Pricing` | containered | ⚠️ **Tier cards use `Reveal` (13 Aug)** — same effect and stagger as `Work`, **suppressed on the Apps & Dashboards tab** because those cards arrive by tab click rather than by scroll. See MOTION_SPEC §5.1. |
| `Pricing` | containered | SectionHeader · SegmentedToggle · TierCard ×3 |
| `Testimonials` | flush | SectionHeader · TestimonialCard · Carousel |
| `Banner` | containered *(the `Card` is the surface, not the section)* | Card, banner variant. ⚠️ **`banner-1` was deleted and restored on 13 Aug**, and it MOVED — it sat between Services and WhyOtix, and now sits between About and Work. It was cut because the quiz became panel 07 and inherited its image; putting it well clear of the reel resolves that, and it carries `img-12` now rather than the quiz's `img-10`. |
| `Footer` | containered | SectionHeader · ContactPanel · ContactRow · Logo |

> ⚠️ **About is flush, and it shipped as containered.** That bug is why CLAUDE.md
> §0.1 carries its correction note: a flush section built as containered lands its
> content on 50 instead of 60 — a silent 10px error that just looks very slightly
> off rather than obviously broken. Check the geometry against the surface, not
> against the neighbouring section.

---

## 6. Not components

| Thing | Why | Decision |
|---|---|---|
| `Container`, `Background`, `Column` | Generic Figma layout wrappers — 28 + 10 + 7 uses across 23 different sizes. Layout, not components. | Plain markup |
| `useRevealed` | A hook, not a component. Carried from v1 unchanged. | `lib/useRevealed.ts` |
| Hero bottom **curve** (`Rectangle 25`, 36:88) | A section-level ornament, like the Process connecting rules — it belongs to the Hero's shape, not to anything reusable. A vector, **not a border-radius**. | Inline SVG in `sections/Hero.tsx` |
| Hero **glow** (`Ellipse 4`, 36:36) | Same: a 1100×1100 radial pool of `green-950` behind the arch. One use, one section. ⚠️ **Removed 12 Aug** at Jimmy's request; tokens kept, re-enabling is one span (see the comment in `sections/Hero.tsx`). | `bg-glow-hero` + `w-arch-glow` tokens, currently unused |
| Hero **scrim** | Radial, `green-950` **90% at the centre → 100% at every edge** (Figma has 80%; 90% is Jimmy's call, 12 Aug). ⚠️ **`farthest-side` is load-bearing:** CSS defaults radial gradients to `farthest-corner`, which sizes the ellipse to the corners — so the mid-edges, including the whole bottom edge, never reach the last stop. That is what left video showing along the edges and put a seam above the curve. It is also what Figma's transform actually resolves to (50%/50% radii). Two attempts at lightening the centre to "fix" the flat look were treating the wrong cause. | `bg-scrim-hero` token |

---

## 7. Decisions on record

1. **`Eyebrow` stays text-only; the icon circle lives in `ContactRow`.**
   `Overlay+Border` does double duty in Figma — the eyebrow pill and the 50×50 icon
   circle. They are *not* the same component: the props diverge (`label` vs `icon`),
   the sizing rules differ (hug-to-text vs fixed square), and the circle appears in
   exactly one place (3 uses, all in `ContactRow`). What they genuinely share is the
   **surface treatment**, and that is already tokenised — `shadow-glass` +
   `backdrop-blur-glass` + `border-on-dark`. So there is nothing left to abstract:
   both just apply the same three tokens. **No `GlassSurface` primitive.** If a third
   use appears later, promote it then — not before.
2. **The About chart is deferred**, not rebuilt — see §5.
3. **Selects are in — and so are excluded rows.** The footer form has 2 dropdowns.
   ⚠️ *Corrected:* this originally recorded "excluded rows are out". That was wrong —
   the first audit compared each row's frame opacity and icon dimensions, which are
   identical, and never checked the inner vector or the label opacity. 4 of the 30
   rows are excluded. **Lesson: compare leaf nodes, not container frames.**
4. **Services is a pinned scroll section** with 6 designed panels — see `ServicePanel`.

---

## 8. Open questions

*None outstanding.* The two that were here are resolved:

- **Services `07` numeral** — a padding spacer at reduced opacity, not a seventh
  service. Moot: the numerals, then the icon column, then `ServiceNumerals` itself
  are all gone.
- **`equal` (648) rollover** — verified against its at-rest frame. It behaves like
  `narrow` (image band → full-bleed, copy overlays the bottom); only the proportions
  differ. Recorded in the `Card` rollover table.
