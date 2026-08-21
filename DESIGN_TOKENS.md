# DESIGN_TOKENS.md — Otix Studio v2

**Deliverable 1.** The single source of every colour, type, spacing, radius, sizing
and motion value in the build. Source of truth is the **Figma file's variable
collections and styles** — these tokens are *exported* from those, not interpreted.

> If Figma changes, change `tailwind.config.ts` **and this doc** in the same pass.
> If code and this doc disagree, this doc wins — fix the code or STOP and flag it.

**Figma source:** file `8MlsF0YwRlv2PYgaRP0cgb`, page `Page 1`, frame `[D] Homepage` (`36:34`)

| Figma object | Count | Exported to |
|---|---|---|
| Collection `Colour Palette` | 41 vars | `theme.colors`, `backgroundImage` |
| Collection `Spacing` | 18 vars | `theme.spacing` |
| Collection `Radius` | 9 vars | `theme.borderRadius` |
| Text styles (grouped) | 21 | `theme.fontSize` |
| Effect styles | 2 | `theme.boxShadow` |
| Paint style `Gradient` | 1 | `backgroundImage.gradient-green` |

---

## 0a. Two provenances — read this first

Every token below is one of two things, and the difference matters more than any
individual value:

- **Exported** — it came out of the Figma file during D1. The tables in §1, §2, §3
  (structural), §4, §5 and §6 are exports.
- **Introduced** — it was invented during the build (D4–D8) because a component
  needed something the export didn't cover. These live in the `### Introduced
  during the build` subsections.

⚠️ **This document is the reference for THE SITE, not for the Figma file.** The two
diverged during D8 and the Figma file has since moved on independently. Where they
disagree, `tailwind.config.ts` is what ships and this document describes it. Do not
"correct" a value here to match a Figma frame without changing the config in the
same edit.

⚠️ Everything in the `Introduced` subsections was **backfilled on 13 Aug** after an
audit found 75 live tokens that this document had never mentioned. They had gone
into the config as components needed them and nothing brought them back here. If
you add a token, add its row in the same change — that is the whole discipline.

---

## 0. What changed from v1

v1 was a teal/navy design. v2 is green/neutral/ink. **Nothing in the v1 token layer
survives except the motion curves.** The v1 build is preserved at git tag
`v1-teal-navy` and in `_archive-v1-teal/`.

| | v1 | v2 |
|---|---|---|
| Brand | Teal `#10A4B0` / Navy `#000C1A` | Forest Green `#315C4A` |
| Page | White / `#FAF7F7` | Warm neutral `#F7F6F4` |
| Text | Navy on light | Ink `#141414` / `#626262` |
| Accent face | Geist Pixel (quotes) | **Adelle Regular Italic** (accent words) |
| Type scale | h1 70→80, h2 60, h3 50, h4 40, h5 35, h6 28 | h1 **84**, h2 60, h3 35, h4 32, h5 26 |
| Shadows | single glow + sunken | 4-layer `elevated`, `sunken`, `glass`, nav blur |
| Sections | 14 (incl. 2 Quotes + FAQs) | **11** — Quotes and FAQs cut |

---

## 1. Colour

Three scales, all 11 steps, plus semantic border/accent/overlay tokens.
The `Primary` / `Secondary` / `Tertiary` suffixes in the Figma names are the
**semantic role** assigned per scale — noted below, not encoded in the class name.

### Forest Green — `green-*`

Figma group `Forest Green/*`. Base is `600`.

| Token | Hex | Figma name | Role |
|---|---|---|---|
| `green-50` | `#F3F6F5` | Forest Green/50 | |
| `green-100` | `#E3EDE9` | Forest Green/100 **Tertiary** | body copy on dark |
| `green-200` | `#C6DCD3` | Forest Green/200 | |
| `green-300` | `#98C3B1` | Forest Green/300 **Secondary** | italic accents on dark, price symbols |
| `green-400` | `#5CA385` | Forest Green/400 | |
| `green-500` | `#407760` | Forest Green/500 | base for the alpha overlays |
| `green-600` | `#315C4A` | Forest Green/600 **Primary** | brand green — eyebrows, italic accents on light |
| `green-700` | `#264A3B` | Forest Green/700 | |
| `green-800` | `#1D3A2E` | Forest Green/800 | |
| `green-900` | `#142920` | Forest Green/900 | gradient start |
| `green-950` | `#0C1813` | Forest Green/950 | gradient end, CTA label on light |

### Neutral — `neutral-*`

Figma group `Neutral/*`. Warm (hue 40°, ~16–18% sat) — the page/background scale.

| Token | Hex | Figma name | Role |
|---|---|---|---|
| `neutral-0` | `#FFFFFF` | Neutral/0 White | **pure white** — inputs, cards, nav text |
| `neutral-50` | `#FBFBFA` | Neutral/50 | |
| `neutral-100` | `#F7F6F4` | Neutral/100 **Primary** | page background |
| `neutral-200` | `#F1EFEB` | Neutral/200 **Secondary** | alternate section background |
| `neutral-300` | `#E4E0D8` | Neutral/300 **Tertiary** | |
| `neutral-400` | `#CDC5B7` | Neutral/400 | |
| `neutral-500` | `#AFA48E` | Neutral/500 | |
| `neutral-600` | `#8E8167` | Neutral/600 | |
| `neutral-700` | `#6A614D` | Neutral/700 | |
| `neutral-800` | `#4B4335` | Neutral/800 | |
| `neutral-900` | `#2D291F` | Neutral/900 | |
| `neutral-950` | `#181611` | Neutral/950 | |

> `neutral-0` (#FFFFFF) is **deliberately distinct** from `neutral-50` (#FBFBFA)
> and `ink-50` (#FAFAFA). All three are in use. Do not consolidate them.

### Ink — `ink-*`

Figma group `Ink/*`. **0% saturation — pure grey, not warm.** Crisp ink reads
better on the warm page than warm-on-warm.

| Token | Hex | Figma name | Role |
|---|---|---|---|
| `ink-50` | `#FAFAFA` | Ink/50 **Tertiary** | headings/copy on dark |
| `ink-100` | `#F2F2F2` | Ink/100 | |
| `ink-200` | `#E0E0E0` | Ink/200 | |
| `ink-300` | `#C7C7C7` | Ink/300 | |
| `ink-400` | `#A6A6A6` | Ink/400 | input placeholder |
| `ink-500` | `#808080` | Ink/500 | |
| `ink-600` | `#626262` | Ink/600 **Secondary** | sub-copy / body |
| `ink-700` | `#474747` | Ink/700 | |
| `ink-800` | `#2E2E2E` | Ink/800 | |
| `ink-900` | `#141414` | Ink/900 **Primary** | headings |
| `ink-950` | `#0A0A0A` | Ink/950 | |

### Semantic

| Token | Value | Figma name | Used on |
|---|---|---|---|
| `border-divider` | `#CED6D0` | Border/Divider | hairlines, rules, chart bars |
| `border-hairline` | `rgba(235,235,235,0.6)` | Border/Hairline | faint rules on light |
| `border-input` | `rgba(0,0,0,0.1)` | Border/Input | form field border |
| `border-on-dark` | `rgba(255,255,255,0.2)` | Border/On Dark | badge border on dark/glass |
| `border-green` | `rgba(64,119,96,0.35)` | Border/Green | eyebrow pill + segmented toggle stroke — green 500 @ 35% |
| `accent-numeral` | `#9CB0A8` | Accent/Numeral | oversized service numerals **and the service icons** (D4: verified as the icon stroke on all six panels — they are not green) |
| `overlay-green-10` | `rgba(64,119,96,0.1)` | Overlay/Green 10 | green 500 @ 10% |
| `overlay-green-20` | `rgba(64,119,96,0.2)` | Overlay/Green 20 | green 500 @ 20% |

### Introduced (not in Figma)

| Token | Value | Why |
|---|---|---|
| `focus` | `#315C4A` | focus ring accent (= green 600). A11y baseline, no Figma spec. |
| `error` | `#E5484D` | form validation. No Figma spec. |
| `error-tint` | `rgba(229,72,77,0.12)` | error field fill. |
| `border-divider-soft` | `rgba(206,214,208,0.6)` | `border-divider` at 60%, **derived not picked** — a hand-chosen midpoint would drift the moment `divider` changed. Built for the mobile Services carousel's between-card hairlines. ⚠️ **Those hairlines were removed on 13 Aug** when the panels became cards, so this now has no consumer — see §7b. |

#### The glass family — the contact form (13 Aug)

⚠️ **The FIELD edge is stronger than the PANEL edge**, which is the opposite of what
it looks like it should be, and it is still the weaker of the two jobs. Full
reasoning is in `tailwind.config.ts` above `border.glass`; the short version:

| Token | Value | Note |
|---|---|---|
| `border-glass` | `rgba(255,255,255,0.12)` | the form panel's edge |
| `border-glass-field` | `rgba(255,255,255,0.26)` | each field's edge. **2.11:1 against the panel — does NOT meet the 3:1 of WCAG 1.4.11.** A knowing trade: 0.40 was the only compliant value (3.06:1) and read as heavy. Defensible only because every field carries a permanent visible label. **If accessibility is audited, this is the line that comes up.** |
| `overlay-glass-panel` | `rgba(255,255,255,0.05)` | panel fill |
| `overlay-glass-field` | `rgba(255,255,255,0.04)` | field fill |

Neither escape route exists on this ground — a pure black field measures 2.05:1
against the panel and a lighter fill tops out near 2.1:1 before the typed text
loses its own contrast. The edge is the only lever.

### Gradient

Figma paint style `Gradient` — linear, 90° (top → bottom).

```
bg-gradient-green : linear-gradient(180deg, #142920 0%, #0C1813 100%)
                    ( = green-900 -> green-950 )
```

### ⚠️ `bg-fade-right` — rebuilt 13 Aug

Was `rgba(…,0) 0% → 0.9 at 60% → 1`, over a `w-1/6` band. Read as harsh, and the shape
is the reason: a straight ramp nine-tenths opaque before it is two-thirds across puts
almost all of its change in the first half of the band, so the near edge lands on the
card as a **line** rather than as haze. **A gradient reads as harsh when its derivative
is largest where you can still see what is behind it.**

Now six stops approximating a smoothstep, over `w-1/4`:

| across the band | was | now |
|---|---|---|
| 24% | 0.36 | **0.06** |
| 44% | 0.66 | **0.24** |
| 64% | 0.91 | **0.56** |
| 84% | 0.96 | **0.86** |

Same two colours, same 0 → 1 range; only the distribution changed.

⚠️ **The curve and the band's width are ONE decision.** Easing the stops inside a narrow
band only relocates the hard edge; widening a linear ramp only makes a bigger hard edge.
The width lives at the call site in `Services`, the curve lives here, and neither is
correct alone. `w-1/4` is also exactly the sliver of the next card that `basis-3/4`
leaves showing, so the fade now covers that sliver and nothing else.

⚠️ Still tied to the PAGE background, and `transparent` is still not interchangeable
with `rgba(…,0)` at the near stop — Safari interpolates `transparent` through black,
which puts a grey bruise mid-ramp.

---

### Introduced during the build — gradients, scrims and glows

All `bg-*`, none from a Figma style. Scrims exist for legibility over imagery;
glows are atmosphere.

| Token | Value | Used on |
|---|---|---|
| `bg-gradient-services` | `180deg #264A3B → #0C1813` | **the Services panel's ground.** ⚠️ An ALIAS of `gradient-green-lift`, same value, so the two cannot drift. It exists because `-lift` is named for a TierCard rollover behaviour and a static section ground does not lift anything — a section reaching for a hover token gets "tidied up" by the next person. If they ever need to differ, change this one. |
| `bg-gradient-green-lift` | `180deg #264A3B → #0C1813` | TierCard rollover · Process step circles. green-700 → green-950 — a *lighter* top than `gradient-green`, so a card lifts toward the viewer on hover instead of just darkening. |
| `bg-gradient-green-flip` | `180deg #0C1813 → #142920` | ⚠️ **unreferenced.** Was the TierCard rollover until `gradient-green-lift` replaced it on 13 Aug. Delete unless it is coming back. |
| `bg-scrim-banner` | `180deg transparent 30% → ink-900 @80%` | Banner card copy over imagery |
| `bg-scrim-green-right` | `270deg green-950 @80% → transparent 62%` | Card copy panel, landscape |
| `bg-scrim-green-corner` | `315deg green-950 @88% → transparent 70%` | ⚠️ **unreferenced.** |
| `bg-scrim-hero-foot` | `180deg transparent → green-950` | Hero foot, blending the carousel into the section below |
| `bg-glow-services` | radial, `rgba(203,211,206,0.85)` closest-side | Services atmosphere |
| `bg-glow-form` | radial ellipse, `rgba(38,74,59,0.9)` farthest-side | behind the contact form panel. ⚠️ Sits at `-inset-block` and **must be clipped by an `overflow-hidden` ancestor** — unclipped it pushed the document 20px wide and produced a page-wide horizontal scroll. |
| `bg-fade-right` | `90deg transparent → neutral-100` | mobile Services carousel, fading the next card at the right edge to signal scrollability. ⚠️ Hard-codes `neutral-100`; it only works on the page background. |

### Skipped — decorative only

These appear in the file but are **not tokenised**. They belong to the mocked
dashboard graphic and to placeholder artefacts, and carry no design meaning.

| Colour | Uses | Where |
|---|---|---|
| `#8C8C8C` | 14 | chart mockup axis/legend labels |
| `#D9D9D9` | 6 | "Bounding box" placeholder layers |

---

## 2. Type

**Faces**

| Family | Weights in use | Token | Notes |
|---|---|---|---|
| Manrope | Regular 400, Medium 500, SemiBold 600, Bold 700, ExtraBold 800 | `font-sans` | primary. ExtraBold is logo-only. |
| Geist Mono | Medium 500 | `font-mono` | eyebrows only |
| **Adelle** | **Italic 400** | `font-serif` | accent words only. ⚠️ **Adobe Typekit, not self-hosted** |

> ⚠️ **Adelle replaced Libre Baskerville on 13 Aug** and is the ONE font here that
> is a network dependency: kit `nzb3tlw`, loaded by a `<link>` in `app/layout.tsx`,
> Georgia as fallback. Everything else is self-hosted woff2 from `/public/fonts`.
>
> The kit serves adelle 300/400/600 roman + italic; **the design uses exactly one
> face, italic 400**. Semibold 600 was trialled the same day and reverted — at
> 60–200px it matched Manrope's weight instead of sitting under it, so the italic
> stopped reading as an aside. The weight lives on the three accent tokens below,
> so a `font-serif` element on any OTHER size token inherits that token's weight
> and lands on a different Adelle face.

> Geist Pixel is **dropped** — it was quotes-only in v1 and the Quote sections are cut.

Figma `letterSpacing` is a % of em and maps 1:1 to `em` here (`-3%` → `-0.03em`).
Line-heights are unitless. Figma `AUTO` line-height → `1`.

**Scale** — exported from the 20 Figma text styles. Max is the Figma desktop
figure; `clamp()` scales to the mobile min. Fluid range 375px → 1440px.

| Token | Figma style | Size (min→max) | LH | LS | Weight |
|---|---|---|---|---|---|
| `text-numeral` | **Display/Numeral** | 100 → 200 | 1 | -0.01em | 400 *italic serif* |
| `text-stat-badge` | — **not in Figma** | 28 → 40 | 1 | -0.03em | **700** |

> ### ⚠️ `text-service-title` — a real step, added 13 Aug
>
> **A new step between `h2` (60) and `h3` (35), at 40.** The Services card titles landed
> between the two: `h2` made a card title compete with the section heading above it,
> `h3` made six cards read as captions. The run was h2 → h3 → h2 → 50 → 45 → **40**.
>
> Used by `ServiceCard` (as its `h3`) and by `QuizPanel` while it is a card, which is
> what makes the seventh card match the six beside it.
>
> ⚠️ **It has no `-accent` partner and must not get one.** A card title never carries an
> italic accent in this design; the accent is a section-heading device. `QuizPanel`'s
> accent appears only once it has grown to `text-h2`.
>
> 🔴 **Its clamp is mirrored in JS** as `TITLE_PX` in `Services.tsx`, because
> `QuizPanel`'s heading SCALES between this token and `text-h2` and CSS cannot divide
> one `clamp()` by another. **Change this row, change that function.** See §7c.
<!-- D8 additions: bg-scrim-hero + bg-glow-hero (HERO Container fill and Ellipse 4),
     w-arch-glow (1100/1440 as a %), h/w-service-glyph (100px -> 72px, 13 Aug),
     h-chart / chart-dot / stat-badge (StatChart), transition-clip + transition-reveal.

     ⚠️ `text-stat-badge` is the FIRST type token with no Figma style behind it.
     Everything else in this table is an export; that one is a build decision
     (Jimmy, 12 Aug) for a component that is itself designed rather than exported.
     If the stat disc ever gets drawn in Figma, bind it and this becomes an export
     like the rest. -->

| `text-h1` | Heading/H1 | 40 → **84** ⚠️ | 1.2 | -0.03em | 400 |
| `text-h1-accent` | Heading/H1 Italic Accent | 40 → **84** ⚠️ | 1.2 | -0.04em | 400 *italic serif* |
| `text-h2` | Heading/H2 | 34 → 60 | 1.2 | -0.03em | 400 |
| `text-h2-accent` | Heading/H2 Italic Accent | **36 → 62** ⚠️ | 1.2 | -0.05em | 400 *italic serif* |
| `text-service-title` | — **not in Figma** | 28 → **40** | 1.2 | -0.03em | 400 |
| `text-h3` | Heading/H3 | 26 → 35 | 1.1 | -0.01em | 500 |
| `text-h4` | Heading/H4 | 24 → 32 | 1.2 | -0.04em | 400 |
| `text-h5` | Heading/H5 | 22 → 26 | 1.2 | -0.05em | 500 |
| `text-stat-display` | Stat/Display | 34 → 60 | 1.2 | -0.06em | 600 |
| `text-stat-value` | Stat/Value | 22 → 26 | 1.4 | -0.01em | 700 |
| `text-stat-symbol` | Stat/Symbol | 20 → 24 | 1.4 | -0.01em | 700 |

> ⚠️ **The two rows marked ⚠️ are the first type tokens that DEVIATE FROM THEIR
> FIGMA STYLE.** Both were changed in code on 13 Aug and **have not been pushed
> back to Figma**, so the file and the build disagree until they are — the reverse
> of the direction CLAUDE.md §8 requires.
>
> · `text-h1` / `text-h1-accent` **80 → 84 at the max, min held at 40.** A Hero
>   sizing call. The min is pinned because the mobile Hero's line breaks and the
>   mobile menu's link size (`Nav` uses `text-h1`) were both tuned against 40.
>
> · `text-h2-accent` **34 → 36 and 60 → 62**, so it is now 2px LARGER than `text-h2`
>   at both ends rather than equal to it. Optical compensation, not drift: Adelle's
>   italic sits on a smaller optical size than Manrope, so at a matched 60px the
>   accent read as the smaller of the two faces. `h1-accent` needs no such nudge —
>   checked at 80px in the Hero, where it already matched.
| `text-body-lg` | Body/Large | 16 → 18 | 1.5 | -0.01em | 400 |
| `text-body-lg-strong` | Body/Large Strong | 16 → 18 | 1.5 | -0.01em | 700 |
| `text-body` | Body/Base | 16 | 1.5 | -0.01em | 400 |
| `text-body-strong` | Body/Base Strong | 16 | 1.5 | -0.01em | 700 |
| `text-list-item` | Body/List Item | 16 | 1.4 | -0.01em | 400 |
| `text-list-item-strong` | Body/List Item Strong | 16 | 1.4 | -0.01em | 700 |
| `text-body-sm` | Body/Small | 14 | 1.4 | -0.01em | 400 |
| `text-body-sm-strong` | Body/Small Strong | 14 | 1.4 | -0.01em | 700 |
| `text-eyebrow` | Label/Eyebrow | 13 | 1 | 0.1em | 500 *mono, uppercase* |
| `text-label` | Label/Button | 14 | 1 | 0.06em | 600 *uppercase* |
| `text-tag` | Label/Tag | 14 | 1.2 | -0.02em | 500 |

**Body/List Item split:** both are 16px. `body` is 1.5 line-height (paragraph
copy), `list-item` is 1.4 (tighter, for list rows). This is a real role split,
not drift — 33 list rows vs 12 paragraphs.

**Mobile minimums are PROPOSED.** There is no mobile design yet. They are set so
the ratio between steps holds and nothing drops below 14px. Revisit in D5.

### Type fixes applied during the audit

The Figma file had 186 one-off text layers and **zero** shared styles. Creating the
20 styles fixed these inconsistencies in the same pass:

| Fix | Was | Now |
|---|---|---|
| Eyebrow size | 4 at 12px vs 13 at 13px | all 13px |
| Hero "harder" | fixed 76px LH + -2.98px LS | 120% LH + -4% LS |
| Hero sub-copy | 0% LS (every other 18px used -1%) | -1% |
| H4 / H5 / Tag LS | px-based (-1.28px, -0.28px) | %-based (-4%, -5%, -2%) |
| Footer italic accent | `#98C3B1` | `#315C4A` (matches all other light-bg accents) |
| Process numeral "02" | **no fill set at all** | `accent-numeral` |
| GET STARTED label | `#FBFBFA` | `#FFFFFF` |

**164 of 186** layers are now bound to a shared style. The 22 left unbound are:
logo wordmark (4 — a deliberate lockup, not part of the type system), chart mockup
labels (14), oversized 01/02 numerals (2), and 2 mixed-font runs (see open questions).

### D4 addendum — `Display/Numeral` (style 21 → 22)

Building the Services section surfaced the numerals as a genuine gap, so a **21st
style, `Display/Numeral`** (Adelle Regular Italic · 200 · LH 100% · LS **-1%**)
was created in Figma and exported here as `text-numeral`. The **six active**
numerals across `SERVICES - 01…06` are now bound to it.

The **six "next" numerals stay at 150px and stay unbound** — deliberately. 150 is
exactly `200 × 0.75`, and the column animates *continuously* between the two
sizes, so the smaller numeral is a **`scale-75` transform, not a second type
size**. A second style would only ever describe a rest state that motion
overrides, which is how tokens drift.

They did, however, carry the **last of the px-based letter-spacing** that §2 above
converted everywhere else (`-1.28px` — the same absolute value at two different
sizes, so −0.64% on the 200 and −0.85% on the 150). All twelve are now `-1%`.
A percentage tracks the size, which is precisely what makes the 0.75 relationship
hold: it is what lets one token express both.

⚠️ The 100px mobile minimum is **PROPOSED** — there is no mobile design for this
section. Confirm in D5.

⚠️ Layer names in the numeral column were inconsistent across the six panels
(`Number`, `Top number`, `Section Number Big`, `Large number`, `Large Number`,
`07`). Normalised to `Numeral (active)` / `Numeral (next)` per CLAUDE.md §3.

The former 24px Bold group was resolved: **footer contact values** are now
`Heading/H5`, and the **price symbols** (`$`, `+`) got their own `Stat/Symbol` style.

---

## 3. Spacing

### Component ramp — fixed px

| Token | px | Absorbs |
|---|---|---|
| `xxs` | 2 | |
| `xs` | 4 | |
| `sm` | 8 | `8.1` (icon internals), `9` (price symbol padding) |
| `md` | 12 | |
| `base` | 16 | `16.01` (CTA link gap) |
| `lg` | 20 | |
| `xl` | 24 | `25` (logo container gap) |
| `2xl` | 28 | |
| `3xl` | 32 | |
| `4xl` | 40 | |
| `5xl` | 48 | |
| `6xl` | 60 | |
| `7xl` | 120 | |

### Structural — fluid

**Two section variants.** Both land content on the same **60px optical line**:

- **Containered** — sits inside the 10px gutter. `10 + 50 = 60`
- **Flush** — full-bleed, no gutter (the Hero only). `0 + 60 = 60`

| Token | min → max | Applies to |
|---|---|---|
| `section-x` | 20 → 50 | containered sections |
| `section-y` | 56 → 100 | containered sections |
| `section-x-flush` | 20 → 60 | flush sections (Hero) |
| `section-y-flush` | 64 → 120 | flush sections (Hero) |
| `block` | 48 → 80 | gap between blocks within a section |
| `col` | 40 → 60 | gap between columns |
| `gutter` | 10 / 5 | page frame — `var(--space-gutter)`, set in `globals.css` |

> This is **not** drift. The 50/60 and 100/120 split is deliberate compensation
> for the gutter. Confirmed by Jimmy.

### Introduced during the build — one-off spacings

Named rather than arbitrary because CLAUDE.md §6 bans arbitrary values outright,
so anything the ramp doesn't cover has to become a token.

| Token | Value | Used on |
|---|---|---|
| `testimonials-foot` | `150px` | Testimonials foot |
| `services-inset` | `clamp(40px, 18.9px + 5.63vw, 100px)` | Services numeral column inset |
| `step-stagger` | `76px` | Process step vertical offset |

### Introduced during the build — sizing

⚠️ **These are the tokens most likely to be edited in isolation and break something
two files away.** The coupled pairs are flagged; changing one half of a pair
without the other is how the card rollover picked up a 2px-fat bottom border.

**Fixed**

| Token | Value | Used on |
|---|---|---|
| `w/h-icon-sm` · `w/h-icon-lg` | `16px` · `32px` | Icon sizes either side of the 24px default. |
| `w/h-icon-xl` | **`35px`** | The Quiz's back arrow, 35 in a 50px disc (ratio 0.70). It breaks the 16 / 24 / 32 ramp's 8px step, which is recorded rather than tidied. 🔴 ⚠️ **IT TOOK EIGHT PASSES, AND MOST OF THEM WERE CHASING A BUG.** The run was 32 → 40 → 36 → 32 → 34 → 33 → 36 → 35, and the pass that set `h-icon-lg` (32) **rendered at 16px**: `Arrow` carried its own `h-icon-sm` base, `cn` is a plain join rather than `tailwind-merge`, so both classes applied and **CSS source order decided** — Tailwind emits `.h-icon-lg` before `.h-icon-sm`, so the smaller rule won. "32 is too small" was really "16 is too small". `Arrow` no longer carries a base size. **Two lessons: (1) with a plain-join `cn`, a component's default class does not lose to a caller's override — it races it in the stylesheet; (2) when eye-tuning converges on a 1px bracket, stop and verify the value is reaching the element.** |
| `w/h-avatar` | `46px` | Testimonial avatar |
| `w/h-step-icon` | `120px` | Process step circle |
| `w/h-step-glyph` | `48px` | glyph inside that circle |
| `w/h-service-glyph-sm` · `w/h-service-glyph` | `48px` · **`72px`** | Services icon — 48 on a phone, 72 from `md`, pinned to the card's top-right corner. ⚠️ **`service-glyph` was 100px until 13 Aug** (100 → 64 → 80 → 72). It was sized against a `text-h2` heading sitting loose on the page; once the heading dropped to `text-h3` and the copy moved into a card, 100 stopped being a counterweight and became the loudest thing in the box. The token was repointed rather than a third added — a `-sm`/`-md`/plain trio for one icon is a family nobody keeps straight. ⚠️ **Must be set in BOTH `width` and `height`** — `-sm` landed in `width` only once and the icon rendered as a slot. |
| `w-quote-mark` | `53px` | ⚠️ v1 leftover — `QuoteMark` is not a v2 component |
| `w/h-watermark` | `min(clamp(560px, 419.3px + 37.56vw, 960px), 86vh)` | the oversized Otix mark behind the Services reel. ⚠️ Deliberately larger than the space it occupies — it is **cropped by the right edge**, which is what stops it reading as a logo and lets it read as texture. ⚠️ **The `min(…, 86vh)` is what keeps that crop SIDEWAYS ONLY** (13 Aug): the reel sits in an `h-screen overflow-hidden` box, so at 960 the mark lost its top and bottom as well — a flat edge across a circular form, which reads as a fault rather than a crop. The right-edge crop continues off the page; a horizontal slice does not continue anywhere. ⚠️ One value used for **both** width and height — the mark is square, so capping only the height would squash it. |
| `w/h-service-glyph` | `72px` | ⚠️ **Desktop no longer renders it.** The icon column was removed on 13 Aug when each card gained its own image. Still used by `ServicePanel` on mobile. |
| `w-radio` · `h-radio` | `22px` | Quiz option radio |
| `w-spine` | `3px` | Services progress spine |
| `w/h-dot-active` | `10px` | active carousel step dot (`dot` is 6px) |
| `h-stepper` | `4px` | Quiz progress bar |
| `h-testimonial` | `304px` | Testimonial card |
| `w-card-inner` | `calc(100% - 8px)` | ⚠️ **Coupled to `p-xs` (4px) on `Card`.** The card's media expands to this on hover; if the card's padding changes this must change with it. |
| `minHeight tap` | `44px` | CLAUDE.md §5 tap-target floor |
| `minHeight field-lg` | `184px` | textarea |
| `minHeight option` | `68px` | Quiz option row |
| `scale press` | `0.985` | press feedback |

**Proportional and fluid**

| Token | Value | Used on |
|---|---|---|
| `flexBasis card-2/3/4` | `calc(50% - 12px)` · `calc(33.3333% - 16px)` · `calc(25% - 18px)` | carousel item widths — proportions, never fixed px (CLAUDE.md §0) |
| `flexBasis quiz-media` | `35.61%` | Quiz media column |
| `maxWidth measure` | `68ch` | ⚠️ **the site's ONLY width cap** — the long-form-copy exception in CLAUDE.md §0 |
| `maxWidth measure-wide` | `75ch` | ⚠️ **unreferenced** |
| `aspectRatio media` | `4 / 3` | ⚠️ **NEW, 13 Aug.** The stacked `ServiceCard`'s image on mobile. There was no `aspect-*` scale here beyond Tailwind's own `square`/`video`, and `aspect-[4/3]` is an arbitrary value that ESLint bans (CLAUDE.md §6) — so the ratio gets a name, which is right anyway: it IS a design decision, the shape of every picture on a phone. **Not `square`**, which is the row card's: square works BESIDE copy because it matches the copy block's height; square ON TOP of copy, in a card three-quarters of a phone wide, takes most of the screen before a word is read. |
| `h-service-panel` | `clamp(480px, 409.6px + 18.78vw, 680px)` | Services panel |
| `h-card-wide` | `clamp(450px, 404.2px + 12.21vw, 580px)` | narrow/equal Card |
| `h-banner` | `clamp(520px, 456.6px + 16.9vw, 700px)` | Banner |
| `h-media` | `clamp(180px, 148.3px + 8.45vw, 270px)` | Card media, rest |
| `h-media-wide` | `clamp(220px, 177.7px + 11.27vw, 340px)` | Card media, rest (wide) |
| `h-media-full` | `clamp(392px, 346.2px + 12.21vw, 522px)` | ⚠️ **Coupled to `h-card-wide` minus 2 × `p-xs`.** Derived from Figma's 5px inset originally, which is why the hover state's bottom border sat 2px fatter than the other three sides. Rebuilt off 8. |
| `h-media-full-wide` | `clamp(442px, 396.2px + 12.21vw, 572px)` | same pairing, equal variant |
| `h-quiz` | `clamp(560px, 528.3px + 8.45vw, 650px)` | Quiz panel |
| `h-quiz-media` · `-sm` | `clamp(550px…640px)` · `clamp(220px…340px)` | Quiz media, desktop and mobile |
| `h-spine` | `clamp(240px, 204.8px + 9.39vw, 340px)` | Services spine. ⚠️ The 30px thumb length is a **constant in `Services.tsx`, declared twice** — it is not a token and must be changed in both places. |

### Dropped as one-offs

`80`, `90`, `150` padding — all three are single uses on one Hero *Carrousel Item*
with no repeating pattern.

---

## 4. Radius

| Token | px | Absorbs | Used on |
|---|---|---|---|
| `xs` | 4 | | |
| `sm` | 6 | | form inputs |
| `md` | 8 | `9` | image overlays (30 uses) |
| `lg` | 16 | `15` | nav bar, chart card |
| `xl` | 20 | | eyebrow pills |
| `2xl` | 24 | | |
| `3xl` | 30 | | sections + cards |
| `4xl` | 48 | `45` | |
| `full` | 9999 | `50`, `100`, `1000` | pills, circles, avatars |

---

## 5. Elevation and effects

| Token | Figma | Value |
|---|---|---|
| `shadow-elevated` | effect style **Shadow Effect** | 4 stacked layers — see below |
| `shadow-sunken` | effect style **Inset Sunken** | `inset 0 1 5 rgba(0,0,0,.08)`, `inset 0 1 0 rgba(0,0,0,.04)` |
| `shadow-glass` | *(unstyled, 15 uses)* | `0 0 10 rgba(49,92,74,.15)` — green 600 @ 15% |
| `backdrop-blur-nav` | *(unstyled, nav)* | `15px` — Figma `BACKGROUND_BLUR` |
| `backdrop-blur-glass` | *(unstyled, eyebrow pills)* | `4px` — approximates Figma `GLASS` |

**`shadow-elevated`** (18 uses — cards, hero carousel):
```
0 40px 40px -24px rgba(0,0,0,0.08)
0 4px  6px  0     rgba(0,0,0,0.04)
0 1px  2px  0     rgba(0,0,0,0.08)
0 0    0    1px   rgba(0,0,0,0.04)   <- hairline ring, not a shadow
```

> **`GLASS` has no CSS equivalent.** Figma's material effect is approximated with
> `backdrop-blur-glass` + `border-on-dark` + `shadow-glass`. Verify against the
> Figma render in D4 and adjust — this is the one token that is an interpretation,
> not an export.

> ⚠️ **`blur-reveal` (6px), added 13 Aug** — the scroll reveal's blur-to-sharp. Small on
> purpose: a real filter on the element, so it blurs the card's own type and shadow, and
> past about 8 the copy stops being recognisable and the entrance reads as a page loading
> badly. Paired with `transitionProperty.reveal`, which gained `filter` at the same time
> — the two are one decision.

### Introduced during the build — effects

| Token | Value | Used on |
|---|---|---|
| `shadow-glass-field` | `inset 0 1px 0 rgba(255,255,255,.10)`, `inset 0 2px 6px rgba(0,0,0,.18)` | contact form fields — the inner lip that makes a translucent field read as recessed rather than as a flat patch |
| `shadow-focus-error` | `0 0 0 3px rgba(229,72,77,0.25)` | focus ring on an invalid field |
| `backdrop-blur-panel` | `20px` | the contact form panel |
| `blur-frost` | `8px` | frosted reveal |

⚠️ **`backdrop-blur-panel` and `backdrop-blur-glass` must not nest.** A blurred
eyebrow pill inside a blurred panel composites twice — muddy everywhere and buggy
in Safari. `backdrop-filter` also needs texture behind it: over a flat fill it does
nothing at all, which reads as "the blur is broken" rather than "there is nothing
to blur".

### Figma hygiene fixed during this pass

- `Shadow Effect` existed **twice** — local, and as a remote library style
  misspelled `Shdow Effect` (3 nodes). Consolidated onto the local style.
- `Inset/Sunken` was a **remote** style. Localised as `Inset Sunken`.
- `Secondary/White` — a leftover **v1** remote paint style on 11 nodes. Replaced
  with the `Neutral/0 White` variable.
- `Neutral/200 Secodary` typo → `Neutral/200 Secondary`.

Every style in the file is now local. There are no remote dependencies.

---

## 6. Motion

Carried unchanged from v1 — these curves are design-agnostic and were tuned with
Jimmy over the previous build. Re-confirmed in **D6 / MOTION_SPEC.md**.

| Durations | | Easings | |
|---|---|---|---|
| `snap` | 50ms | `standard` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `instant` | 120ms | `out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `fast` | 180ms | `in-quart` | `cubic-bezier(0.5, 0, 0.75, 0)` |
| `base` | 280ms | `in-out-quint` | `cubic-bezier(0.83, 0, 0.17, 1)` |
| `slow` | 420ms | `cta-expand` | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| `expand` | 560ms | `cta-retract` | `cubic-bezier(0.22, 1, 0.36, 1)` |
| `slower` | 640ms | `smooth` | `cubic-bezier(0.33, 1, 0.68, 1)` |
| `slowest` | 900ms | `soft-spring` | `cubic-bezier(0.34, 1.2, 0.64, 1)` |
| `cinematic` | 1200ms | | |

### Introduced during the build — keyframes

Keyframes live in `globals.css` (the "few things Tailwind can't express", CLAUDE.md
§4); these are the named `animation` tokens that drive them.

| Token | Value | Used on |
|---|---|---|
| `animate-link-pulse` | `1000ms ease-in-out infinite` | nav link hover |
| `animate-caret-blink` | `1100ms steps(1, end) infinite` | Hero rotating-word caret. Holds solid longer than hidden — a 50/50 blink strobes at this size. |
| `animate-step-float` | `7000ms ease-in-out infinite` | Process circles. Four points on a shallow arc, x drift < y drift; equal amounts read as a mechanical orbit. Amplitudes stay under the connectors' 22px tuck. |
| `animate-step-in-up` / `-down` | `420ms` `cubic-bezier(0.33,1,0.68,1)` both | Quiz screen entry. **Two directions so a screen never arrives from the side the last one left towards** — without the pair, Back reads as another step forward. |
| `animate-menu-panel` | `280ms` | mobile menu panel |
| `animate-menu-row` | `420ms` | mobile menu rows, delay set inline from index |

> ⚠️ **These are ANIMATIONS, not transitions, and that is load-bearing.** A
> transition needs the element painted in a start state and then changed, which
> from React means scheduling the change in a `requestAnimationFrame` — **and rAF
> does not fire in a backgrounded tab.** Leave a tab and come back and the element
> is stranded at `opacity: 0`. This cost four separate bugs during the build (Quiz
> screens, the Services scroll latch, the ContactPopup slide-in, Carousel
> progress). Animations play on mount, full stop.
>
> The reduced-motion block collapses all of them to ~0.001ms, which is the right
> degradation — the menu still appears, it just does not travel.

### Introduced during the build — transitions

| Token | Property list |
|---|---|
| `transition-elastic` | `transform, color` |
| `transition-frost` | `filter, transform` |
| `transition-option` | `background-color, border-color, box-shadow, transform` |
| `transition-dissolve` | `opacity, filter, transform` |
| `transition-unlock` | `filter, opacity` — ⚠️ **unreferenced** |
| `font-serif-condensed` | ⚠️ orphaned 13 Aug. The Services numerals used adelle-condensed italic 600 for part of that day; Jimmy asked for condensed **regular**, the kit ships condensed in italic 600/700 only, so they went to plain `adelle` italic 400 instead. **Keep** — the family is in the kit and loading costs nothing until something uses it. |
| `z-cursor` (`100`) | ⚠️ **unreferenced** — a v1 `CustomCursor` leftover. v2 does not mount one; `globals.css` carries the matching commented-out `cursor: none` block and the note that both come back together or neither does. |
| `ease-out-back` | `cubic-bezier(0.175, 0.885, 0.32, 1.6)` |

`prefers-reduced-motion` is respected everywhere — see CLAUDE.md §5.

⚠️ The reduced-motion block deliberately does **not** use the blanket "kill every
transition" snippet. It restricts `transition-property` to colour, opacity and
box-shadow, so colour still eases (hover states that snap between colours read as
broken, not calm) and the focus ring still animates — the one piece of feedback a
keyboard user cannot do without. Transform and size are unlisted, so expansions
genuinely do not animate. Full rationale in MOTION_SPEC.md §7.2.

---

## 7. Sections

11 sections. Frame `[D] Homepage` is 1440 × 10988.

| # | Section | Figma node | Geometry |
|---|---|---|---|
| 1 | Hero | `67:1753` | **flush** |
| 2 | About | `36:89` | containered |
| 3 | Work | `36:148` | containered |
| 4 | Services | `36:214` | containered |
| 5 | Banner 1 | `36:232` | containered |
| 6 | Why Otix | `36:241` | containered — ⚠️ frame is **misnamed "WORK"** in Figma |
| 7 | Process | `36:285` | containered |
| 8 | Banner 2 | `36:1162` | containered |
| 9 | Pricing | `36:341` | containered |
| 10 | Testimonials | `36:1403` | containered |
| 11 | Footer | `36:605` | containered |

**Cut from v1:** Quote ×2, FAQs.

Every horizontal measurement from the 1440 frame is a **proportional reference
only** — translate to `%`, `fr`, `clamp()`, `minmax()`. The frame width is never
reproduced as a fixed width. See CLAUDE.md §0.

---

### Introduced during the build — the Services glass card (13 Aug)

| Token | Value | Note |
|---|---|---|
| `overlay-glass-card` | `rgba(255,255,255,0.07)` | ⚠️ **This carries the frost, not the blur.** `backdrop-filter` only shows where there is texture behind it, so a blur-led card looked frosted where the wheel passed and plain everywhere else — the material appeared and disappeared as you scrolled. The fill is there regardless of the backdrop. Went 0.08 → 0.10 → 0.07. |
| `backdrop-blur-card` | `20px` | Only has to soften the wheel where it shows through. 40 → 28 → 20; each step down came from the frost reading as an effect rather than as a material. |

> ⚠️ **MOBILE ONLY since 13 Aug.** These describe `ServicePanel`, which the desktop
> section no longer renders — the orbit uses `ServiceCard`, an opaque `neutral-0` card
> on the page cream with no glass at all. Both tokens are still live, but only below
> `md`. They also depend on `gradient-services` still being painted there, which is the
> inconsistency recorded in AUDIT §6.
>
> ⚠️ `border-rule` (4px) **was here and is deleted** — see §7b. The rule it described is
> now a flex sibling sized with `w-xs`, not a border.

⚠️ **Deliberately separate from the contact form's `glass-panel` / `backdrop-blur-panel`.**
Raising those to solve a Services problem would quietly re-open the form's edge-contrast
trade two sections away.

### Measured — the Services panel (13 Aug)

Text and UI contrast on the glass card over `gradient-services`, sampled at three
points down the ramp. The card fill is white @5%, so the ground shows through and
the ratio moves with it — the TOP of the ramp is the worst case and is the row to
check after any change.

| | top (t=0.15) | mid | low |
|---|---|---|---|
| heading `ink-50` | **9.08** ✅ | 11.47 | 14.21 |
| body `green-100` | **7.92** ✅ | 10.01 | 12.40 |
| rule + icons `green-300` *(needs 3:1)* | **4.86** ✅ | 6.14 | 7.61 |
| card edge `border-glass` *(needs 3:1)* | **1.63** ❌ | 1.68 | 1.67 |

⚠️ **The card edge does not meet 1.4.11's 3:1**, and it is the same knowing trade
already on record for the contact form's field edges — see `border-glass-field`.
Defensible here for a different reason: the card is not a control. 1.4.11 governs
the boundary of things you operate, and these cards are read, not used. Their
content carries its own contrast well clear of AA.

⚠️ `green-600` numerals measure **1.83:1** against the ramp. That is deliberate and
correct: they are background texture, not text, and `aria-hidden` in
`ServiceNumerals`. Raising them to pass would stop them being a background.

---

## 7b. Unreferenced tokens — audited 13 Aug

Defined in `tailwind.config.ts`, used nowhere in `components/`, `app/`, `content/`
or `lib/`. Not automatically wrong — a token can legitimately wait for a component
— but each one should be a decision rather than a leftover.

| Token | Status |
|---|---|
| `bg-gradient-green-flip` | superseded by `gradient-green-lift` (13 Aug) |
| `bg-scrim-green-corner` | never used |
| `border-divider-soft` | orphaned 13 Aug — the mobile Services hairlines it was built for were replaced by the card surface. **Keep**: it is derived from `border-divider` rather than picked, so it costs nothing and is the right answer next time a soft rule is needed. |
| `text-list-item-strong` | never used |
| `maxWidth measure-wide` | never used |
| `transition-unlock` | never used |
| `ease-in-out-quint` · `ease-cta-retract` · `ease-soft-spring` | motion tokens with no current consumer — `cta-retract` is applied via `globals.css`, not a class |
| `w-quote-mark` | v1 leftover — `QuoteMark` is not a v2 component |
| `neutral-400…950` (7 steps) | the warm scale is background-only, so its dark end has no job. **Keep** — deleting a scale's tail invites `neutral-*` being reached for as text later, which §1.1 forbids. |
| `ink-200`, `ink-300`, `ink-700`, `ink-950` | scale completeness. Keep. |
| `border-hairline`, `error`, `error-tint` | reachable states not yet on the page (form validation) |
| `bg-gradient-services` | 🔴 **fully orphaned 13 Aug.** Desktop dropped it when Services went back to the page cream; mobile dropped it when that branch was rebuilt to match (AUDIT §6, resolved). Verified: the string does not appear in the rendered HTML anywhere on the page. **Keep for now** — it is an alias of `gradient-green-lift`, so it costs nothing and re-pointing a section at a dark ground is a live possibility. Delete it if Services is still cream at launch. |
| `overlay-glass-card` · `backdrop-blur-card` | orphaned 13 Aug — they were `ServicePanel`'s glass, and that component is superseded by `ServiceCard`. **Delete with the component.** |
| `w/h-service-glyph` · `-sm` | orphaned 13 Aug — same reason. No branch renders a per-service glyph now; `SERVICE_ICONS` still exists in `Icon.tsx`. |
| `h-service-panel` | referenced only by prose in `Services.tsx` and by the deleted `ServiceNumerals`. Effectively orphaned. |
| `text-numeral` | now truly orphaned — `ServiceNumerals` is deleted. **Keep**: the D4 addendum below is the only record of what Figma style it maps to. |
| `text-numeral` · `accent-numeral` | the reel's numerals are gone; `accent-numeral` survives as the **service icon** stroke, `text-numeral` has no consumer. **Keep both** — the D4 addendum below explains what they map to in Figma, and losing that mapping costs more than the token does. |
| `w-watermark` / `h-watermark` | ✅ **now used** — the Services wheel. See §3 sizing. |

### Removed on 13 Aug — deleted, not merely unreferenced

Each was added for an approach that was tried and reverted. They are recorded here
because the REASONING is worth keeping and the token is not: a token nothing uses is a
token a future change will find and misapply.

| Token | Was for | Why it cannot come back |
|---|---|---|
| `borderWidth.rule` (4px) | the thick green rule beside the Services card sub-copy | That rule is no longer a border — `ServicePanel` draws it as a flex sibling sized with `w-xs`, which is what lets it sit at a fixed height beside copy of any length. It was the only non-hairline border on the site. |
| `transitionProperty.expand` | panel 07's box, under the CSS-transition latch | The latch was reverted within the hour: the things staged on `expand` include a **type token swap** and an **inline padding number**, and a CSS transition can interpolate neither. The expansion has since been a scroll scrub twice. |
| `transitionProperty["expand-inner"]` | panel 07's interior, same latch | Same. |
| `transitionDelay.stagger` (260ms) | sequencing that interior behind its box | The whole `transitionDelay` group went with it. Nothing on the site delays a transition now — staging is done with ramps on one scroll value, which is finer-grained and cannot fall out of step. |
| `fontFamily["serif-condensed"]` | the reel's oversized numerals | Those are gone, and it could never have been correct anyway: kit `nzb3tlw` ships adelle-condensed in **italic 600/700 only** while the design uses italic 400. A token that can only render the wrong weight is worse than no token. |

### Renamed on 13 Aug

| Was | Now | Why |
|---|---|---|
| `transitionDuration.expand` (560ms) | `transitionDuration.measured` | Every other step in that scale is named for a SPEED; this one was named for a FEATURE — the Services expansion, which has no duration at all now it is scrubbed by scroll. It also had two unrelated consumers (`StatChart`'s trend line, `Card`'s featured rollover), which is the tell that it was always a scale step wearing a feature's name. Renamed rather than deleted: 560 is a real gap between `slow` (420) and `slower` (640). |

---

## 7c. MIRRORED VALUES — token numbers transcribed into JavaScript

⚠️ **Read this before changing any type or spacing token below.**

Seven values are duplicated as plain numbers in `.tsx`, because they have to
**interpolate** — a scroll value drives them frame by frame — and Tailwind has no way
to express "the number behind this class". Each is individually justified and commented
at its site. Collectively they are a **silent failure mode**: change the token and the
site still builds, still passes lint, and renders slightly wrong.

There is no mechanical defence available. This table is the defence.

| Value | Lives in | Mirrors |
|---|---|---|
| `48 → 100` (`padY`) | `Services` | `5xl` (48) · `section-y` max (100) |
| `48 → 100` (`padX`) | `Services` | `5xl` (48) · `section-y` max (100) — the same pair as `padY`; the open card is square-inset on all four sides |
| `TITLE_PX(w)` | `Services` | the `text-service-title` clamp |
| `H2_PX(w)` | `Services` | the `text-h2` clamp |
| `BODY_SCALE` = 16/18 | `QuizPanel` | `text-body` ÷ `text-body-lg`, at their maxima |
| `QUIZ_GAP` = 48 | `QuizPanel` | `5xl` |
| `FROST_BLUR` = 20 | `QuizPanel` | `backdropBlur.panel` |

**If you change `text-service-title`, `text-h2`, `text-body`, `text-body-lg`, `5xl`,
`section-y` or `backdropBlur.panel`, come back here.**

---

## 8. Open questions

1. **24px Bold, 9 uses** — footer contact values (`hello@otix.studio`, phone,
   instagram) and pricing `$`/`+` symbols. 2px off `Stat/Value` (26px) with nothing
   to map to. Add a `Stat/Value Small` style, or fold into `stat-value`?
2. **Mixed-font runs, 2 layers** — `HELLO@OTIX.STUDIO` (nav) and the footer legal
   line each mix two fonts inside one text layer. Likely accidental; needs a manual
   look before binding to a style.
3. **Mobile type minimums** are proposed, not designed. Confirm in D5.
4. **`GLASS` approximation** — needs a visual check against Figma in D4.
