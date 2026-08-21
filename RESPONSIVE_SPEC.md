# RESPONSIVE_SPEC.md — D5

Per-section reflow decisions for the v2 build. Part of the spec pack: this doc is
the **contract**. Where it and the code disagree, this doc wins — fix the code or
flag the conflict (CLAUDE.md).

> ## ✅ APPROVED — 12 Aug
>
> **Every v2 frame in Figma is 1440. There is no mobile design**, so unlike
> `DESIGN_TOKENS.md` — which is an *export* — this document began as proposal.
> **Jimmy approved it on 12 Aug, so the PROPOSED rows are now contract** and D8
> builds against them.
>
> They keep their PROPOSED label deliberately: it records that the row came from
> reasoning rather than a drawing, which is what you want to know if one of them
> turns out to look wrong on a real device.
>
> Rows marked **BUILT** describe behaviour that already exists in `components/`,
> verified against the code on 12 Aug.
> Rows marked **NEEDS DESIGN** are approved as *intent*, but still want real
> frames before D8 finalises them — §5.1 Hero and §5.10 Pricing especially.

---

## 1. Principles

**1. The type layer is already responsive; breakpoints are for REFLOW only.**
Every size token is a `clamp()` over 375→1440 (`DESIGN_TOKENS.md` §2–3), so text
and spacing scale continuously with no breakpoint involved. A breakpoint should
therefore only ever appear where the *arrangement* changes: a column collapsing, an
element being dropped, an interaction being swapped. If a rule below is really
"make it smaller", it is a token problem, not a breakpoint — fix the clamp.

**2. Still full width at every size.** CLAUDE.md §0 does not relax on mobile. No
container, no `max-w-*` page wrapper, no centred ceiling at any breakpoint. The
only width cap remains `max-w-measure` on long-form copy.

**3. Mobile-first, so unprefixed = smallest.** Base classes describe the phone;
`sm:`/`md:`/`lg:`/`xl:` add to it. A section that reads correctly with every
breakpoint prefix stripped is correct by construction.

**4. Hover is not available, so it may not carry meaning.** Anything revealed only
on hover must have a non-hover resting state that is complete on its own. This is
why `Card` stays in its rest state below `lg` rather than inverting.

**5. Reducing is preferred to rescaling.** Where a composition cannot survive being
squeezed, drop elements rather than shrink everything — five hero cards at 55px
wide are noise; three at 120px are a composition. Decorative repeats are the first
thing to go.

---

## 2. Breakpoints

Tailwind defaults, unmodified — **no `screens` override in `tailwind.config.ts`**.
Four are in scope. `2xl` (1536) is deliberately unused: the layout is fluid above
`xl`, so there is nothing for it to do.

| | min-width | Stands for | Carries |
|---|---|---|---|
| *(base)* | 0 | Phone portrait | The whole layout, single column |
| `sm` | 640px | Large phone / phone landscape | Media and 2-up grids. **Already live:** `BackgroundVideo` mounts here, and the **gutter steps 5px → 10px** on the same boundary. |
| `md` | 768px | Tablet portrait | First real multi-column work. **Already live:** `HeroArch` goes to five cards. |
| `lg` | 1024px | Tablet landscape / laptop | The desktop composition, and where **hover interactions switch on**. |
| `xl` | 1280px | Desktop | Reserved. Only for compositions that genuinely need a fourth step — currently just the Work grid. |

> **⚠️ Honest note on `sm` and `xl`.** As built, the components use only `md` and
> `lg` (plus one 640px media query). `sm` and `xl` are declared here because Jimmy
> asked for the full set, and the per-section table below assigns them real work —
> but if a section's row leaves them empty, that is correct and not an oversight.
> An unused breakpoint costs nothing; an invented one costs a state to verify in D9.

### The gutter step

The one breakpoint that is **not** a Tailwind class. `--space-gutter` is `10px`,
dropping to `5px` below the **`sm` boundary** in `globals.css`, so only phones get
the tighter frame. It lives in a CSS custom property precisely so nothing else has
to branch on it; everything consumes the `gutter` token and stays width-agnostic.

> **Fixed in D5:** the query was `max-width: 640px`, which overlaps Tailwind's
> `sm` (`min-width: 640px`) — at exactly 640 both applied, so the gutter dropped to
> 5px on a viewport the rest of the layout already treated as `sm`. Now
> `max-width: 639.98px`. One pixel wide, but it is the kind of thing that produces
> a screenshot diff nobody can explain later.

---

## 3. Global frame rules

Viewport widths, not breakpoint names, because these are `clamp()` values that are
continuous — the columns are samples of a ramp, not steps.

| Rule | 375 | 640 | 768 | 1024 | 1280 | 1440 |
|---|---|---|---|---|---|---|
| Page gutter | 5 | **10** | 10 | 10 | 10 | 10 |
| `section-x` (containered) | 20 | 28 | 31 | 38 | 46 | 50 |
| `section-y` (containered) | 56 | 67 | 72 | 83 | 93 | 100 |
| `section-x-flush` (Hero) | 20 | 30 | 35 | 44 | 54 | 60 |
| `section-y-flush` (Hero) | 64 | 78 | 85 | 98 | 112 | 120 |
| **Optical line** (gutter + x) | **25** | **38** | **41** | **48** | **56** | **60** |

The 60px optical line (CLAUDE.md §0.1) is a *desktop* alignment, and the table
above is the point: it compresses smoothly, and the containered and flush variants
stay in agreement at every width because `10 + section-x` and `0 + section-x-flush`
are fluid over the same 375→1440 range. The one place they diverge is below 640,
where the gutter drops to 5 but `section-x` is already pinned at its 20px minimum —
so the containered line is 25 and the flush line is 20. **A 5px discrepancy on a
phone, and deliberate:** closing it would mean either a wider gutter on the
smallest screens or a special-case token, and both cost more than they fix.

**Tap targets.** `min-h-tap` (44px) applies at every breakpoint, not just mobile —
a laptop trackpad is not a precision device either.

**Measure.** `max-w-measure` (68ch) is a *maximum*; it never applies below about
`md` because the column is already narrower than the measure. Nothing to do per
breakpoint.

---

## 4. What is already built

Verified against `components/` on 12 Aug. These are **BUILT**, not proposals.

| Component | Behaviour | Breakpoint |
|---|---|---|
| `Nav` | Links + CTA hidden, burger shown; full-screen menu; body scroll locked while open | `lg` |
| `Card` | **Stays in rest state** below `lg` — no image growth, no colour inversion, no copy travel. All rollover classes are `lg:group-hover:*`. | `lg` |
| `SectionHeader` | `split` align becomes a 2-col grid | `lg` |
| `HeroArch` | Middle **3** cards at a wider spread below `md`; all 5 above | `md` |
| `StatItem` | `tone="auto"` inverts only with the card's rollover | `lg` |
| `BackgroundVideo` | Video not mounted at all below 640px — poster only | 640px MQ |
| `ServiceNumerals` | Fully fluid (`em` of `text-numeral`) — **no breakpoint needed** | — |
| `LiquidImage` | Falls back to the plain image on coarse pointers | pointer MQ |

Two of those are **capability** switches, not width switches — `LiquidImage` keys
off `pointer: coarse` and `Card` off hover availability. That is deliberate: a
1024px touch screen should get the touch behaviour, and width is a poor proxy for
input type. Where the two disagree, capability wins.

---

## 5. Per-section reflow

11 sections. Component-level behaviour from §4 is not repeated.

### 5.1 Hero — **flush**
| | |
|---|---|
| Desktop | Nav · h1 with italic accent · subhead · CTA · `HeroArch` · `BackgroundVideo` behind |
| `lg`→`md` | **PROPOSED** — unchanged apart from `HeroArch`. Headline and subhead are already fluid. |
| `md`→base | **BUILT** `HeroArch` drops to 3 cards. **PROPOSED** subhead `max-w-measure` becomes full width; CTA goes full-width-hugging rather than inline. |
| base | **BUILT** poster image instead of video below 640px. |
| ⚠️ | **NEEDS DESIGN.** The hero is the one section where a scaled-down desktop composition is most likely to fail — the arch under a 3-line headline may leave no room for the CTA above the fold. Worth real frames. |

### 5.2 About — containered
| | |
|---|---|
| Desktop | Eyebrow/heading/body · pills row · image · `StatChart` *(deferred)* |
| `lg`→`md` | **PROPOSED** copy and image stack; image goes full width, keeps its aspect ratio. |
| `md`→base | **PROPOSED** pills wrap to multiple rows (they already do — `flex-wrap`). No horizontal scroll: a wrapped pill list is scannable, a scrolling one hides items. |
| ⚠️ | `StatChart` is deferred (COMPONENTS.md §5), so its reflow is out of scope until it exists. |

### 5.3 Banner 1 — containered, `Card variant="banner"`
| | |
|---|---|
| Desktop | Full-bleed image, copy over it, scrim rising from the bottom |
| `lg`→base | **PROPOSED** unchanged in structure — it is a single copy block over an image at every size. Copy block goes full width; the scrim stays. |
| ⚠️ | The banner is the one Card variant whose copy sits **on** the image at rest, so it is the one place the `lg` hover cutoff does not create a mobile problem. Check contrast holds at the narrowest width, where the copy covers more of the image. |

### 5.4 Services — **flush**, pinned scroll
| | |
|---|---|
| Desktop | Section title fixed top-left (`w-1/3`) · six `ServiceCard`s on an **orbit** around the Otix-mark wheel · panel 07 expands to full screen. All on one scroll progress. ⚠️ **Rewritten 13 Aug** — was `ServiceNumerals` left / `ServicePanel` right. |
| **Breakpoint** | ⚠️ **`1024px`, raised from 768 on 13 Aug.** The orbit is a desktop composition — a title fixed in the left third, six cards swinging through the right two-thirds on a 0.45-of-viewport radius. Below 1024 those stop being two regions: the arc runs under the title and the copy collides with the cards. |
| `lg`→`md` | ✅ **TABLET GETS THE PHONE DESIGN** (Jimmy: "this needs to be the same for tablet as well"). Not a compromise — the same header, strip, wheel and Find Your Fit section, drawn wider. |
| `md`→base | **PROPOSED** **drop the pin entirely.** Stack the six panels vertically as normal scrolling content, numeral inline above each title at a reduced size. |
| Why | A pinned section hijacks scroll for six viewport-heights. On a phone — where scroll is the only navigation and momentum is expected — that is the single most hostile pattern in the doc. The numerals are an ornament; the copy is the content. |
| ⚠️ | **NEEDS DESIGN** if Jimmy wants the reel kept on mobile. My recommendation is not to. |

> ### ✅ ONE DESIGN, TWO ARRANGEMENTS — resolved 13 Aug (Jimmy)
>
> The two branches were briefly on different GROUNDS: desktop on the page cream, mobile
> still painting `gradient-services`. **"For mobile the design needs to match desktop —
> we are getting rid of the green."** AUDIT §6 closed.
>
> **What mobile is now:**
>
> | | |
> |---|---|
> | Ground | the page cream. No panel, no gutter inset — **flush**, exactly as desktop is |
> | Header | `align="left"`, `tone="light"`, `ink` CTA — the same three the pinned branch passes |
> | Cards | `ServiceCard` in its **`stacked`** layout: image on top at 4:3, copy underneath. `ServicePanel` is superseded and deletable |
> | Wheel | the same Otix mark, behind the strip, cropped off the right edge. It does **not** rotate — see below |
> | Find Your Fit | **its own `<section id="find-your-fit">` below Services**, not a card inside it. Panel padding is `px-section-x py-section-y` — `Work`'s container tokens — inside `px-gutter`, so it lands on the same optical line as `Work`: 25 from the screen edge at 375, 60 at 1440 |
>
> 🔴 ⚠️ **THE WHEEL NEEDS ITS OWN CLIP LAYER, AND WITHOUT IT THE WHOLE PAGE SCROLLED
> SIDEWAYS.** `-right-1/4` pushes the mark a quarter of the strip's width past the right
> edge; the strip is full-viewport-width and nothing was clipping it, so the DOCUMENT
> became ~25% wider than the screen. An `absolute` element in an unclipped parent will
> do this — it is the second time this build has shipped a horizontal scrollbar that
> way, after `bg-glow-form` in `Footer`.
>
> ⚠️ **The clip cannot go on the strip wrapper.** That wrapper's box is the scroller's
> MARGIN box, and the scroller sits `-my-6xl` outside it precisely so its `py-6xl` can
> show the card shadows — clipping there slices the shadows straight back off. The wheel
> gets its own `absolute inset-0 overflow-hidden` layer instead, sized to exactly the
> strip. The crop is wanted anyway: the mark is cropped by the right edge on desktop
> too, and that is what stops it reading as a logo.
>
> ⚠️ **The wheel does not turn on mobile, and that is not an omission.** Desktop drives
> its rotation from `progress`, a scroll value; the phone strip is SWIPED, and swipe
> position is not scroll position. Turning it here would mean inventing a second driver
> for one decorative element — the exact thing this section has been burned by. It is a
> still mark that crops the same way.
>
> ⚠️ **`distance` is left at 0 for every card**, so none are blurred or scaled. The strip
> has no depth: which card you are reading is decided by the scroller, not by a value we
> compute, and blurring a card the browser considers fully visible is worse than a flat
> strip.
>
> ⚠️ **The image aspect changes with the layout — square → 4:3.** Square works BESIDE
> copy because it matches the copy block's height; square ON TOP of copy, in a card
> three-quarters of a phone wide, takes most of the screen before a word is read.
>
> ⚠️ **`bg-fade-right` was always mixed from `neutral-100`** and was therefore always
> wrong over the gradient. It is now sitting on the colour it was built for — a quiet
> confirmation that this branch had drifted rather than been designed.
>
> #### Spacing, settled 13 Aug
>
> | | |
> |---|---|
> | Above the title | `section-y-flush` **and nothing else**. It was `mt-block` + `section-y-flush` — two rhythms stacked, ~117px where every other flush section has ~67. One source of vertical rhythm per section. |
> | Left/right | `section-x-flush`, carried by each child rather than by the section, because the carousel must NOT have it — it pads its own scroller so the first card lands on the optical line and the rest run off the right edge. |
> | CTA → carousel | `pb-2xl` on the header **on top of** the column's `gap-2xl`, so 56 against 28 elsewhere. Same asymmetry as the dots' `pt-md`: the header ends in a BUTTON, and a button 28px above a swipeable card reads as a control belonging to that card rather than to the section. |
> | Right-edge fade | `w-1/4`, up from `w-1/6`, paired with a re-stopped `bg-fade-right` — see DESIGN_TOKENS. The width and the curve are one decision, and a quarter is exactly the sliver of the next card that `basis-3/4` leaves showing. |
> | Between cards | `gap-xl` (24), down from `gap-4xl` (40). The 40 was paired with `basis-3/4` to stop the next card's sliver reading as a second column; that was decided when the cards were glass with no hard edge. Opaque cards with their own radius and shadow separate themselves. |
> | Card heights | **equal** — `items-stretch` on the scroller + `h-full` on the card. Neither half does anything alone. Reversed from hugging: on a swipe strip you see one card at a time against a fixed frame, so a ragged bottom edge reads as the layout shifting under you. |
>
> 🔴 ⚠️ **NO FIXED HEIGHT ON THE FIND YOUR FIT PANEL, AND NO BOTTOM PADDING ON ITS
> SECTION.** It sat in an `h-quiz` block (a fixed clamp of 560 → 650) left over from
> when it was a block inside Services. Once the panel took `Work`'s container padding
> its content outgrew that box: the div still reserved 650, the panel painted past it,
> and **Process was laid out under the overflow**. It looked like Process was too high;
> it was the quiz's height that had stopped being declared honestly. The section takes
> the panel's natural height now.
>
> The bottom padding went at the same time and for the standing reason: **a section ends
> where it ends, and the NEXT section's padding is the gap.** Process is flush and
> carries `py-section-y-flush`; adding `pb-section-y-flush` here doubled it to ~134 on a
> phone — the same duplicated-rhythm bug the section header had.
>
> ⚠️ **`py-6xl -my-6xl` on the scroller is not spacing, it is room for the SHADOW.** An
> `overflow-x-auto` box clips vertically too, so `shadow-elevated`'s largest layer —
> `0 40px 40px -24px`, reaching **56px** below the card — was sliced flat along the
> bottom of the tallest one. The padding gives it 60px inside the scroller; the equal
> negative margin takes the same 60 back out of the layout. **They must stay equal and
> ≥ 56**; if `shadow-elevated` changes, re-derive as `offsetY + blur + spread`.
>
> **What "80px" turned out to be.** The site has no fixed 80px section rhythm — flush
> sections use `section-y-flush`, a clamp of **64px at 375 → 120px at 1440** (about 67
> on a phone, 91 on a tablet). The 80 is `block`, itself a clamp of 48 → 80, and it is
> the Work → Services gap on the DESKTOP branch only.

### 5.7a Process — mobile, rebuilt 13 Aug

| | |
|---|---|
| Layout | **Circle LEFT, copy RIGHT** below `lg` (`flex-row gap-xl`), column from `lg` (`flex-col gap-3xl`). Stacked, a 120px disc above two lines of copy costs most of a phone screen per step — four of those read as four screens. Beside the copy, a step is one glance. |
| Alignment | `items-start`, **not** `items-center`. The disc aligns with the TITLE's first line rather than the middle of a copy block whose length varies per step; centred, the four discs would sit at four different heights and the connectors between them would visibly kink. |
| Gap | 24 in the row against 32 in the column — **a horizontal gap and a vertical gap between the same two things are not the same measurement.** Sideways, 32 pushed the copy past a comfortable measure at 375. |
| Connectors | **Straight vertical rules, restored below `md`.** Same colour and 7px weight as the desktop curves so they read as one device. |

⚠️ **The mobile connectors are a `<div>`, not an `<svg>`.** A straight line needs no
path, and a border-box rule scales with no `preserveAspectRatio` maths and no
`non-scaling-stroke`. The desktop ones are SVG *only* because they curve.

⚠️ **`md:hidden` — single column only.** At `md` the grid is 2-up, and a rule that
continues across a grid wrap draws a line to the wrong neighbour. That is the mirror of
why the desktop connectors are dropped below `lg`, not a new rule.

⚠️ They match the CARDS' grid exactly — one box per gap, `steps.length - 1` of them — so
each connector's box IS one row plus one gap and the line simply spans it
(`height: calc(100% + 24px)`). The alternative was measuring card heights, which vary
per step.

⚠️ **`z-10` on the disc and `-z-10` on the connector layer are a pair.** The line runs
*to* each circle's centre and must be painted over by the disc; the layer sits behind the
cards or the rule crosses the copy of any card whose text runs long.

⚠️ `CONNECTOR_W` (7) is **mirrored** from the desktop `strokeWidth="7"` — one is an SVG
attribute, the other a CSS width, so there is no single place to put it. Change both; a
mismatch is immediately visible at the breakpoint.

### 5.5 Work — containered
| | |
|---|---|
| Desktop | `featured` card + `tall` card + a 3-card `grid` |
| `xl` | **PROPOSED** the only section that earns `xl`: 3-up grid. |
| `lg` | **PROPOSED** 2-up grid; featured stays full width. |
| `md` | **PROPOSED** featured card loses its side-by-side split — image on top, copy below (it is `flex-row` at `w-1/2` on desktop). |
| base | **PROPOSED** everything 1-up. Stats inside the featured card wrap. |
| ⚠️ | The featured card's `flex-row` + `w-1/2 → w-full` image growth is a **desktop-only mechanic**. Below `lg` the card is already in rest state, so the row must become a column or the copy column ends up ~150px wide. |

### 5.6 Why Otix — containered
| | |
|---|---|
| Desktop | Copy + CTA, with the two Work cards (`tall`, `featured`) reused alongside |
| `lg`→`md` | **PROPOSED** copy above, cards below, 2-up. |
| `md`→base | **PROPOSED** cards 1-up under the copy. |
| ⚠️ | Figma frame `36:241` is **misnamed "WORK"** but is this section (CLAUDE.md §3). Do not conflate it with 5.5 when measuring. |

### 5.7 Process — containered
| | |
|---|---|
| Desktop | 4 `StepCard`s in a row, joined by connecting rules |
| `lg`→`md` | **PROPOSED** 2×2 grid. **The connecting rules must be dropped**, not wrapped — a rule that continues across a grid wrap draws a line to the wrong neighbour. |
| `md`→base | **PROPOSED** 1-up, vertical. Rules could return here as *vertical* connectors, which is the same idea rotated and reads correctly in a single column. |
| ⚠️ | The rules belong to the section, not the card (COMPONENTS.md `StepCard`), so this is a D8 section decision and no component change is needed. |

### 5.8 Testimonials — containered
| | |
|---|---|
| Desktop | Row of `TestimonialCard`s, quote-mark glyph, 4 cards |
| `lg`→`md` | **PROPOSED** 2-up grid. |
| `md`→base | **PROPOSED** 1-up stack. |
| ⚠️ | The v1 scrolling strip is **gone** — `Carousel` is cut from v2 (COMPONENTS.md). If a phone should scroll these horizontally rather than stack them, that needs deciding before D8, and the cut component is recoverable from `_archive-v1-teal/_snapshots/Carousel.v2.tsx`. |

### 5.9 Banner 2 — containered
Identical to 5.3.

### 5.10 Pricing — containered
| | |
|---|---|
| Desktop | `SegmentedToggle` · 3 `TierCard`s · `FeatureItem` rows, 26 included / 4 excluded |
| `lg`→`md` | **PROPOSED** tiers 2-up, "Bespoke" (the Most Popular tier) full width beneath — it is the one carrying the pill, so it should not be the odd card out. |
| `md`→base | **PROPOSED** 1-up, in price order. The Most Popular tier moves to **first**, not middle: on a phone nobody scrolls past two cards to find the one being recommended. |
| ⚠️ | **NEEDS DESIGN — highest risk in this document.** A 3-column comparison table is the hardest thing on this page to reflow. Stacking triples the vertical length and destroys the compare-across-columns reading the table exists for. `TierCard` currently has **no breakpoint classes at all**. |
| ⚠️ | The 4 **excluded** rows (minus glyph, 40% opacity) must stay legible when stacked — at 40% on the warm page they are near the AA floor already (CLAUDE.md §5). |

### 5.11 Footer / Contact — containered
| | |
|---|---|
| Desktop | Heading · `ContactRow` ×3 · contact form (`Input`, `SegmentedToggle`) · legal row |
| `lg`→`md` | **PROPOSED** form below the contact block rather than beside it. |
| `md`→base | **PROPOSED** `ContactRow` items stack; the 50px glass circle stays (it is the tap target). Legal row stacks, left item first. |
| ⚠️ | `ContactRow`'s elastic hover grow is decorative and needs no touch equivalent — but the whole row must be a ≥44px tap target, which `min-h-tap` does not currently guarantee on the value link. **Verify in D9.** |

---

## 6. Gaps in the built components

Work that D5 has identified but D4 did not do. None of it blocks D8 starting, but
all of it blocks D8 *finishing*.

| Component | Gap | Priority |
|---|---|---|
| `TierCard` | No breakpoint classes at all; pricing is the hardest reflow on the page | **High** |
| `Card` (`featured`) | `flex-row` never becomes a column — copy column collapses below `lg` | **High** |
| `ServicePanel` | `pr-6xl` inset and the heading/icon row are desktop proportions; untested narrow | Medium |
| `ContactRow` | Tap-target height on the value link | Medium |
| `Input` | Untested below `md`; `h-field` is fixed 50px, which is fine, but label/field stacking is unspecified | Low |
| `FeatureItem` | Excluded-row contrast at 40% opacity | Low (a11y) |

---

## 7. Open questions for Jimmy

1. **Services on mobile** — do you want the pinned reel kept, or the panels
   stacked as normal content? I recommend stacking (§5.4).
2. **Pricing on mobile** — stack the three tiers, or something else entirely
   (accordion per tier, a horizontal scroll)? This is the one I would most like a
   frame for (§5.10).
3. **Testimonials on mobile** — stack, or reinstate a horizontal strip? `Carousel`
   is cut but recoverable (§5.8).
4. **Hero on mobile** — the arch plus a 3-line headline plus the CTA may not fit
   above the fold. Frames would settle it (§5.1).
5. Confirm the **100px mobile minimum** on `text-numeral`, which D4 flagged as
   PROPOSED (`DESIGN_TOKENS.md`, D4 addendum).

---

## 8. Verification (D9)

Every **BUILT** row in §4 and every rule in §3 is testable and should get a
Playwright assertion at 375 / 640 / 768 / 1024 / 1280. The **PROPOSED** rows become
testable only once Jimmy has signed them off — until then they are intent, and
writing tests against intent just locks in a guess.


---

## §5.13 Services panel 07 / the quiz — ⚠️ ADDED 13 Aug

Supersedes §5.6 (WhyOtix), whose section no longer exists.

| | |
|---|---|
| **Desktop (`md`+, motion allowed)** | Panel 07 travels up from below the fold, lands **centred** and **expands** straight away over `VH_EXPAND` (50vh) to the viewport inset by the page gutter — no bottom inset, so it runs off the screen. The frost clears, the heading grows in place from the top-left, the quiz's slot opens. The pin then **releases**. ⚠️ `VH_HOLD` is **0**. A 40vh dwell was tried and removed: the fault it was added for — the expansion appearing to start early — was really the card not resting centred, and once that was fixed the hold was 40vh of scroll in which nothing happened, which reads as a stall. |
| **Below `md`, and any width under `prefers-reduced-motion`** | No pin, so no expansion. The 6 services stay a swipeable carousel and the panel renders **already open** (`expand={1}`) as a normal `h-quiz` block beneath it. |

⚠️ **Why not a 7th carousel card on mobile.** The quiz is tapped and the carousel
is swiped; an interactive card inside a horizontally-scrolling strip makes every
answer a gamble on which gesture the browser resolved. The card is also only 75%
of a phone wide.

⚠️ **Why the pin releases rather than holding.** The quiz needs unbounded dwell
time and the reel is scroll-driven. Holding the viewport while someone answers
five questions is the same pattern that got the pin dropped on mobile in the first
place — and it traps anyone who does not want the quiz.
