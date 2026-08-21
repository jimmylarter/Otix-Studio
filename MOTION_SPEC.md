# MOTION_SPEC.md — D6

Motion choreography for the v2 build. Part of the spec pack: this doc is the
**contract**. Where it and the code disagree, this doc wins — fix the code or flag
the conflict (CLAUDE.md).

> **This replaces the v1 motion spec entirely.** The v1 file described the
> teal-navy build: a custom cursor, hero carousel choreography and page
> transitions, none of which exist in v2. Nothing has been carried across
> unexamined — every entry below was verified against `components/` on 12 Aug.
>
> **✅ BUILT** = in the code now. **▶ D8** = section-level, lands with assembly.
> **⚠️ INVENTED** = not in the Figma or the brief; a deliberate addition.

---

## 1. The motion language

Four rules. Everything below is an application of them.

### 1.1 Motion is asymmetric

**The single most important rule, and the thing that makes the site feel
expensive.** Leaving and returning are not the same gesture:

| | Duration | Easing | Feel |
|---|---|---|---|
| **Acting** (hover on, expand, open) | `slow` 420ms | `cta-expand` | quicker, with overshoot — it springs to meet you |
| **Returning** (hover off, collapse) | `slower` 640ms | `out-back` | longer, with a firmer elastic settle |

Symmetric motion reads as a CSS transition. Asymmetric motion reads as a physical
object with weight. Every rollover in the system uses this exact pair, which is
why `Cta`, `Card` and `LiquidImage` feel like one family rather than three
separately-tuned effects.

The rest state carries the **return** timing and the `:hover` state overrides it
with the **act** timing — that is why the classes always look like
`transition-x duration-slower ease-out-back` + `lg:group-hover:duration-slow
lg:group-hover:ease-cta-expand`. Reversed, the overshoot would fire on the way out.

### 1.2 One gesture per element

An element moves for one reason. Where several things change at once — the Card's
image growing, its scrim rising and its text inverting — they are one gesture
because they share a trigger and a duration family, not three animations that
happen to overlap.

### 1.3 Interaction motion is desktop-only

Hover mechanics are `lg:`-prefixed throughout. A touch device has no hover, so
anything revealed by one must already be complete at rest (RESPONSIVE_SPEC.md §1.4).
Where input type matters more than width — `LiquidImage` — the check is
`pointer: coarse`, not a breakpoint. **Capability beats width.**

### 1.4 Almost nothing loops

Loops draw the eye permanently and cost battery, so they are exceptional. There are
exactly **two** ambient loops in the system, both in the Hero, both deliberate:

| Loop | Why it earns it |
|---|---|
| Background video | The hero's atmosphere. Poster-only under reduced motion. |
| `RotatingWord` (§4.4) | The headline's claim *is* the rotation — "harder / smarter / faster" says something a static word cannot. Static under reduced motion. |
| Process step float (§4.5) | Four circles drifting a quarter-cycle apart, so the row reads as one wave. Ambient, but confined to the circles. |

`link-pulse` is a keyframe loop but not an ambient one: it runs only while a nav
link is hovered.

> This rule read "nothing loops" until the rotating word was added on 12 Aug, then
> "exactly two" until the step float on the same day. Updated each time rather than
> quietly broken — a fourth has this table to argue with.

---

## 2. Token palette

### Durations

| Token | ms | Used for | Status |
|---|---|---|---|
| `snap` | 50 | — | **unused** |
| `instant` | 120 | — | **unused** |
| `fast` | 180 | Input focus ring | ✅ |
| `base` | 280 | Colour changes, fades, nav reveal | ✅ |
| `slow` | 420 | **The "act" duration** — every hover-on | ✅ |
| `expand` | 560 | — | **unused** |
| `slower` | 640 | **The "return" duration** — every rest state | ✅ |
| `slowest` | 900 | — | **unused** |
| `cinematic` | 1200 | Nav fill arriving | ✅ |

### Easings

| Token | Curve | Used for | Status |
|---|---|---|---|
| `standard` | `.4,0,.2,1` | Video fade-in | ✅ |
| `smooth` | `.33,1,.68,1` | Colour changes, scrims | ✅ |
| `out-expo` | `.16,1,.3,1` | Nav revealing | ✅ |
| `in-quart` | `.5,0,.75,0` | Nav hiding | ✅ |
| `cta-expand` | `.34,1.56,.64,1` | **The "act" curve** | ✅ |
| `out-back` | `.175,.885,.32,1.6` | **The "return" curve** | ✅ |
| `cta-retract` | `.22,1,.36,1` | — | **unused** |
| `in-out-quint` | `.83,0,.17,1` | — | **unused** |
| `soft-spring` | `.34,1.2,.64,1` | — | **unused** |

> **⚠️ Seven of eighteen motion tokens are unused.** That is not a gap to fill —
> it is the cost of exporting the full Figma ramp in D1. Do not invent uses for
> them. If a D8 section genuinely needs a fourth duration, one of these is probably
> already right; if none is, that is the moment to add a token, not before.

### Custom properties

`transitionProperty` extends Tailwind where a single named gesture spans several
CSS properties, so they can never drift apart:

| Token | Properties | Why |
|---|---|---|
| `size` | `height, width` | Card image genuinely animates its box, not a transform |
| `flex` | `flex-grow` | Featured card's copy travel (see §4.3) |
| `elastic` | `transform, color` | ContactRow scales **and** recolours as one gesture |

---

## 3. Built interactions

Verified against the code. Section-level choreography is §5.

### 3.1 `Cta` — the elastic rollover ✅ BUILT
The label slides right by exactly `base` (16px) and the badge follows, using the
§1.1 pair. **16px is not chosen, it is derived:** `(badge 36 + gap 16 + right pad 4)
÷ 2 − 4 = 16`, which is what makes the lockup stay optically centred at any width.
Arrow is always white, in all three tones. `animate-spin` on the loading state.

### 3.2 `Card` — image growth + inversion ✅ BUILT
Three simultaneous changes on one trigger: the image box grows (`transition-size`),
the scrim fades up (`duration-slow ease-smooth`), and the copy inverts to light
(`transition-colors`). Per variant:

| Variant | Image | Direction |
|---|---|---|
| narrow / equal | `h-media` → `h-media-full` | grows **down**, top anchored |
| featured | `w-1/2` → `w-full` | grows **right**, left anchored |
| banner | already full-bleed | scales in place (`scale-105`) |

The card needs a definite `h-card` for this — a content-sized card gives the image
nothing to interpolate towards. All of it is `lg:`-gated; below that the card sits
at rest.

### 3.3 `Nav` — fill, not geometry ✅ BUILT
**The bar's geometry never changes.** It is always the compact floating size —
`m-gutter px-xl py-md`, 16px corners. Only the gradient fill layer animates.

An earlier build morphed the bar (full-bleed 20px tall → inset 12px tall) and the
geometry change read as a wobble: the logo and CTA shifted while the page was still
moving. Holding the shape fixed and animating only the fill gives the same "it
became solid" read with none of the movement. **Do not reinstate the morph.**

| Event | Timing |
|---|---|
| Fill arriving (scroll > 24px) | `duration-cinematic` (1200ms) `ease-smooth` |
| Fill leaving | `duration-base` (280ms) — deliberately much quicker; a fill that lingers on the way out looks like it is lagging the scroll |
| Bar revealing (scroll up) | `duration-base` `ease-out-expo` — returning should feel immediate |
| Bar hiding (scroll down) | `duration-slower` `ease-in-quart` — leaving should not compete with the content |
| Link hover | `animate-link-pulse` + `text-green-300`, `duration-base` |

The bar does **not** hide until the hero has passed (`hideAfter`); over the hero it
is part of the composition. Scrolling back into the hero always restores it — that
branch must exist, or `hidden` gets stuck at its last value and the nav appears to
lag. Never hides while the mobile menu is open (CLAUDE.md §5).

⚠️ Figma puts a `BACKGROUND_BLUR(15)` on the nav. **Deliberately not built** — over
the hero video it muddied the footage, and behind a solid fill it does nothing.

### 3.4 `ContactRow` — elastic grow ✅ BUILT
The value link scales and recolours as one gesture (`transition-elastic`), §1.1
timings. The icon expands; the glass circle around it does not.

### 3.5 Smaller ✅ BUILT
`Input` focus ring `duration-fast`; `SegmentedToggle`, `StatItem`, `TierCard`,
`Logo` all colour/opacity only at `duration-base`/`slow` with `ease-smooth`.

---

## 4. Invented interactions

⚠️ **None of these are in the Figma or the brief.** They are deliberate additions,
agreed with Jimmy, recorded here so they are never mistaken for exports.

### 4.1 `LiquidImage` — WebGL ripple ⚠️ INVENTED · ✅ BUILT
The hero arch images ripple under the cursor. A radial wave emanates from the
pointer with exponential falloff; the pointer position is **eased toward the real
cursor**, so the water lags slightly — that lag is most of what sells it as liquid
rather than a filter. The same eased `strength` also drives a 6% in-shader zoom, so
the image expands *inside* its white border and the two cannot desync.

Hand-rolled WebGL, not three.js: the shader is ~30 lines, so 150KB of library for
one effect is not a trade worth making.

**Falls back to the plain image** under `prefers-reduced-motion`, on coarse
pointers, and without WebGL. The static image *is* the rest state, so nothing is
lost. See COMPONENTS.md for the context-lifecycle traps — they are correctness, not
motion, but they will bite anyone editing this.

### 4.2 ~~Services numeral reel~~ ⚠️ **REPLACED 13 Aug — see "Services — the orbit"**
The six Figma panels were rest states of one continuous vertical reel: numerals gliding
upward by a constant pitch, the active one full size, neighbours at `scale-75` / 45%.
The column became service glyphs, then was removed entirely when each card gained its
own image, and `ServiceNumerals` is deleted.

**The principle survives it and is now the orbit's:** motion here is
**progress-driven, not time-driven** — there is no duration, it is scrubbable in both
directions, and it is always exactly where the scroll is. Everything in the section
runs off one `progress` value, so nothing can fall out of step.

### 4.3 Featured card copy travel ⚠️ INVENTED · ✅ BUILT
On hover the featured card's copy travels from the top of its column down to sit
directly above the stats, so the block ends bottom-aligned and the corner scrim
covers it. The stats stay put; the copy comes to them.

Done by animating `flex-grow` on two spacers — one above that grows, one below that
collapses. Not `justify-content` (cannot animate) and not `grid-template-rows`
(can, but not everywhere). §1.1 timings.

> This was removed and reinstated on 12 Aug at Jimmy's request. It is wanted. The
> no-travel version is not preserved — reverting means deleting the two spacers and
> putting `mt-auto` on the stats.

---

### 4.4 `RotatingWord` — the Hero's typed accent ⚠️ INVENTED · ✅ BUILT
The headline's accent word deletes itself character by character and retypes as
the next one — **harder → smarter → faster**, looping — with an editing caret.

| | ms | Note |
|---|---|---|
| Type | 120 | per character. The `instant` token's value |
| Delete | 50 | per character. The `snap` token's value — **faster than typing**, because you hold backspace but type key by key |
| Hold | 1200 | completed word rests. `cinematic`'s value |
| Switch | 240 | beat between deleting and the next word |

These are JS timers, so they cannot literally consume the duration tokens — but
they are the same numbers on purpose, and they put three tokens that §2 flagged as
unused to work.

**The caret only blinks while the word rests.** A caret blinking *while* characters
appear is the tell that something is an animation rather than something being
typed. It uses `steps(1)` so it snaps rather than fades, and holds solid longer
than it holds hidden (45/55) — an even blink reads as a strobe at 80px.

**The box hugs the word, so the line reflows as it types.** "than you do." slides
in and out and the gap tracks the text. Two earlier versions pinned the box to the
width of the longest word so the sentence could not move — left-aligned, then
right-aligned to keep the caret still. Both were rejected (Jimmy, 12 Aug): a fixed
box leaves a visible hole whenever the word is short, and a headline that refuses
to move while its own word is retyped reads as two unrelated things rather than one
sentence being edited.

The cost is accepted, not overlooked: the line is centred, so every keystroke
shifts the words on **both** sides of the accent. If it ever needs undoing, the fix
is an `inline-grid` with an invisible sizer holding the longest word in the same
cell — not a `min-width`, which cannot know the font's metrics.

**Accessibility:** the animated span is `aria-hidden` with a static word exposed
instead, so the `h1`'s accessible name never changes. Under reduced motion it
renders `words[0]` with no caret and no timers.

### Process connectors — curved, 13 Aug

Not motion, but it lives with the float it sits under. The three connectors went from
**2px straight `border-divider`** to **7px curved `neutral-300`**.

The curve is a cubic whose control points sit at the horizontal midpoint on each end's
own y, giving **horizontal tangents at both circles** — it leaves one flat, bends once,
and arrives flat at the next.

⚠️ **The tangents are what keep the tuck working.** A straight line met each circle at
about 40°, so the last pixels before it disappeared were the visible ones. Leaving flat
slides the ends under the circle along its widest axis, which is also the axis the float
drifts along — so the connector stays hidden through the whole 7000ms cycle.

⚠️ **Weight and colour moved together and cannot be separated.** `neutral-300` is
**1.22:1** on the page against the old hairline's 1.37:1 — *fainter per pixel*. It only
reads because it is now 7px. Dropping the weight back at this colour would make the
connectors all but disappear.

⚠️ **7 is near the practical ceiling.** The connector is tucked under a 120px circle, and
the thicker it gets the more of it shows past the circle's edge where it approaches on
the diagonal. The horizontal tangents are what buy that headroom, and it is already
mostly spent.

---

### 4.5a Hero arch float ⚠️ **ADDED 13 Aug** · ✅ BUILT

**The same `step-float` the Process circles use — one animation, two placements.** Each
arch card drifts on a 7000ms `ease-in-out` loop, with a negative `animationDelay` spread
across the cycle by index so the row reads as a **wave** rather than five things bobbing
in unison. `FLOAT_MS` is declared in both components with a "must match" note; if they
disagree the wave stops being evenly spaced.

⚠️ **`phaseFrom` keeps the two runs in step.** Mobile renders the middle three cards, so
it starts at index 1 — otherwise the same picture would drift on a different beat at the
two sizes for no reason.

⚠️ **The float needed HEADROOM inside the clip.** The run is `overflow-hidden` so it can
be cropped by the viewport horizontally, and that clip cuts vertically too; cards 1 and 5
sit at `top: 0`, so the up-beat would have sliced their tops off. `FLOAT_HEADROOM` (16 ≥
the keyframes' −12) is padding on the clipper cancelled by an equal negative margin —
the clip box starts higher, the content does not move.

⚠️ **That forced `HeroArch` into two divs**, outer carrying the caller's margins and
inner doing the clipping. They cannot be one: `cn` is a plain join, so our `-mt` and the
caller's `-mt-sm` would both apply and CSS source order would decide — the same trap that
made the Quiz's back arrow render at the wrong size.

⚠️ **The transform is on a wrapper, never on the framed card.** That card is the element
`LiquidImage` measures for its ripple; moving it would shift the box the pointer maths
resolves against. Same reason the removed scroll dispersal put its translate on a wrapper.

---

### 4.5 Process step float ⚠️ INVENTED · ✅ BUILT
The four Process circles drift in place — a shallow arc, 12px vertical and 5px
horizontal, over 7s `ease-in-out`. Each starts a **quarter-cycle** further along
than the last (delays 0 / −1750 / −3500 / −5250ms), so the row reads as one wave
travelling through it rather than four things bobbing in unison.

The delays are **negative**, which is what makes them begin already spread out
instead of all rising together on load.

**Only the circle floats, never the copy.** Text that drifts while you are reading
it is the difference between "alive" and "broken".

⚠️ **The amplitudes are bounded by the connectors.** The section's hairlines are
static and tuck 22px under each circle (§ `sections/Process.tsx`); as long as the
drift stays well inside that, the lines never emerge from behind a moving circle.
Raising the amplitude past ~20px breaks the joins.

Horizontal drift is deliberately smaller than vertical — equal amounts read as a
circular orbit, which looks mechanical rather than buoyant.

Reduced motion is covered by the global backstop (§7.2), which kills keyframe
animations outright.

---

## 5. Scroll behaviour

### 5.1 Reveal ✅ BUILT (hook) · ▶ D8 (application)
`useRevealed` observes `[data-reveal]` descendants and fires each **once**, via
IntersectionObserver with `rootMargin: 0 0 -15% 0` — so a block reveals when it is
properly on screen, not as its first pixel clips the bottom edge. The `reveal`
keyframe (fade + 16px rise) is in `globals.css`.

Carried from v1 unchanged; it is design-agnostic. **Reduced motion: everything is
marked revealed immediately**, so content is never gated behind an animation that
will not run.

✅ **D8 APPLIED, 13 Aug — via a `Reveal` COMPONENT rather than the hook.** The Work
cards fade and rise as they enter. The hook is a CONTAINER API (`has(i)` for many
`[data-reveal]` descendants) which suits a component choreographing its own beats —
`StatChart` — but not cards sitting in a server-component tree with no client parent to
hold the ref. **Two mechanisms now exist and that is recorded, not accidental**; if a
third case appears, consolidate on the component.

| | |
|---|---|
| Blur | **`blur-reveal` (6px) → sharp**, added 13 Aug. What makes it read as *resolving into place* rather than sliding into place. Same language as the Services orbit, where blur already means "not the thing you are looking at yet". |
| Travel | 32px rise (`translate-y-3xl`) + fade. The keyframe's 16 is a paragraph value; on a 500px card it is imperceptible. ⚠️ **Distance and duration move together** — 40 belonged to the 1200ms version and reads as a lurch at 640. |
| Curve / duration | `ease-standard` over `measured` (560ms) |
| Stagger | **90ms × index, PER CARD, index RESTARTING each row** — 0 · 90, then 0 · 90 |
| Fires | once, `unobserve` on first hit, **`rootMargin: 0 0 -5% 0`** |
| Reduced motion | shown immediately, observer never attached |

⚠️ **The blur is a REAL filter, not a backdrop one** — it blurs the card's own type,
image and shadow, which is the point and also why 6px is the ceiling. Past about 8 the
copy stops reading as copy and it looks like a page failing to load.

⚠️ **All three properties share ONE transition** (`transitionProperty.reveal` is
`opacity, transform, filter`). Giving the blur its own duration is how a card ends up
sharp before it has stopped moving — two effects instead of one arrival.

⚠️ **`filter` is the expensive part and there is deliberately no `will-change`.** It
forces its own layer and re-rasterises every frame; four large cards blurring together
is the heaviest moment in the section. Declaring `will-change: filter` would hold four
permanent layers for an animation that runs once. **If this janks on a mid-range
machine, drop the blur — not the duration.**

**The run was three passes, and each complaint had a different cause — which is the
reason it took three.**

| Pass | Read as | Actual cause |
|---|---|---|
| `out-expo` / 900 / per-card | a snap | the stagger never ran (below) **and** the curve front-loaded |
| `smooth` / 1200 / per-card | slow | the DURATION — a reveal is not a set piece |
| `smooth` / 640 / per-row | not smooth | the curve's **START VELOCITY** |
| `standard` / 640 / per-row | a shade slow, wanted 1-by-1 | the DURATION again, and the stagger's GROUPING |
| `standard` / 560 / per-card 90 | — | — |

🔴 **"Too quick", "too slow" and "not smooth" are three different properties.** That is
the lesson worth carrying to every other reveal on this site:

| complaint | property |
|---|---|
| too quick | the curve's front-loading (here, plus a stagger that never ran) |
| too slow | the duration |
| not smooth | the curve's **start velocity** |
| wrong rhythm | the stagger's **grouping** — a taste call, so it lives in the caller |
| starts late | the observer's **root margin** — never the delay |

⚠️ **"Starts too late" is the trigger, not the stagger.** Row one's cards were already at
0 and 90ms, so no delay change could have made them begin sooner; what was late was the
moment the observer fired. **−15% → −5%**: at a 900px viewport that moves the trigger
from 135px above the fold to 45px, so a card starts moving as it appears rather than
after it has settled into view.

⚠️ **This deliberately diverges from `useRevealed`'s −15%**, which is right for what it
serves — `StatChart`, one graphic whose whole sequence should be on screen before it
begins. A card in a grid is not that: it is one of four, and waiting makes it look like
it forgot to animate.

⚠️ It cannot go far positive — that fires before the card is visible, so the entrance is
over by the time you see it. A reveal nobody sees is a fade-in with extra machinery.

⚠️ **The stagger went per-card across both rows (160) → per-row → per-card across both
(90) → per-card, index restarting each row.** Per-row grouping was a fair reading of
"each row can come in after each other" and was not what was wanted. The value matters
as much as the grouping: 160 read as four cards taking turns, 90 against a 560ms
duration overlaps them heavily enough to read as one wave. **Grouping and interval are
one decision.**

🔴 ⚠️ **CONTINUING THE INDEX ACROSS ROWS MADE ROW TWO WAIT TWICE.** Each card observes
itself, so row two already fires later than row one *by scroll position* — and then paid
a further 180–270ms of delay on top. Later trigger **plus** larger delay, for a row whose
lateness the viewport had already handled.

**With self-observing reveals, a delay index must be relative to the group that shares a
trigger.** Row one is 0 · 90; row two is 0 · 90 again. The cost is that both rows
entering together on a very tall screen now read as two pairs rather than one run of
four — the rarer case, and much the lesser fault.

`ease-smooth` is an ease-OUT — it begins at full pace and decelerates, covering **14.4%
of the travel in the first 5%** of the duration. However long you make it, the card
*snaps into motion*. `ease-standard` eases in as well: **0.6%** in that window. It costs
almost nothing in perceived speed, because the two converge by the halfway mark (87% vs
78%) and are level by 75% — only the first fifth differs, which is the part that read as
harsh.

| curve | 5% | 10% | 25% | 50% | 75% |
|---|---|---|---|---|---|
| `out-expo` | — | 49% | 83% | 97% | 100% |
| `smooth` | 14.4% | 27% | 58% | 87% | 98% |
| `standard` | 0.6% | 3% | 24% | 78% | 96% |

⚠️ **640 is "natural", 1200 is "cinematic".** A card entering the viewport should catch
up with the scroll, not perform; the reader is already moving, and anything longer than
the scroll gesture itself feels like being held up.

⚠️ **STAGGER BY ROW, NOT BY CARD.** Two cards side by side at the same height, arriving
160ms apart, read as one of them *lagging* — not as a sequence. Cards that share a row
share a moment; the rows are the beats. And because each card observes itself, on most
viewports row two is already later by scroll position and the delay never shows — it
only does its job when both rows enter together on a tall screen, which is exactly the
case that looked wrong.

🔴 **Two things made the FIRST build read as "very quick", and neither was the duration.**

**1. The stagger never ran.** The delay was written `shown ? undefined : { transitionDelay }`
— clear it after the entrance. But `shown` flipping true is the *same render* that swaps
the classes, so React commits the new state and the removal of the delay together: the
transition starts immediately and all four cards reveal on the same frame. **A staggered
entrance must keep its delay applied through the transition.**

**2. `ease-out-expo` front-loads.** Fraction of the move completed at each fraction of
the duration:

| curve | 10% | 25% | 50% | 75% |
|---|---|---|---|---|
| `out-expo` | 49% | 83% | 97% | 100% |
| `smooth` | 27% | 58% | 87% | 98% |
| `standard` | 3% | 24% | 78% | 96% |

At 900ms `out-expo` finished the visible motion in ~225ms and spent the remaining 675 on
four invisible pixels. **A long duration does not make a slow move — the curve decides
how the time is spent, the duration only decides how much there is.** Same lesson as the
Services expansion (quint → cubic).

**Applied to `Pricing` as well (13 Aug)** — same component, same 90ms stagger, one card
at a time in reading order.

⚠️ **Suppressed on the Apps & Dashboards tab**, matched on the tab's `value` rather than
its index or label. The reason is not only taste: these cards can arrive by SCROLL or by
TAB SWITCH, and a `Reveal` that remounts on a tab change fires immediately because it is
already in view. Left on, the same effect would mean "you scrolled to this" on first
sight and "you clicked that" a moment later. Websites is the default tab and is normally
met by scrolling; Apps is only ever reached by clicking. **Suppressing it there is what
keeps the effect meaning one thing.**

⚠️ Both branches render a wrapper `div`, so the grid's child count and placement are
identical either way — only the animation is conditional. Keys are the tier NAME, not
the index: switching tabs swaps three tiers for two, and an index key would re-use a
mounted card for a different tier and skip the entrance entirely.

⚠️ `CARD_STAGGER` is **mirrored in both sections, not shared**. They happen to agree;
a common constant would imply a coupling that does not exist.

**Guidance for the remaining sections:** Guidance: one
reveal per *block*, not per element. Stagger within a block only where the elements
are genuinely a sequence (the four Process steps); never stagger a paragraph.

### 5.1a `StatChart` reveal ✅ BUILT
The About chart draws itself once as it enters the viewport, via `useRevealed`
with `rootMargin: 0 0 -20% 0` — later than the default, so it fires when the chart
is properly on screen rather than as its top edge clips in.

Four beats — bars up, line chases, dots land, disc pops. ⚠️ **They OVERLAP now; they
used to queue.** Retimed 13 Aug (Jimmy: the graph should "grow slightly quicker" and
the badge "pop up sooner and faster").

| Element | Timing | Delay | was |
|---|---|---|---|
| Bars fill their tracks | **`slow` (420)** `ease-out-expo` | **`i × 64ms`**, `+40ms` for the pale series | 560, `i × 80` |
| Trend line wipes in | `slowest` (900) `ease-linear` | 260ms | unchanged |
| Dot per peak | `base` (280) `ease-cta-expand` | `260 + (x/100) × 900` | unchanged |
| Stat disc over-expands in | **`slow` (420)** `ease-out-back` | **`260 + 900 × 0.25` = 485ms** | 280 `cta-expand`, 665ms |
| ~~Percentage counts 0 → target~~ | ⚠️ **DELETED 13 Aug** — the figure renders at its value | — | 900ms on rAF |

    bars   ▓▓▓▓▓▓▓░░░           0 →  740
    line      ▓▓▓▓▓▓▓▓▓▓▓▓     260 → 1160
    badge          ▓▓          665 →  945
    count          ▓▓▓▓▓▓▓▓    665 → 1565

⚠️ **`CARD_DELAY` is a FRACTION of the wipe, not a fixed number** — `LINE_DELAY +
LINE_MS × 0.45` — so it keeps its relationship if the line is ever retimed. It was
`LINE_DELAY + LINE_MS + 120`, i.e. a strict queue in which nothing overlapped and the
disc arrived after everything had settled. **A queue reads as slow even when nothing in
it is.** The overlap is safe because the disc sits over the SHORT EARLY BARS, which are
already drawn by 665ms — it never lands on something still moving.

⚠️ **The bars' stagger and duration had to move together.** A shorter stagger with the
same long duration only overlaps the bars more; it does not make any single one feel
faster.

⚠️ **The disc's curve CHANGED on 13 Aug** — `ease-cta-expand` → `ease-out-back`, for a
much bigger spring. Measured peaks: `cta-expand` **1.098**, `out-back` **1.221**. On a
`scale-50 → 100` move that is 1.11× final size against 1.05×, which is the difference
between a spring and a nudge. `out-back` is not a new curve — it is already the site's
elastic settle (the CTA badge on roll-off, the label snapping to centre), so the disc
joins that language rather than borrowing the milder expand curve.

⚠️ **Its duration went UP, 280 → `slow` (420), and that is counter to instinct.** An
overshoot needs TIME TO BE SEEN: the spring past 1 and back is roughly the last third of
the curve, ~90ms at 280 and ~140 at 420. Below about 250ms a large overshoot stops
reading as elastic and starts reading as a flicker. **A bigger overshoot wants a longer
duration, not a shorter one.**

🔴 ⚠️ **THE COUNT-UP IS DELETED.** It ran 0 → 60 on rAF as the disc landed. Two costs,
the second being the real one: the pop and the ticking number were both asking to be
watched in the same 40px circle at the same moment, so neither won; and it put a rAF
loop and a timeout into a component that otherwise has none — rAF does not fire in a
backgrounded tab, and the reduced-motion branch plus cleanup existed only to make that
safe. Removing it removed `useState`, `useRef`, `useEffect` and the React import from
`StatChart` entirely. The stat is static content, which is what it always was.

⚠️ **The count-up moved for a knock-on reason, not its own.** With the disc 615ms
earlier, the counter is what you watch for most of the sequence; at 1100 it was still
ticking well after the line had finished. At 900 it settles last, at 1565, which is
right for the one number the section is making.

**The dot delays are derived from the line's duration**, not authored — so a dot
lands exactly as the line reaches its peak, and retiming the line cannot leave the
two out of step.

`ease-out-expo` on the bars and line, not `cta-expand` — a bar that overshoots its
own value and settles back is a chart that lies for 200ms. The dots and the disc
are the elements that *should* overshoot, so they get `cta-expand`, whose curve
goes past 1 before settling. The disc runs `scale-50 → 100` through it, which is
where the pop comes from.

⚠️ **The line is a `clip-path` wipe, not `stroke-dashoffset`.** With
`vector-effect: non-scaling-stroke` on the path, dash lengths resolve in screen
units while `pathLength="1"` normalises in user units — they disagree, and the
line renders as dashes with real gaps. Do not reintroduce a dash-based draw-on
while that vector-effect is there.

**The counter starts with the card, not on reveal**, and uses the same easing curve
as the bars, hand-rolled in JS. A number that arrives before its own card looks
bolted on; a linear count finishes early and sits there. `tabular-nums` stops the
digits jittering as they change width.

This puts `expand` and `slowest` to work — two of the durations §2 flagged as
unused.

**Reduced motion is covered three times over:** `useRevealed` reveals immediately,
the global rule (§7.2) drops `height` from the transition list, and the counter
short-circuits to its final value. A number ticking up is exactly what that setting
is asking us not to do, so it does not rely on the CSS path alone.

### 5.0 Anchor scrolling ✅ BUILT
Nav links glide to their section rather than snapping — `scroll-behavior: smooth`
on `html`.

**Native, not a JS tween.** The browser runs it on the compositor, it cannot fight
the user mid-scroll, and it hands control straight back the moment they touch the
wheel. A JS scroll animation has to reimplement all three, and usually gets the
third wrong. The trade is that duration and easing are the browser's to choose —
if a longer, custom-eased scroll is ever wanted, that is the point to take it over,
and the cost is owning interruption handling.

`section[id]` and `footer[id]` carry `scroll-margin-top: 6rem` so an anchored
section stops **below** the fixed nav. Without it every link lands with its heading
hidden behind the bar — technically at the top of the viewport, which is precisely
the problem.

Reduced motion is already covered: §7.2 forces `scroll-behavior: auto`.

⚠️ **`#contact` had no target.** The nav CTA and both section CTAs point at it and
nothing on the page carried the id, so all three were dead links. The footer now
has it.

### 5.2 Services pin ✅ BUILT
A wrapper taller than the viewport with a `sticky` inner box: the reel holds still
while the overhang scrolls past. `progress = scrolled ÷ available`, mapped to
`0…n-1` and handed to **both** columns, so the numerals and the copy run off one
value and cannot desync. Continuous, no snapping. rAF-throttled.

**Scroll cost is `(n−1) × 80vh`, not `× 100vh`.** A full viewport per service is the
usual choice and would make six services cost five screens before the page moves
on; 80% keeps the gesture unhurried and gives a third of that back.

The copy is a **reel, not a cross-fade** — each panel is one `service-panel` slot
tall, so translating the track by `progress / n` of its own height moves it exactly
one slot per service, matching the numerals' pitch behaviour.

**Below `md`, and under reduced motion, there is NO PIN** — panels stack as ordinary
content with the numeral inline above each (RESPONSIVE_SPEC.md §5.4). Hijacking
scroll for several viewport-heights on a phone is the most hostile pattern
available, and doing it in defiance of `prefers-reduced-motion` is worse.

⚠️ That check is a `matchMedia` **listener**, not a one-off read. Rotating a tablet
crosses the boundary, and a stale answer leaves the page either pinned with no
scroll handler or unpinned inside a wrapper still reserving five screens of height.

### 5.2a Footer rise ⚠️ INVENTED · ✅ BUILT
The footer panel comes UP over the testimonials with an elastic settle. Not in the
design — Jimmy's brief.

⚠️ **There is no JavaScript in this at all.** The footer is an ordinary section in
normal flow; the **testimonials are `sticky`**, so they pin while the footer scrolls
up over them. Going back up reverses it for free, because it is just scrolling.

The two sections share a parent on purpose: a sticky element sticks within its
PARENT's box, so with the footer outside that wrapper there would be nothing left
to stick for.

`lg:` only — on a phone the testimonials are taller than the viewport, and pinning
them at `top-0` would hide their lower half behind the footer.

The footer carries an opaque `bg-neutral-100` and a `z-index` above the sticky
section, so it occludes rather than blends. Without the background you see the
testimonials through the panel's 10px gutter as it passes.

> **Three JS attempts preceded this** — an IntersectionObserver trigger, a
> scroll-position transform on a `fixed` panel, then the same with a measured
> spacer. All were poppy or glitchy, and all for the same reason: a fixed element
> has to re-derive a position the scroller already knows, and any lag between the
> two reads as jitter. Sticky hands it to the compositor, so it cannot desync —
> and it needs no measurement, no listener and no reduced-motion branch.

### 5.3 Hero entrance ▶ D8
Not yet specified. Needs deciding with the hero frames, alongside the open
responsive question about whether the arch and CTA fit above the fold.

---

## 6. Hero video ✅ BUILT

Ping-pong loop: forward → reverse → forward, so footage never cut to loop still
cycles with no visible jump. Browsers reject a negative `playbackRate`, so the
reverse pass walks `currentTime` backwards on rAF, stepping by **real elapsed
time** — it therefore runs at the same speed on a 120Hz screen as a 60Hz one.

Poster is the base layer and the LCP; the video fades in over it (`duration-base
ease-standard`) once it can play. Not mounted at all below 640px or under reduced
motion — the poster is the finished state, not a degraded one.

---

## 7. `prefers-reduced-motion`

CLAUDE.md §5: *"colour changes may remain; expansions, loops and scroll reveals
must not."*

### 7.1 Component-level ✅ BUILT
`useRevealed` (reveals all), `LiquidImage` (static image), `ServiceNumerals`
(snaps), `BackgroundVideo` (poster only).

### 7.2 The global backstop — ⚠️ FIXED IN D6

`globals.css` carried the standard blanket override, which set **every** transition
to `0.001ms`. That is the common accessible-defaults snippet, and it contradicts
§5: it also killed colour transitions, which the guardrail explicitly permits.

The effect was that a reduced-motion user got a *worse* interface than necessary —
every hover state snapped between colours with no cross-fade, which reads as
broken rather than as calm.

Now scoped: the override **restricts `transition-property` to colour and opacity**
and gives them a short 150ms duration. Transform, size and flex are no longer in
the property list, so they snap — expansions genuinely do not animate — while
colour still eases. Keyframe animations and smooth scrolling are still killed
outright.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-property: color, background-color, border-color, fill, stroke,
                         opacity, box-shadow !important;
    transition-duration: 150ms !important;
  }
}
```

`box-shadow` is included so the **focus ring still animates** — it is the one piece
of feedback a keyboard user cannot do without (CLAUDE.md §5).

---

## 8. Cut from v1

Recorded so nobody goes looking:

| | Why |
|---|---|
| **Custom cursor** | Not in the v2 inventory. The commented-out `cursor: none` rule survives in `globals.css`; delete it or leave it dead, but do not revive it without a decision. |
| **Carousel motion** | `Carousel` is cut from v2 (COMPONENTS.md). The hero is `HeroArch`, a static composition. |
| **Page transitions** | Never built in v1 either. Out of scope unless asked. |
| **Hero carousel choreography** | Superseded by `HeroArch` + `LiquidImage`. |

---

## 9. Verification (D9)

- Every `lg:`-gated interaction is inert at 1023px and live at 1024px.
- Reduced motion: colours still cross-fade; nothing translates, grows or loops.
- The nav does not hide over the hero, and reappears immediately on scroll up.
- The services reel is scrubbable in both directions with no drift between the
  numerals and the copy.
- `LiquidImage` holds at most one live WebGL context per hovered card, and the
  images survive repeated rollovers (the D4 regression).


---

## The Services background mark — ⚠️ ADDED 13 Aug

An oversized `Logo variant="mark"`, cropped by the section's right edge, that turns
with the reel: `rotate(progress × MARK_DEG_PER_PANEL)`, 24° per service.

⚠️ **It runs off `progress`, the same value the numerals, the spine thumb and the
panel stagger use.** That is what gives it scroll DIRECTION for nothing — scroll
back and `progress` falls, so the mark unwinds. No listener, no velocity tracking,
and it cannot desync from the reel.

⚠️ **24° is not arbitrary.** A four-fold mark looks identical every 90°, so any
multiple of 90 across the reel would appear to snap back to its starting position.
24 × 6 = 144 never repeats a position.

⚠️ **It was a cog first.** Rejected: this section already drives four things off one
scroll value, so a fifth had to earn its place, and a gear is generic machinery on a
site selling design to small businesses. The brand mark does the same job and is the
one shape that is unarguably Otix's.

⚠️ **It is `-z-10`, behind the spine, and must stay there.** The spine is the only
thing reporting how far through a five-screen pin you are; decoration crossing it
would compete with the one piece of real information in that strip. It also fades on
`1 - expand` so it is gone by the time panel 07 is open.

⚠️ **Its strength is a MEASURED ceiling, not a taste call.** `neutral-400` at 0.45 →
`#E4E0D9`, **1.22:1** against the page. The run on cream was 0.55 → 1 → 0.65 → 0.45.
Full strength (`neutral-400` at 1.59:1) is technically "the dark cream in the scale" and
still wrong: a form this large with a readable edge stops being atmosphere and sits in
front of the cards it is meant to be behind. Small marks tolerate a contrast big ones do
not. The useful range is narrow — a tenth of alpha is about five hundredths of a ratio —
which is why the values are stepped and recorded rather than nudged by eye.

⚠️ **Sized `min(clamp(…, 960px), 86vh)`** so it is cropped SIDEWAYS ONLY. The reel sits
in an `h-screen overflow-hidden` box; unbounded, the mark lost its top and bottom too,
and a flat edge across a circular form reads as a fault rather than a crop.

### The spine, recoloured for cream (13 Aug)

Track `border-on-dark` → `border-divider`: the old one is `rgba(255,255,255,0.2)`, a
white hairline, which is **1.03:1** on `neutral-100`. Thumb `green-300` → `green-600`:
**1.80:1 → 7.04:1**.

⚠️ **The opposite call to the wheel above, deliberately.** The thumb is the only thing
telling you how far through a five-screen pin you are, so it is the one element in that
strip that should be READ rather than felt. It is `aria-hidden` — the numerals carried
position in the accessible tree — so WCAG 1.4.11's 3:1 does not formally bind; 7.04 is
chosen because the job is legibility, not compliance.

Under `prefers-reduced-motion` the pin does not mount at all, so neither does this.


---

## Services — the orbit (⚠️ replaced the vertical reel, 13 Aug)

Cards sit on an arc around the wheel rather than in a translating column:

    theta = (i − progress) × 40°        centre at (1.02, 0.5) of the panel
    x     = cx − R·cos(theta)           R = 0.45 of panel width
    y     = cy + R·sin(theta)

θ=0 is the circle's leftmost point — the active card, centred and upright. `cx − R`
is the dial for how far left it reads (0.57 of the panel); it cannot go much past
0.48 before the card overlaps the section title.

⚠️ **The cards do not rotate, only travel.** Tilting them with the arc is the
obvious reading and it is wrong: they carry body copy, and type set at an angle
stops being READABLE well before it stops being legible.

⚠️ **BLUR AND SCALE ARE ON DIFFERENT RAMPS (13 Aug).** Scale runs linearly from
`distance` 0; blur **holds at zero until 0.3**, then ramps over the remaining 0.7. Both
used to share one ramp, so the card softened the instant it left dead centre — the sharp
state existed for a single value rather than a stretch of scroll, and the card you are
meant to be READING was only truly legible for an instant. It now sits sharp across 30%
of a step either side, 60% of the gap between two cards.

| distance | blur |
|---|---|
| 0 – 0.30 | **0px** |
| 0.45 | 1.3px |
| 0.60 | 2.6px |
| 1.00 | 6px |

⚠️ **The split is the point, not a shortcut.** Scale carries depth *continuously* as the
wheel turns; blur says "this one is not for you yet". Giving them the same dead zone
would flatten the arc into a row of identical cards near the middle — **depth is
continuous, focus is not.**

⚠️ `BLUR_HOLD` cannot go much past ~0.4: `ORBIT_STEP_DEG` is 40°, so beyond that the
blur has too little range left and arrives as a jump rather than a fade.

⚠️ The filter is dropped entirely (`undefined`, not `blur(0px)`) inside the dead zone —
an element with a filter is promoted to its own layer and re-rasterised, so this is also
what lets the ACTIVE card render normally for the whole time it is being read.

⚠️ **Neighbours scale AND blur — reversed 13 Aug.** While the cards were
frosted glass on a dark panel they could only scale: blurring a frosted card makes the
two effects stop meaning different things. `ServiceCard` is an opaque white card on
cream, so blur is available again — and it is now required, because blur alone reads as
a rendering fault (nothing goes out of focus without also getting smaller) and scale
alone was never enough to push a card back on a light ground. `AWAY_SCALE = 0.86`,
`AWAY_BLUR_PX = 6`, both driven by one `distance` 0→1.

⚠️ **The blur and scale live in the CARD, not in the orbit.** The reel places the card
and passes `distance`; scaling in both places compounds them.

⚠️ **Cards beyond 1.75 steps are still culled — but the six services opt OUT.**
`orbitBox(d, force)` renders all six regardless, for **SEO**: each title is an `<h3>`,
and culling meant only two of six service headings existed in the rendered DOM.
Measured on the live page — all six are in the server HTML, four vanish on hydration.
Google indexes the rendered DOM. An off-arc card is positioned outside the sticky box,
which is `overflow-hidden`, so it is clipped and never painted. **Panel 07 keeps the
limit** — it mounts a whole interactive quiz, and a form needs no early indexing.

Everything runs off `progress`, so nothing can desync and it all reverses on the way
back up. Under `prefers-reduced-motion` the pin does not mount, so neither does any
of this.


⚠️ **The nav is held hidden over this whole section** — see `Nav`'s `hideOver`. The
reel and the expanded quiz card each own the entire screen, and a bar that came back
on every upward nudge read as chrome that had not been told.

⚠️ **Never put `opacity` on an orbiting card.** Opacity below 1 makes an element a
group, rendered in isolation, and a `backdrop-filter` inside a group has nothing to
sample — so the cards' frost silently evaluates to nothing. The symptom is
misleading: at rest the active card is at exactly 1 and frosts fine; one pixel of
scroll makes `progress` fractional and every frost switches off at once. Depth is
carried by scale, blur, and the panel edge cropping the neighbours.

> Still true even though `ServiceCard` is opaque and does not frost — **panel 07 does**,
> and it rides the same arc. The constant `ORBIT_NEIGHBOUR_SCALE_ONLY` exists in the
> code purely as an anchor for this note.

---

## Services — panel 07's expansion (⚠️ REWRITTEN 13 Aug, twice)

**It is a SCRUB. `expand` is read straight off scroll position across `VH_EXPAND`
(70vh) and shaped once by `easeOut` (cubic).**

```
t      = clamp((vh − expandFrom) / VH_EXPAND, 0, 1)
expand = easeOut(t)          // 1 − (1−t)³
```

That is the whole mechanism. Every consumer — the card's box, the frost, the quiz slot,
the heading scale, the interpolated padding — reads that one value and stages on
fractions of it. **The ease is applied once, where `expand` is set.** Easing consumers
individually is how they drift apart.

### The three approaches, and why this is the one

| | What it was | Why it went |
|---|---|---|
| 1. Scrub | the original | The card could come to rest half-open, which read as a fault. |
| 2. CSS-transition latch | `expand` binary, browser interpolates | Reverted within the hour. The things staged on `expand` include a **type token swap** and an **inline padding number**; a CSS transition can interpolate neither, so they snapped while the box glided. |
| 3. Timed tween | a latch tripping an `EXPAND_MS` clock | Feel was fine; the *architecture* was not. A clock and a wheel are two drivers and nothing makes the wheel wait, so every hard case — flick past the trigger, reverse mid-flight, over-scroll the end — was the same bug in a different hat. It needed two latch thresholds in a fixed order, a scroll floor, and a hand-over, all patching one root cause. |
| 4. **Scrub again** | here | One driver, so none of those cases exist. About sixty lines went with the tween. |

⚠️ **The half-open rest state is back and is HANDLED, not prevented.** A zero-height
`snap-start` marker sits exactly where `expand` reaches 1, so a scroll that stops
mid-expansion is pulled open — CSS doing the job the latch was invented for, without a
second driver. `proximity` snapping, so a deliberate early stop still stands.

⚠️ **The curve is `easeOut` (cubic), not `easeOutQuint`.** Quint was the tween's, and it
is right on a clock — a decisive start covers the latency of a threshold being crossed.
On a wheel there is no latency to cover and the front-loading is simply speed: quint
spends two-thirds of the move in the first fifth of the scroll. Measured, as scroll to
reach a given openness:

| | 25% | 50% | 90% |
|---|---|---|---|
| quint @ 45vh *(the tween's shape)* | 2.5vh | 5.8vh | 16.6vh |
| **cubic @ 70vh** *(now)* | **6.4vh** | **14.4vh** | **37.5vh** |

`easeOutQuint` is kept in the file, unused, as the sharper alternative.

⚠️ **`VH_EXPAND` is a real lever again** — it is the literal scroll distance the
expansion costs, not the room a clock needs to finish in.

### The card's geometry

- Interior padding interpolates with the box: **48 all round as a card → 100 all round
  open.** The sides went 60 → 120 → 100: 60 (the site's flush line) was too close to the
  edge, because every other section at 60 has the PAGE around it doing the containing
  and this one is the whole viewport; 120 over-corrected into a letterbox. Matching the
  vertical is the answer — a full-bleed surface holds its content in, and there is no
  reason to hold harder in one axis than the other.
- Grows from the six cards' own slot to the viewport **minus the gutter on three sides**.
  Bottom goes to 0: the open card hugs its content, is taller than the screen, and runs
  off the fold, so its bottom is not an edge and must not be given one.
- **No clip anywhere.** The frame's `overflow-hidden` was removed entirely: inset by the
  gutter, it cut the card 10px *above* the fold and left a cream line beneath it, which
  reads as sliced. The six service cards live in the `h-screen` sticky box and are cut by
  the window edge exactly, with no strip below — so they read as continuing off screen.
  A `fixed` element cannot paint outside the viewport anyway, so the clip was containing
  nothing but those 10px.
- The centring translate **unwinds** as it opens (`-50%` → `0`): on the arc the card is
  positioned by its centre like its neighbours, open it is anchored top-left. Pick one
  anchor for both and it leaps half its own size the instant the expansion starts.
