# Services — the green orbit build (snapshot, 13 Aug)

⚠️ **A SNAPSHOT, NOT A BUILD.** Nothing here is imported and nothing should be. It is
kept so the green-panel version can be restored if the cream rebuild does not land.

## What this version is

The Services section as it stood immediately before the "SERVICES UPDATE CLAUDE"
rebuild — the last state Jimmy signed off on piece by piece over 13 Aug.

- **A gradient panel** (`gradient-services`, green-900 → green-950) inset by the
  10px gutter at radius 30, filling the viewport while pinned.
- **The section title INSIDE the panel**, centred, arriving first and travelling up
  and out across a 70vh intro while the reel rises to meet it.
- **An orbit**: cards on an arc around a wheel centred just off the right edge,
  `theta = (i − progress) × 40°`, radius 0.45 of the panel width. Neighbours scale to
  0.82 and are cropped by the panel edge. **No opacity on the cards** — see below.
- **Glass cards** on the gradient, `overlay-glass-card` + `backdrop-blur-card`, with a
  4px green-300 rounded rule beside the sub-copy and titles in Adelle italic.
- **A reel column** of the six service icons at numeral size, with rules between them.
- **The Otix mark as the wheel**, oversized, blurred, with a counter-rotated specular
  gradient so the highlight stays still while the form turns.
- **Panel 07** — the quiz card — orbiting like the rest, then expanding to full screen
  on a time-based tween with a scroll floor, and releasing the pin.

## The five things that were expensive to learn

1. **Never put `opacity` on an orbiting card.** Opacity < 1 makes an element a group,
   rendered in isolation, so a `backdrop-filter` inside it has nothing to sample and
   the frost silently evaluates to nothing. The symptom is misleading: at rest the
   active card is at exactly 1 and frosts fine; one pixel of scroll makes `progress`
   fractional and every frost switches off at once.
2. **A `%` in `translateY` resolves against the element's OWN height.** Written that
   way, the reel row — whose height is just the numerals column — moved a few dozen
   pixels instead of most of a screen. Travel distances must be resolved to px.
3. **The expansion is a tween with a scroll FLOOR, not a scrub.** A scrub can rest
   half-open; a pure tween can be outrun by a hard flick. The floor is the old scrub
   kept as a minimum, and it must HAND OVER to the tween rather than clamp it every
   frame — clamping made the card move in scroll-sized jerks.
4. **The floor applies when opening only.** Clamping the close as well made scrolling
   up snap the card shut instead of tweening it.
5. **`backdrop-filter` ignores an ancestor's border-radius in Chrome.** The frost
   layer needs its own `rounded-3xl` or it paints square through the card's corners.

## Restoring it

Copy the four files back over their originals, then:
- CLAUDE.md §0.1: Services returns to **containered**.
- `app/page.tsx`: the `header` prop shape is unchanged.
- `globals.css`: the `scroll-snap-type` rule and `content.services.cta` are still
  needed.
