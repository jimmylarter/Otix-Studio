# AUDIT — Services + shared components

Scope agreed with Jimmy: everything the last few days of work touched — `Services`,
`ServiceCard`, `QuizPanel`, `Quiz`, `Tag`, `Cta`, `Logo`, `ServicePanel`,
`ServiceNumerals` — plus the tokens they added and the spec pack that documents them.
Sections untouched since D4 are **out of scope**.

**Status: worked through 13 Aug.** ✅ = fixed · ⏸ = deliberately not fixed · ❓ = waiting
on a decision from Jimmy.

| § | Finding | Status |
|---|---|---|
| 1 | Orphaned tokens | ✅ all five deleted, reasoning moved to `DESIGN_TOKENS.md` §7b |
| 2 | `duration.expand` misnamed | ✅ → `duration.measured`; `StatChart` **and `Card`** updated |
| 3 | Card padding has no rule | ⏸ **Jimmy: not needed.** `ServiceCard` stays at `p-xl` |
| 4 | Misnamed components | ✅ `ServiceNumerals` **deleted** rather than renamed — nothing but the harness used it. `ServicePanel` keeps its name; see §5 |
| 5 | Two components, one job | ⏸ left as two — they share content and almost no presentation. Revisit if the phone build keeps this design |
| 6 | Mobile Services still dark | ❓ **needs your decision** — written up in `RESPONSIVE_SPEC.md` §5.4 |
| 7 | Values mirrored in JS | ✅ register added as `DESIGN_TOKENS.md` §7c — now **seven** entries |
| 8 | Dead files | ⏸ **yours to delete** — the sandbox cannot remove files in the mounted folder |
| 9 | Docs behind the code | ✅ all six brought back in step |

**Found during the fixing, not in the original audit:**

| Finding | Status |
|---|---|
| 🔴 **Only two of six service `<h3>`s were in the rendered DOM.** All six are in the server HTML; four vanish on hydration when the orbit's render limit culls them. Google indexes the rendered DOM. | ✅ fixed — `orbitBox(d, force)` opts the six cards out of culling. Panel 07 keeps the limit |
| `Card.tsx` was a second consumer of `duration-expand` | ✅ caught by lint during the rename |

The original findings follow.

Ranked: 🔴 wrong / will bite · 🟠 inconsistent / drifting · 🟡 tidy-up.

---

## 1. Orphaned tokens — 🟠

Added during the build, now referenced by nothing. Every one is a token that a future
change could "discover" and use, which is how a system grows a second way of doing
something it already does.

| Token | Where it lives | Why it's dead |
|---|---|---|
| `borderWidth.rule` (4px) | `tailwind.config.ts` | The 4px rounded rule was a `ServicePanel` device. That panel's rule is now a flex sibling sized with `w-xs`, not a border. |
| `transitionProperty.expand` | " | Built for the CSS-transition latch on panel 07. That approach was reverted the same day; the expansion is a scrub. |
| `transitionProperty["expand-inner"]` | " | Same. |
| `transitionDelay.stagger` (260ms) | " | Same. |
| `fontFamily["serif-condensed"]` | " | Adelle Condensed. The kit only ships it in italic 600/700, the design uses italic 400, so it can never be correct. |

**Proposed:** delete all five. They are recoverable from git and each has a comment
explaining what it was for, which is the part worth keeping — I'd move those notes into
`DESIGN_TOKENS.md` §"removed" rather than lose them.

**Counter-argument for `expand`/`expand-inner`:** if the expansion ever goes back to a
CSS transition they're exactly right. But it has now been a scrub twice and a transition
once, and the transition is documented as failing for a structural reason (it can't
interpolate a type token or an inline padding), so it is not coming back.

---

## 2. `duration.expand` (560ms) is used by one thing, and not for expanding — 🟠

`StatChart` uses `duration-expand` for its trend line. The token is named after panel
07's expansion, which no longer has a duration at all.

**Proposed:** rename to `duration.draw` and update `StatChart`. A duration named after a
feature that doesn't use it is a token that will get misapplied.

---

## 3. Card padding has no rule — 🟠

Seven card-shaped components, six different interior paddings:

| Component | Padding |
|---|---|
| `ServiceCard` | `p-xl` (24) |
| `TestimonialCard` | `p-2xl` (28) |
| `TierCard` | `p-3xl` (32) |
| `ServicePanel` | `p-3xl` / `p-6xl` |
| `StepCard` | `p-xl` (24) |
| `Card` | `p-5xl` (48) + `p-xl` |
| `QuizPanel` | 48 → 60 (interpolated) |

Some of this is real — a Work card and a pricing tier are different objects at different
sizes, and Figma may well draw them differently. But `ServiceCard` at 24 next to
`QuizPanel` at 48 is a difference **within one row of seven cards**, and that one is not
defensible: they sit side by side on the same arc.

**Proposed:** raise `ServiceCard` to `p-5xl` (48) so the seven agree, and leave the rest
alone pending a Figma check. Needs your eye — it will make the cards visibly roomier.

**Also:** `ServiceCard`'s content column carries `py-lg pr-lg` *on top of* the root's
`p-xl`. That's ad-hoc padding stacked on padding; the intent (extra breathing room right
of the copy) should be one value, not two that have to be added up mentally.

---

## 4. Two components are misnamed — 🟠

- **`ServiceNumerals` renders icons, not numerals.** The numerals were replaced by
  glyphs and the name never followed. It is now only used by `/dev/components`.
- **`ServicePanel` is not a panel in any sense the rest of the system uses** — it is the
  *mobile carousel card*. `ServiceCard` took the name that describes it best, leaving the
  older component holding a name that now points at the wrong thing.

CLAUDE.md §3 says frame name = component name = file name = section id. Both break it.

**Proposed:** `ServiceNumerals` → `ServiceReel`, `ServicePanel` → `ServiceSlide` (or fold
it into `ServiceCard` as a `variant="mobile"` — see §5).
⚠️ **I can't do renames from here** — the sandbox can't delete files inside the mounted
folder, so a rename leaves the old file behind. These are yours to run.

---

## 5. Two components do one job — 🟡

`ServicePanel` exists *only* for the mobile carousel; `ServiceCard` is the desktop orbit.
They take the same content and render it differently. CLAUDE.md §3 says consolidate
repeats into one component with props.

**Proposed:** fold into `ServiceCard` with a `layout="row" | "stacked"` prop. Worth doing
only if the phone build is going to keep this design — if the mobile Services section is
likely to be redesigned, doing it now is wasted work. Your call on timing.

---

## 6. Panel 07's dark-ground styling survived the move to cream — 🔴

`QuizPanel` is a photographic card, so `ink-50` copy is still right on it. But the mobile
branch of `Services` still paints `bg-gradient-services` (a dark ramp) behind the
carousel, because the phone build was never moved when the desktop section went back to
the page cream.

So **the section is cream on desktop and dark green on mobile.** That's not a responsive
adaptation, it's two designs.

**Proposed:** this one needs a decision from you rather than a fix from me — either the
phone build follows desktop onto cream (and `ServicePanel`'s glass cards need re-doing,
because a 7%-white fill needs a dark ground to read at all), or the dark ramp is
deliberate on small screens and `RESPONSIVE_SPEC.md` should say so explicitly.

---

## 7. Numbers mirrored from tokens in JS — 🟠 (accepted, but needs a register)

There are now **six** places where a token's value is transcribed into JavaScript because
it has to interpolate and Tailwind can't express the link:

| Value | Where | Mirrors |
|---|---|---|
| `48 → 100` | `Services` `padY` | `5xl`, `section-y` max |
| `48 → 60` | `Services` `padX` | `5xl`, `6xl` |
| `TITLE_PX` | `Services` | `text-service-title` clamp |
| `H2_PX` | `Services` | `text-h2` clamp |
| `BODY_SCALE` (16/18) | `QuizPanel` | `text-body` ÷ `text-body-lg` |
| `QUIZ_GAP` (48) | `QuizPanel` | `5xl` |
| `FROST_BLUR` (20) | `QuizPanel` | `backdropBlur.panel` |

Each is individually justified and commented. Collectively they are a **silent failure
mode**: change one type token and the site keeps building, keeps passing lint, and
renders slightly wrong.

**Proposed:** a `MIRRORED` section in `DESIGN_TOKENS.md` listing all seven, so a token
change has one place to check. Cheap, and it is the only defence available.

---

## 8. Dead files still in the tree — 🟡

- `components/__probe.tsx` — a debugging stub.
- `app/_dev_old/` — the v1 harness.
- `public/media/laptop-drawing.svg` — unreferenced since the sketch was removed.
- `components/sections/WhyOtix.tsx` — the section is deleted from the page; the file
  remains and is referenced by five doc files as though it exists.

⚠️ **Yours to delete** — same sandbox limitation as §4.

---

## 9. Docs are behind the code — 🔴

This is the largest gap, and the one CLAUDE.md is most explicit about ("when a decision
changes, update the doc in the same change so the pack never goes stale").

| Doc | What's wrong |
|---|---|
| `CLAUDE.md` §0.1 | Still lists **Services as Containered**. It went back to **Flush** when the gradient panel was removed — the note added on 13 Aug is now itself out of date. This is the exact 10px silent error §0.1 warns about. |
| `CLAUDE.md` §1.2 | Adelle section is current, but still references `serif-condensed`. |
| `COMPONENTS.md` | No `ServiceCard` entry at all. `ServicePanel`/`ServiceNumerals` entries describe the old reel. |
| `DESIGN_TOKENS.md` | Missing `service-title`, the `watermark` viewport cap, `overlay.glass-card`, `backdropBlur.card`, `blur.wheel`, `services-inset-left`, `service-glyph`. Still documents `gradient-services` as the Services surface. Still mentions Libre Baskerville. |
| `MOTION_SPEC.md` | Documents the **tween** (`EXPAND_MS`, latch thresholds, scroll floor). All of that is gone — the expansion is a scrub on `easeOut` over `VH_EXPAND`. Nothing describes the orbit, the wheel rotation, or the card blur/scale. |
| `CMS_READINESS.md` | `panels[].tags` is documented as a list; it is now `question: string`. `WhyOtix` still listed as a section. |
| `RESPONSIVE_SPEC.md` | §Services describes the reel with an icon column; also see §6 above. |

**Proposed:** I bring all six back in step in one pass. This is mechanical, carries no
visual risk, and is the item I'd do first regardless of what else you pick.

---

## What I'd do, in order

1. **§9 docs** — no risk, biggest gap, and everything else is easier to reason about once
   the pack is true.
2. **§7 mirrored-values register** — five minutes, prevents a silent class of bug.
3. **§1 + §2 tokens** — delete the orphans, rename `duration.expand`.
4. **§3 `ServiceCard` padding** — needs your eye first.
5. **§6 mobile ground** — needs your decision first.
6. **§4/§5/§8 renames, consolidation and deletions** — mostly yours to run; I can prepare
   the file contents for you to move.
