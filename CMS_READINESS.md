# CMS_READINESS.md — D7

What an editor may change, what they may not, and the Sanity schemas that follow.
Part of the spec pack: this doc is the **contract**. Where it and the code disagree,
this doc wins — fix the code or flag the conflict (CLAUDE.md).

> **This replaces the v1 file entirely.** The v1 version predates the whole v2
> component inventory. Everything below is derived from the **prop shapes frozen in
> D4** and verified against `components/` and `content/content.ts` on 12 Aug.
>
> **Sanity is not wired yet.** This is the design for it, not a description of it.

---

## 1. Principles

**1. The prop shape is the schema.** CLAUDE.md §2: prop shapes are the contract,
and Sanity schemas are derived from them — never the reverse. If a schema wants a
field the component does not take, the component is wrong or the field is layout.

**2. Content carries no layout.** No widths, no column counts, no ordering
mechanics, no colour choices. If an editor could break the composition by typing,
it is not content. This is why `variant`, `tone`, `align` and `featured` are
**structural** everywhere below, even though they are just strings.

**3. Editable does not mean unconstrained.** Anything with a fixed set of values
(`icon`, `tone`, `type`) is a Sanity **list**, not a free string — an editor
choosing "brand" from a dropdown cannot produce a missing icon.

**4. Decorative media is optional by definition.** CLAUDE.md §5 says decorative
imagery must never carry meaning, which means the schema must let it be **empty**
without the section breaking. Hero video and arch images are all optional.

**5. One field per idea.** A heading with an italic accent is stored as
**segments**, not as a string with markup, so the CMS can express the accent
without HTML and without an editor learning a syntax.

---

## 2. Per-component

**Editable** = a Sanity field. **Structural** = set in code at assembly (D8).
`className` is structural everywhere and is omitted from every row.

### Shared

| Component | Editable | Structural | Notes |
|---|---|---|---|
| `Logo` | — | `variant`, `href` | Wordmark is a lockup, not content |
| `Eyebrow` | `label` | `variant` | |
| `Cta` | `label`, `href` | `tone`, `fullWidth`, `disabled`, `loading` | Tone is surface-dependent — an editor cannot know the background |
| `Tag` | `label` | `variant` | |
| `SectionHeader` | `eyebrow`, `heading[]`, `body` | `align`, `tone`, `as`, `action` | `as` controls the **document outline** — never editable, there is one `h1` per page |

### Cards

| Component | Editable | Structural | Notes |
|---|---|---|---|
| `Card` | `image`, `alt`, `tag`, `title`, `description`, `stats[]` | `variant`, `href`* | *`href` is editable if it points at a real case study, structural while it is `#work` |
| `HeroArch` | `images[5]` | — | **Decorative.** Whole component is `aria-hidden`; may be empty |
| `RotatingWord` | `words[]` | — | ⚠️ **`words[0]` is the resting word** — server render, first paint and reduced motion all show it. Reordering the list silently changes the design's static state, so the field needs that spelled out for an editor. Fewer than two words disables the rotation rather than breaking |
| `LiquidImage` | — | `src`, `alt` | Internal to `HeroArch`; never addressed directly by the CMS |
| `StepCard` | `title`, `description`, icon **name** | `icon` node | See §3.4 — the prop is a `ReactNode`, which a CMS cannot supply |
| `TierCard` | `tier`, `name`, `description`, `price`, `features[]`, `cta`, `badge` | `featured` | See §3.2 — the biggest shape mismatch in the build |
| `TestimonialCard` | `quote`, `name`, `role`, `avatar` | — | ⚠️ **`quote` needs a ~110 character limit, enforced in the field.** The four-up arch gives every card a FIXED height, which is what makes it an arch rather than a ragged row — so an over-long quote does not grow its card, it overflows it. This is the one place in the system where a content field has a hard ceiling, and an editor cannot see why from the field alone: the help text has to say it. |

### Services

| Component | Editable | Structural | Notes |
|---|---|---|---|
| `ServiceCard` | `question`, `title`, `body[]`, `image` | `layout`, `distance` | **Both branches.** `body` is an **array of paragraphs**, not rich text — see §4.1. `layout` is desktop-vs-mobile arrangement and `distance` is the orbit's — neither is ever authored |
| ~~`ServicePanel`~~ | — | — | ⚠️ **SUPERSEDED 13 Aug.** The mobile section was rebuilt to match desktop and now renders `ServiceCard` in its `stacked` layout |
| `QuizPanel` | `eyebrow`, `heading[]`, `body`, `image`, `quiz` | `expand`, `padX`, `padY`, `headScale` | Panel 07. `heading` is a **segment array**, not markup (CLAUDE.md §2) — the italic accent is expressed as a flag on a segment, so the CMS never sees HTML |
| ~~`ServiceNumerals`~~ | — | — | ⚠️ **DELETED 13 Aug.** Was fully structural |

> ### ⚠️ `tags[]` → `question` — a SHAPE change, 13 Aug
>
> Each service card carried `tags: string[]` — category labels drawn from its own copy
> ("Web Apps", "AI"). It is now a single `question: string`: *"Still running it on
> spreadsheets?"* over *"Apps & Dashboards"*.
>
> **For the schema this is not a rename.** A repeating string field becomes a single
> one, and the field is singular *deliberately* so it cannot drift back into a list —
> two questions stacked would be two competing hooks. Sanity: a `string`, not an
> `array of string`.
>
> **Editorial guidance worth carrying into the CMS field description:** they are read as
> a set down one column, so the OPENING WORDS must vary. Six questions all starting
> "Launching…" land as a template rather than as six different problems. Current
> openers: Launching / Still / Ready / Not / Outgrown / Site.
>
> ⚠️ `question` and `image` are the only two strings in this section **written in build
> rather than exported from Figma**, which matters when the file is next reconciled.

> ### ⚠️ Also removed from the Services content, 13 Aug
>
> | Field | Was | Why it went |
> |---|---|---|
> | `services.panelEyebrow` | `"Services"` | Labelled the mobile carousel strip, sitting 28px below a `SectionHeader` that already carries the same eyebrow — two eyebrows for one section. It predated the header being added to that branch. |
> | `services.panels[].icon` | an `IconName` per service | Neither branch renders a per-service glyph now: desktop dropped its icon column when the cards gained images, and mobile followed when it moved to the same card. `SERVICE_ICONS` still exists in `Icon.tsx`; only the binding is gone. |
>
> **Both are deletions from the schema, not renames.** An editor should not be asked to
> pick an icon that nothing draws.

### Form and interactive

| Component | Editable | Structural | Notes |
|---|---|---|---|
| `Nav` | `links[]`, `cta` | `hideAfter` | |
| `Quiz` | `questions`, `scope`, `reveal`, `back`, `progressLabel`, `images[]` | `order`, `tiers` | ⚠️ **`escape` is kept but UNRENDERED since 13 Aug** — the "Or just email us" link was removed from all six screens. Left in the shape because it is a brief-level reversal that may come back; do not build a CMS field for it yet, and delete it outright if it is still unused at launch. ⚠️ **`back` now has no visible label** — it is the accessible name of a corner icon, so it must stay a real authored string. |
| `Input` | `label`, `placeholder`, `options[]` | `type`, `name`, `required`, `error`, `showLabel` | `name` is the form contract; `error` is runtime |
| `ContactRow` | `label`, `value`, `href`, `icon` | — | `icon` is a 3-value list |
| `SegmentedToggle` | `options[]`, `label` | `value`, `onChange` | State, not content |
| `StatItem` | `value`, `label` | `tone` | |
| `FeatureItem` | `label`, `included` | — | |
| `BackgroundVideo` | `poster`, `mp4`, `webm` | `pingPong` | **Decorative**; may be empty → poster alone, or nothing |

---

## 3. Shape mismatches — ✅ ALL FIXED (D8 content pass, 12 Aug)

`content.ts` was written for v1 and did not match the v2 prop shapes. Every item
below has now been fixed in one pass; the copy was not touched. Kept in full
because it is the record of *why* the file is shaped the way it is — and because
the Sanity schemas in §6 are derived from the fixed shapes, not the old ones.

**Two further mismatches were found during the rewrite** that D7 had missed —
`services` (§3.3) was bigger than recorded, and `process` had six steps against
four in the design (§3.8).

### 3.1 `SectionHeader.heading` — two different shapes ⚠️
The component takes `HeadingSegment[]` = `{ text: string; accent?: boolean }[]`.

`content.ts` uses **three** different shapes today:
- `["Everything you need to ", { highlight: "win online" }]` — mixed strings and `{highlight}`
- `{ pre, highlight, post }` (hero headline)
- plain `string` (about, whyOtix, pricing, footer)

**Fix:** normalise all of them to `HeadingSegment[]`. A plain heading is a
single-element array. One shape means one Sanity object type and one renderer.

### 3.2 `TierCard` ⚠️ **largest mismatch**
| Prop | `content.ts` today |
|---|---|
| `tier` | `eyebrow` |
| `name` | `title` |
| `description` | `subtitle` |
| `features: Array<string \| {label, included}>` | `features: string[]` **plus a separate** `excluded: string[]` |
| `featured` | `popular` |
| `badge` | *(missing)* |

The features split is the one that matters: the component takes **one ordered
list** where exclusions are marked inline, but the content holds **two lists**.
Merging them at render loses the designed ordering — Figma interleaves excluded
rows, it does not append them. **Fix in content, not in the component.**

### 3.3 `services` — two arrays become one ✅ FIXED
Larger than first recorded. v1 split the six services across **`rows`** (3
full-width divider rows) and **`features`** (3 cards) — two different layouts. v2
makes them six panels of one kind, so they are now a single `panels[]` in Figma
order 01→06, with `image` replaced by `icon` and the three former `features`
single-string bodies promoted to arrays. Copy untouched.

*(An earlier draft of this section claimed a "Brand & Identity" → "Brand Identity"
copy discrepancy. That was wrong — content already read "Brand Identity". Verified
before the rewrite.)*

### 3.4 `StepCard.icon` is a `ReactNode`
A CMS cannot supply a React node. The schema stores an **icon name** (list of the
10 `IconName` values) and D8 maps name → `<Icon>` at render. The same applies to
`ServicePanel.icon`, which already takes a name and is correct.

### 3.5 `Card` — `body` vs `description`
`content.work.featured` and friends use `body`; the component takes `description`.
Rename in content.

### 3.9 `hero.cta` is dead — **the v2 hero has no CTA** ⚠️ OPEN
Found while building the section. `HERO Text Container` (36:56) has exactly two
children — the copy block and the arch. There is **no button anywhere in the v2
hero**, but `content.hero.cta` (`"Start Project"` → `#about`) is still there.

It is left in `content.ts` rather than moved to `cutFromV2`, because this reads
like an omission rather than a decision: the hero is the one place on the page
with no way to act on what it just said. **Jimmy to confirm** — if it is
deliberate, delete the field; if not, it needs a frame.

### 3.11 `quote1` was not cut — it was PROMOTED ✅ FIXED
The v2 `WhyOtix` frame is headed with **"Most visitors decide in 3 seconds. / We
make sure those 3 seconds count."** — v1's standalone `quote1` copy. v1's own
heading for that section ("Your website should work while you sleep.") is not in
the v2 design at all.

So the two Quote sections were not simply deleted: one of them moved into this
heading. `quote2` is still parked in `cutFromV2`. §3.7's "Quotes ×2 are cut" was
half right, and the half that was wrong would have lost live copy.

### 3.10 `services` has no section header in v2 ⚠️ OPEN
Found while assembling the section. The `SERVICES` frame (36:214) contains only the
numeral column and one panel — **no eyebrow, heading or body above the reel**; each
panel carries its own eyebrow instead. So `services.eyebrow`, `services.heading`
and `services.body` are unused.

Left in `content.ts` rather than cut, because a section that arrives with no
introduction at all is a plausible design decision *and* a plausible omission —
every other section on the page has one. **Jimmy to confirm.**

### 3.6 `hero.projects` is over-specified
It carries `image`, `tag`, `title`, `body`, `href` per item, but v2's `HeroArch`
takes **only `images[]`** and is `aria-hidden`. Either reduce it to an image list,
or keep the richer data if those cards are ever meant to become links — but today
it is describing a component that no longer exists.

### 3.7 Cut sections still in content ✅ FIXED
`quote1`, `quote2` and `faqs` were still in `content.ts` for sections v2 cut. Moved
to an exported **`cutFromV2`** object at the bottom of the file — out of `content`
so no schema can pick them up, but not deleted, so no copy is lost.

**And the one that mattered:** `nav.links` still carried an **FAQs link**, pointing
at `#faqs` — a section that does not exist in v2. It would have scrolled to
nothing. Removed.

### 3.8 `process.steps` — six steps against four in the design ✅ FIXED
Found during the rewrite, not in the D7 audit. Content had Discovery / Strategy /
Design / Build / Launch / Grow; the v2 Figma section has **four** steps, and
`PROCESS_ICONS` — matched 1:1 against those frames in D4 — is exactly
`discovery, design, build, launch`. **Strategy** and **Grow** are therefore the two
that go; their copy is preserved verbatim in `cutFromV2`.

`number` was also dropped: `StepCard` does not take one, and the numbering is a
section-level ornament, not something an editor should type and keep in sequence.

---

## 4. Field-type decisions

### 4.1 Body copy is `string[]`, not rich text
`ServicePanel.body` and the card descriptions are **arrays of plain paragraphs**.
No portable text, no bold/italic/links inside body copy.

This is deliberate. Rich text would let an editor introduce type that the token
system does not describe — a heading inside a paragraph, an inline colour, a link
with no styling contract. Paragraph arrays keep every string bound to exactly one
type token. If a real need for inline emphasis appears, it should arrive as a
**segment array** like headings do (§1.5), not as HTML.

### 4.2 Prices are bare strings
`TierCard.price` is `"2,500"`. The `$` and `+` are rendered by the component with
their own `Stat/Symbol` token. An editor typing `$2,500` would double the symbol.
**Validate on the field:** digits, commas and periods only.

### 4.3 Images are paths today, assets later
Everything is a `/media/...` string. Sanity image assets bring their own dimensions
and hotspot; the D9 `next/image` migration is where those meet. Until then, any
image field is a plain string and the components are unaffected either way —
they all take a `src` string.

---

## 5. Never editable

Recorded explicitly so it does not need re-arguing:

| | Why |
|---|---|
| `variant`, `tone`, `align`, `featured` | Layout and surface decisions. An editor cannot see which background a component will sit on. |
| `as` (`h1`/`h2`) | Document outline. One `h1` per page (CLAUDE.md §5). |
| `ServiceNumerals` numerals + the `07` ghost | Derived from the panel count. Renumbering must never be manual. |
| `Icon` paths | Real vector data. The CMS picks a **name** from a list. |
| Any spacing, colour, radius or duration | Tokens (CLAUDE.md §1). Not content, at any level. |
| `Input.name` | The form submission contract. Renaming it breaks the handler silently. |

---

## 6. Proposed Sanity structure

One **singleton** `homePage` document, because there is one page and its sections
are ordered by design, not by an editor. Sections as named objects rather than a
free-form page builder — a builder would let an editor reorder sections whose
motion and surface colours assume their neighbours.

```
homePage (singleton)
├── nav            → { links[], cta }
├── hero           → { eyebrow, heading[], subhead, cta, media?, archImages[]? }
├── about          → { eyebrow, heading[], body, pills[], image? }
├── banner1        → cardBanner
├── services       → { eyebrow, heading[], body, panels[] → servicePanel }
├── work           → { eyebrow, heading[], body, cta, featured, tall, grid[] }
├── whyOtix        → { eyebrow, heading[], body, cta }
├── process        → { eyebrow, heading[], steps[] → { iconName, title, body } }
├── testimonials   → { eyebrow, heading[], items[] }
├── banner2        → cardBanner
├── pricing        → { eyebrow, heading[], body, tabs[] → { value, label, tiers[] } }
└── footer         → { eyebrow, heading[], body, contacts[], projectTypes[], budgets[], legalLeft, legalRight }

shared object types
├── headingSegment { text, accent: boolean }
├── ctaLink        { label, href }
├── cardBanner     { image, alt, tag, title, description }
├── servicePanel   { eyebrow, title, body[], iconName }
├── tier           { tier, name, description, price, features[], cta, badge }
└── feature        { label, included: boolean }
```

`headingSegment` is the load-bearing one — every section heading uses it, which is
why §3.1 has to be fixed before schemas are written.

---

## 7. Open questions

1. **Does Otix actually want to edit all of this?** A single-page marketing site
   with one editor may be better served by `content.ts` in git. Sanity earns its
   keep at case studies / a blog. Worth deciding before schemas are built.
2. **Are Work cards going to become real case studies** with their own pages? That
   changes `work` from an object into a document collection, and makes `href`
   editable (§2).
3. **Pricing tabs** — is the tab set (`Websites` / `Apps & Dashboards`) fixed, or
   should an editor add one? Editable tabs mean the toggle must handle 2–n options.
4. Confirm §3.7: delete `quote1`, `quote2`, `faqs` from `content.ts`, or keep them
   parked?

---

## 8. Verification (D9)

- Every component renders from `content.ts` alone, with no string literals left in
  `components/` (CLAUDE.md §2).
- Every optional/decorative field can be emptied without the section breaking.
- Homepage copy matches the v2 Figma frames verbatim, including the two known
  discrepancies in §3.3.
