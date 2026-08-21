import type { Config } from "tailwindcss";

/**
 * Otix Studio — Design Tokens (Tailwind)  ·  v2 (green / neutral / ink)
 * ---------------------------------------------------------------------------
 * This config IS the token layer. Nothing in a component may use a raw hex,
 * a raw px, or an arbitrary Tailwind value ( no bg-[#0a0a0a], no mt-[37px] ).
 * Everything references a named token below.
 *
 * SOURCE OF TRUTH: the Figma file's variable collections + styles —
 *   Colour Palette (41)  ·  Spacing (18)  ·  Radius (9)  ·  Text styles (20)
 *   Effect styles: "Shadow Effect", "Inset Sunken"  ·  Paint style: "Gradient"
 * These values are EXPORTED from those, not interpreted. If Figma changes,
 * change it here in the same pass. See DESIGN_TOKENS.md for the full mapping
 * and for every drift value that was absorbed.
 *
 * Rules baked in:
 *  - Type + structural spacing are NAMED FLUID tokens (clamp), so you never
 *    write an arbitrary size. Fluid range is 375px -> 1440px viewport.
 *  - Letter-spacing is in em (scales with type size). Line-heights unitless.
 *  - space-gutter is the one fixed exception (10px desktop / 5px mobile) and
 *    is driven by a CSS var set in globals.css.
 *  - There is NO container / max-width token. The site is full width.
 *
 * SECTION GEOMETRY (two variants — both land content on the same 60px line):
 *  - Containered  : sits inside the 10px gutter  -> section-x 50 / section-y 100
 *  - Flush        : full-bleed, no gutter (Hero) -> section-x-flush 60 / section-y-flush 120
 *
 * Fluid formula (min@375 -> max@1440):
 *   clamp(min, calc(intercept + coeff*vw), max)
 * ---------------------------------------------------------------------------
 */

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./content/**/*.{ts,tsx}"],
  theme: {
    // Deliberately NO `container`, NO `maxWidth` screens ceiling. Full width.
    extend: {
      colors: {
        /**
         * FOREST GREEN — the brand scale. Figma: "Forest Green/*".
         * 600 is the base brand colour; 100/300 carry the Primary/Secondary/
         * Tertiary semantic roles Jimmy assigned in Figma.
         */
        green: {
          50: "#F3F6F5",
          100: "#E3EDE9", // Tertiary — body copy on dark
          200: "#C6DCD3",
          300: "#98C3B1", // Secondary — italic accents on dark, price symbols
          400: "#5CA385",
          500: "#407760",
          600: "#315C4A", // Primary — brand green, eyebrows, italic accents on light
          700: "#264A3B",
          800: "#1D3A2E",
          900: "#142920", // gradient start
          950: "#0C1813", // gradient end, CTA label on light
        },

        /**
         * NEUTRAL — warm page/background scale (hue 40°). Figma: "Neutral/*".
         * 0 is pure white and is DISTINCT from Ink/50 (#FAFAFA) — both are in use.
         */
        neutral: {
          0: "#FFFFFF", // Neutral/0 White — inputs, cards, nav text
          50: "#FBFBFA",
          100: "#F7F6F4", // Primary — page background
          200: "#F1EFEB", // Secondary — alternate section background
          300: "#E4E0D8", // Tertiary
          400: "#CDC5B7",
          500: "#AFA48E",
          600: "#8E8167",
          700: "#6A614D",
          800: "#4B4335",
          900: "#2D291F",
          950: "#181611",
        },

        /**
         * INK — pure-grey text scale (0% saturation). Figma: "Ink/*".
         * Deliberately NOT warm: crisp ink reads better on the warm page than
         * warm-on-warm would.
         */
        ink: {
          50: "#FAFAFA", // Tertiary — headings/copy on dark
          100: "#F2F2F2",
          200: "#E0E0E0",
          300: "#C7C7C7",
          400: "#A6A6A6", // input placeholder
          500: "#808080",
          600: "#626262", // Secondary — sub-copy / body
          700: "#474747",
          800: "#2E2E2E",
          900: "#141414", // Primary — headings
          950: "#0A0A0A",
        },

        // --- Borders / dividers (Figma: "Border/*") ---
        border: {
          divider: "#CED6D0", // hairlines, rules, chart bars (absorbs #D3DAD5)
          /**
           * `divider` at 60% — the SAME colour, softened, rather than a new grey
           * invented alongside it. Derived on purpose: a hand-picked midpoint would
           * drift the moment `divider` changed.
           *
           * It exists because the mobile Services carousel needed a line between
           * cards and neither end of the scale worked: `divider` read as a table
           * border between content, and `hairline` (below) all but disappeared on
           * the warm page. Added 13 Aug.
           */
          "divider-soft": "rgba(206,214,208,0.6)",
          hairline: "rgba(235,235,235,0.6)", // faint rules on light
          input: "rgba(0,0,0,0.1)", // form field border
          "on-dark": "rgba(255,255,255,0.2)", // badge border on dark/glass
          green: "rgba(64,119,96,0.35)", // eyebrow pill + segmented toggle stroke
          /**
           * The contact form's glass edges (Figma `NEW FORM`, 172:2753).
           *
           * ⚠️ THE FIELD EDGE IS THE STRONGER OF THE TWO, which is the opposite of
           * what it looks like it should be. It was 0.07 to start with — quieter
           * than the panel, so six of them would not read as a grid of boxes — and
           * that measured **1.23:1 against the panel**, against the 3:1 WCAG 1.4.11
           * requires for a control's visual boundary.
           *
           * That rule bit here and not before because the old fields were SOLID
           * WHITE on the dark gradient: the fill carried the contrast and the
           * border was decoration. A translucent field on a translucent panel has
           * no fill contrast to lean on, so the edge has to do the whole job.
           *
           * ⚠️ 0.26 measures **2.11:1 — it does NOT meet 3:1**, and that is a
           * knowing trade made on 13 Aug, not an oversight. Measured on this ground:
           * 0.26 → 2.11 · 0.30 → 2.37 · 0.34 → 2.63 · 0.40 → 3.06 (the first pass).
           * It went 0.07 → 0.30 → 0.40 → 0.34 → 0.26 before settling; 0.40 was the
           * only compliant value and it read as heavy on the page.
           *
           * Why it is defensible: every field now carries a PERMANENT VISIBLE LABEL
           * above it and visible placeholder text inside, so the control is
           * identifiable without leaning on its boundary alone.
           *
           * ⚠️ Why there is no cleverer way out. Both escape routes were measured
           * and neither exists on this ground:
           *   · darken the fill so it identifies itself → a PURE BLACK field is only
           *     2.05:1 against the panel. The headroom is not there.
           *   · lighten the fill instead → tops out around 2.1:1 before the typed
           *     text starts losing its own contrast.
           * The edge is the only lever, so softening it IS the trade — there is no
           * version of this where the form looks quiet and the boundary passes. If
           * accessibility is ever audited, this is the line that comes up, and 0.40
           * is what it has to go back to.
           */
          glass: "rgba(255,255,255,0.12)",
          "glass-field": "rgba(255,255,255,0.26)",
        },

        // --- Accent (Figma: "Accent/*") ---
        accent: {
          // The Services section's quiet sage layer: the oversized numerals, the
          // service icons, and (13 Aug) the progress spine's thumb. Named for the
          // numerals because that is where it came from — it is really "the tone
          // everything decorative in Services shares".
          numeral: "#9CB0A8",
        },

        // --- Green overlays (Figma: "Overlay/*") — green 500 at alpha ---
        overlay: {
          "green-10": "rgba(64,119,96,0.1)",
          "green-20": "rgba(64,119,96,0.2)",
          /**
           * The contact form's two glass fills, both WHITE at low alpha rather than
           * a green tint.
           *
           * ⚠️ White, and this matters. A green-tinted fill over a green ground is
           * the same hue twice, so it darkens or lightens without ever reading as a
           * separate material — it looks like a patch of the background, which is
           * exactly what the Figma opacity version does. White at low alpha lifts
           * the value AND desaturates slightly, which is what glass actually does
           * to what is behind it.
           *
           * `glass-panel` is barely there on purpose: the panel's separation comes
           * mostly from its hairline and the glow behind it, not from its fill.
           */
          "glass-panel": "rgba(255,255,255,0.05)",
          /**
           * The Services card, 13 Aug. Denser than `glass-panel` (8% against 5%)
           * because it has something to hide: the wheel turns directly behind these
           * cards, and at 5% its diamonds read straight through as shapes.
           *
           * ⚠️ A SEPARATE TOKEN RATHER THAN RAISING `glass-panel`. That one is the
           * contact form's panel, whose edge contrast was measured against it and is
           * already a knowing trade — moving it to fix a Services problem would
           * quietly re-open a form decision two sections away.
           *
           * ⚠️ **THIS FILL IS WHAT MAKES THE FROST CONSTANT, NOT THE BLUR.** A
           * `backdrop-filter` only shows where there is texture behind it, so with
           * the blur doing the work the cards looked frosted where the wheel passed
           * and plain everywhere else — the effect came and went as you scrolled.
           * The fill is present regardless of what is behind it, so it carries the
           * look; the blur is the smaller half of the pair. It went 0.08 → 0.10 → 0.07
           * on 13 Aug: up when the blur came down, then back once the neighbouring
           * cards stopped being faded to near-nothing and the frost started reading
           * on all three at once.
           */
          "glass-card": "rgba(255,255,255,0.07)",
          "glass-field": "rgba(255,255,255,0.04)",
        },

        // --- Interactive / validation (NOT in Figma — introduced) ---
        focus: "#315C4A", // focus-ring accent (= green 600)
        error: {
          DEFAULT: "#E5484D",
          tint: "rgba(229,72,77,0.12)",
        },
      },

      /**
       * Figma paint style "Gradient" — green 900 -> green 950.
       * gradientTransform is a 90° rotation, i.e. top -> bottom.
       */
      backgroundImage: {
        "gradient-green": "linear-gradient(180deg, #142920 0%, #0C1813 100%)",
        /**
         * The LIFTED ramp: `green-700` → `green-950` (13 Aug).
         *
         * ⚠️ Named for the RAMP, not for a state. It is deliberately not
         * `-hover`, because it is used in two different ones:
         *   · TierCard — the rollover, cross-faded over `gradient-green`
         *   · StepCard — the Process circle's RESTING fill
         * A token named after a state that turns up as a resting fill somewhere
         * else is exactly the kind of thing that misleads six months later.
         *
         * Against the base ramp it starts two steps lighter (900 → 700) and holds
         * the same 950 at the bottom, so it is both brighter overall and steeper
         * down its length. On the TierCard that makes the card genuinely lift under
         * the cursor; on a 120px circle it gives the sphere enough falloff to read
         * as round rather than as a flat dark disc.
         *
         * ⚠️ Two gradients cannot interpolate, so the TierCard fades a second
         * LAYER in over the first — never a `background-image` swap, which hard-cuts.
         */
        "gradient-green-lift": "linear-gradient(180deg, #264A3B 0%, #0C1813 100%)",
        /**
         * The Services panel's ground (13 Aug).
         *
         * ⚠️ IT IS NOW THE **DARK** RAMP — green-900 → green-950, the same values as
         * `gradient-green` (the TierCard's resting fill). It began as an alias of
         * `gradient-green-lift` (green-700 top) and was swapped the same day.
         *
         * ⚠️ It stays a SEPARATE TOKEN rather than becoming `bg-gradient-green` at
         * the call site, and that is the point of it: this is the one place the two
         * are allowed to diverge. The section's ground and a pricing card's fill
         * have no reason to move together, and naming it for its place means changing
         * one will never silently change the other.
         */
        "gradient-services": "linear-gradient(180deg, #142920 0%, #0C1813 100%)",

        /**
         * ⚠️ SUPERSEDED, kept deliberately. The base ramp inverted — the TierCard's
         * rollover until 13 Aug. Nothing uses it now; it stays only because the
         * "invert the ramp" idea is an obvious thing to reach for again and this
         * records that it was tried. Delete it if the new rollover survives review.
         */
        "gradient-green-flip": "linear-gradient(180deg, #0C1813 0%, #142920 100%)",
        // Scrims over card imagery — keep tag + copy legible once the image is
        // full-bleed on hover. `-x` is for the featured card's side copy column.
        "scrim-green": "linear-gradient(180deg, rgba(12,24,19,0) 45%, rgba(12,24,19,0.92) 100%)",

        /**
         * BANNER — exported from the frame, and deliberately NOT the green scrim
         * the other cards use. Figma ramps `#141414` (ink) from 0 at 29.9% to 0.8
         * at the bottom. A neutral scrim leaves the photography's own colour
         * intact where the green one tints it, which matters on a full-bleed
         * image that IS the section rather than a band inside a card.
         */
        "scrim-banner": "linear-gradient(180deg, rgba(20,20,20,0) 30%, rgba(20,20,20,0.8) 100%)",
        /**
         * Diagonal scrim anchored at the BOTTOM-RIGHT corner, for the featured card
         * — that is where its copy and stats come to rest. 315deg points the ramp at
         * the top-left, so 0% sits in the bottom-right corner and it clears the
         * image diagonally. Densest exactly under the copy; the top-left of the
         * photograph stays untouched.
         */
        /**
         * ⚠️ CURRENTLY UNUSED. The featured card wore this while its copy travelled
         * to the bottom-right on hover; the copy now holds the top, so it uses
         * `scrim-green-right` instead. Kept only because that decision has flipped
         * twice — if the travel ever returns, this is its scrim.
         */
        "scrim-green-corner":
          "linear-gradient(315deg, rgba(12,24,19,0.88) 0%, rgba(12,24,19,0.55) 35%, rgba(12,24,19,0) 70%)",

        /**
         * Featured card, from the RIGHT. Its copy sits top-right and stays there,
         * so the scrim has to cover a full-height column rather than a corner —
         * a corner ramp leaves the top of the copy on bare image.
         *
         * ⚠️ Scaled back from `0.92 → 0.75 → 0` to `0.8 → 0.55 → 0`, and it now
         * clears by 62% rather than 78%. The image frost carries a good deal of
         * the legibility work on rollover, so the scrim no longer has to do it
         * alone — at the old values the two stacked and the photograph disappeared.
         */
        "scrim-green-right":
          "linear-gradient(270deg, rgba(12,24,19,0.8) 0%, rgba(12,24,19,0.55) 40%, rgba(12,24,19,0) 62%)",

        /**
         * HERO — the scrim over the background video. Faithful to Figma's
         * `HERO Container` (36:35) fill in shape: solid `green-950` at every
         * edge, opening in the middle so the footage shows there and nowhere else.
         *
         * ⚠️ `farthest-side` is load-bearing, not a detail. CSS defaults radial
         * gradients to `farthest-corner`, which sizes the ellipse to reach the
         * CORNERS — so the mid-edges, including the whole bottom edge, stop short
         * of the last stop and never become solid. That is what left the video
         * visible along the edges and put a seam above the curve. `farthest-side`
         * puts the last stop exactly on all four edges; the corners overshoot and
         * clamp to solid, which is what you want.
         *
         * It also happens to be what Figma means: the gradient transform on
         * `HERO Container` (36:35) resolves to 50%/50% radii, i.e. farthest-side.
         *
         * `#0C1813` at **60%** in the centre → **95%** at the edges, the centre
         * value holding to 7.7% before the ramp starts.
         *
         * ⚠️ Figma's centre is 80. 60 is a deliberate departure: the frame's
         * gradient sits over raw footage, whereas here the video has already been
         * colour-burned into `green-900` and arrives dark, so the same 80 stacked
         * on top of that buried it. Settled at 60 after 85 / 82 / 80 / 50 — the
         * centre value is the hero's main exposure control, and it is sensitive
         * because it compounds with the burn rather than replacing it.
         *
         * ⚠️ This STACKS with the colour burn, it does not replace it. The video
         * is already burned into `green-900` before this layer touches it, so 85%
         * in the middle leaves only a trace of the footage showing. If the video
         * needs to read more, the centre value here is the lever — not the blend.
         *
         * ⚠️ The edge is 95%, NOT 100%, deliberately: it keeps a little footage
         * alive at the edges. `scrim-hero-foot` then takes the bottom band to a
         * true 100%, because the curve below is solid and a 5% mismatch against a
         * solid shape reads as a hard line.
         *
         * ⚠️ The edge stop stays `green-950`, not `green-900`, even though the
         * base behind the video is 900. That is what matches the curve below,
         * which is filled `green-950` — the two have to agree or there is a seam.
         */
        "scrim-hero":
          "radial-gradient(ellipse farthest-side at 50% 50%, rgba(12,24,19,0.6) 7.7%, rgba(12,24,19,0.95) 100%)",

        /**
         * HERO — the foot. A vertical ramp to SOLID `green-950` across the bottom
         * band of the section.
         *
         * ⚠️ It exists because `scrim-hero` now ends at 95%, not 100%. That 5% is
         * deliberate — it keeps a trace of the footage alive at the edges — but it
         * also means the bottom edge no longer reaches the exact colour of the
         * curve below, and a 5% mismatch against a solid shape reads as a hard
         * line. This takes the last stretch to a true 100% so the two meet
         * invisibly.
         */
        "scrim-hero-foot":
          "linear-gradient(180deg, rgba(12,24,19,0) 0%, rgba(12,24,19,1) 100%)",

        /**
         * HERO — `Ellipse 4` (36:36), the 1100×1100 pool of dark behind the arch.
         * It is what makes the cards' 5px white borders read against busy footage.
         *
         * Removed on 12 Aug while the video treatment was being worked out, then
         * restored once the colour burn settled — which is why the token stayed.
         */
        /**
         * SERVICES — `Ellipse 4` (36:215), a green wash bleeding off the LEFT edge
         * behind the numerals.
         *
         * ⚠️ CURRENTLY UNUSED — the wash is not rendered (removed 12 Aug: it did
         * not read on the page, even raised from Figma's 60% to 85%). Kept because
         * restoring it is one span; see the note in `sections/Services.tsx`.
         *
         * Deliberately not `border-divider` (#CED6D0): near-identical, but this is
         * a soft light source and that is a hairline rule. Tying them together
         * would couple two decisions that have no reason to move as one.
         */
        "glow-services":
          "radial-gradient(circle closest-side, rgba(203,211,206,0.85) 0%, rgba(203,211,206,0) 100%)",

        /**
         * ⚠️ The solid core runs to 45% before the fade starts. Figma's stops are
         * a straight `alpha 1 → 0`, which over the colour-burned video was barely
         * perceptible — a dark wash fading immediately from its own centre, on
         * footage that is already dark. Holding it opaque for the first 45% gives
         * it an actual body for the arch to sit against.
         */
        "glow-hero":
          "radial-gradient(circle closest-side, rgba(12,24,19,1) 0%, rgba(12,24,19,1) 45%, rgba(12,24,19,0) 100%)",

        /**
         * Fades the mobile Services carousel out at its right edge, so the next
         * card is visibly there but visibly incomplete — the cue that says "swipe"
         * without a label saying it.
         *
         * ⚠️ Hard-codes `neutral-100` (#F7F6F4) because a gradient cannot reference
         * a colour token, and `transparent` at the near stop is NOT interchangeable
         * with `rgba(...,0)`: Safari interpolates `transparent` through black, which
         * puts a grey bruise in the middle of the ramp. Same value, stated twice.
         *
         * ⚠️ It is tied to the PAGE background. If Services ever sits on a different
         * surface, this has to change with it.
         */
        /**
         * ⚠️ SIX STOPS ON AN EASED CURVE, not three on a linear one (13 Aug, Jimmy:
         * "it's very harsh"). It was `0% → 0.9 at 60% → 1`, which is the shape of the
         * problem: a straight ramp that is nine-tenths opaque before it is two-thirds
         * of the way across puts almost all of its change in the first half of the
         * band, so the near edge lands on the card as a visible line rather than as
         * haze. A gradient reads as harsh when its DERIVATIVE is largest where you can
         * still see what is behind it.
         *
         * These stops approximate a smoothstep: barely there for the first quarter,
         * steepest in the middle where there is already enough cover to hide it, then
         * easing into solid. Same two colours, same 0 → 1 range; only the distribution
         * changed.
         *
         * ⚠️ Paired with the band's WIDTH at the call site (`w-1/4`, up from `w-1/6`).
         * The curve and the distance it runs over are one decision — softening the
         * stops inside a narrow band just moves the hard edge.
         */
        "fade-right":
          "linear-gradient(90deg, rgba(247,246,244,0) 0%, rgba(247,246,244,0.06) 24%, rgba(247,246,244,0.24) 44%, rgba(247,246,244,0.56) 64%, rgba(247,246,244,0.86) 84%, rgba(247,246,244,1) 100%)",

        /**
         * The pool of light behind the contact form panel.
         *
         * ⚠️ THIS IS WHAT MAKES THE FROST WORK. `backdrop-filter: blur()` blurs
         * what is BEHIND an element, and the footer behind this panel is a flat
         * `gradient-green` — blurring a flat gradient returns the same flat
         * gradient, so a frost over it is literally invisible. The Figma version
         * reads as glass because of its opacity, not its blur.
         *
         * This gives the blur something to bite on: a soft `green-700` pool,
         * off-centre behind the panel, which the frost then smears. Remove it and
         * the panel silently degrades to a plain translucent fill (13 Aug).
         *
         * `farthest-side`, not `closest-side` — the panel is a wide rectangle and
         * the pool has to reach past its corners, or the frost varies visibly
         * across the width and reads as a stain rather than as light.
         */
        "glow-form":
          "radial-gradient(ellipse farthest-side, rgba(38,74,59,0.9) 0%, rgba(38,74,59,0.35) 55%, rgba(38,74,59,0) 100%)",
      },

      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"], // primary
        mono: ["Geist Mono", "ui-monospace", "monospace"], // eyebrows only
        /**
         * ⚠️ ADELLE (Adobe Typekit kit `nzb3tlw`), italic 400 — replaced Libre
         * Baskerville on 13 Aug. `adelle` is the family name Adobe's CSS declares;
         * it is lowercase and unquoted here on purpose, which is how Typekit names
         * it. Get it wrong and everything silently falls back to Georgia.
         *
         * ⚠️ It is a NETWORK dependency (see `app/layout.tsx`). Georgia is the
         * fallback and it is a serif with very different proportions — if the
         * accents ever look wrong rather than merely different, check the kit
         * loaded before checking the CSS.
         *
         * ⚠️ THE WEIGHT IS 400, AND IT IS SET ON THE ACCENT SIZE TOKENS BELOW
         * (`h1-accent`, `h2-accent`, `numeral`) — not here. Adelle Semibold Italic
         * (600) was trialled on 13 Aug and reverted: at 60–200px the heavier face
         * held its own against Manrope rather than reading as a quieter aside,
         * which is the accent's job. Flipping back is those three tokens and the
         * `font-normal` on `Nav`'s menu numerals — nothing else.
         */
        serif: ["adelle", "Georgia", "serif"], // italic accent words
        /**
         * ⚠️ `serif-condensed` (adelle-condensed) WAS HERE AND IS GONE (13 Aug audit).
         * It was added for the Services reel's oversized numerals, which no longer
         * exist — and it could not have been used correctly anyway: kit `nzb3tlw`
         * ships adelle-condensed in italic 600/700 only, while the design uses italic
         * 400 throughout. A token that can only ever render the wrong weight is worse
         * than no token.
         */
      },

      /**
       * TYPE — exported from the 20 Figma text styles, expressed as named
       * fluid tokens. [ size, { lineHeight, letterSpacing, fontWeight } ]
       * Max = the Figma desktop figure; clamp scales down to the mobile min.
       * Mins are PROPOSED (no mobile design yet) — flagged in DESIGN_TOKENS.md.
       *
       * Figma "Label/Button" -> `label`; "Label/Eyebrow" -> `eyebrow`;
       * "Label/Tag" -> `tag`; "Stat/*" -> `stat-*`.
       */
      fontSize: {
        // Display/* — the oversized service numeral. Libre Baskerville Italic.
        // The "next" numeral in the timeline is THIS token at `scale-75`
        // (150/200) rather than a second token: the column animates
        // continuously between the two sizes, so the smaller one is a
        // transform, not a type size. % letter-spacing is what keeps that exact.
        /** ⚠️ Weight 400 — Adelle **Regular** Italic. Paired with `font-serif` in
         *  `ServiceNumerals`; see the note there for why condensed could not be used. */
        numeral: ["clamp(100px, 64.8px + 9.39vw, 200px)", { lineHeight: "1", letterSpacing: "-0.01em", fontWeight: "400" }],
        /**
         * The numeral inside StatChart's stat disc. ⚠️ NOT from Figma and not
         * part of the exported ramp — Jimmy's call (12 Aug), for one use.
         *
         * It sits between `h4` (32) and `stat-display` (60) because the disc is
         * 128px: bigger than h4 to carry the disc, smaller than stat-display so
         * the numeral and its label are not touching. Weight 700 against
         * `stat-display`'s 600 — the disc is small, so it needs the extra weight
         * to hold its own against the bars behind it.
         *
         * `lineHeight: 1` because it is a single line centred in a circle; the
         * usual 1.2 adds leading that pushes it visually off-centre.
         */
        /**
         * ⚠️ **NAME COLLISION, AND IT IS DELIBERATE BUT DANGEROUS.** There is also a
         * `stat-badge` in `width`/`height` — the disc this type sits inside. They are
         * different scales with the same key, so `text-stat-badge` and `w-stat-badge`
         * look like a matched pair and are not: **changing one does not change the
         * other, and on 13 Aug that was exactly the point** (the disc grew to give this
         * type room; the type stayed put). Read the key's namespace before editing.
         */
        "stat-badge": ["clamp(28px, 23.8px + 1.13vw, 40px)", { lineHeight: "1", letterSpacing: "-0.03em", fontWeight: "700" }],
        // Heading/*
        /**
         * ⚠️ MAX RAISED 80 → 84 ON 13 AUG. THE MIN DELIBERATELY DID NOT MOVE.
         *
         * Both ends were bumped proportionally at first and then reverted to this,
         * for two reasons that both live at the 375 end:
         *   · the mobile Hero was tuned by hand — minimum two words per line, the
         *     sub-copy at 80%, the arch nudged three times — and all of that was
         *     measured against a 40px h1. Growing the min re-breaks those lines.
         *   · `text-h1` is ALSO the mobile menu's link size (see `Nav`), which only
         *     ever renders at the small end. Bumping the min grows the nav for a
         *     change that was about the desktop Hero.
         * So the curve is steeper (4.13vw, was 3.76) and the phone is untouched.
         * (88 was tried first and came back down to 84.)
         *
         * `h1` and `h1-accent` are IDENTICAL IN SIZE and must stay that way — they
         * differ only in tracking. Adelle needs no optical nudge here; that is a
         * `h2-accent`-only compensation (see the note there).
         */
        h1: ["clamp(40px, 24.5px + 4.13vw, 84px)", { lineHeight: "1.2", letterSpacing: "-0.03em", fontWeight: "400" }],
        "h1-accent": ["clamp(40px, 24.5px + 4.13vw, 84px)", { lineHeight: "1.2", letterSpacing: "-0.04em", fontWeight: "400" }],
        h2: ["clamp(34px, 24.9px + 2.44vw, 60px)", { lineHeight: "1.2", letterSpacing: "-0.03em", fontWeight: "400" }],
        /**
         * ⚠️ 2px LARGER THAN `h2` AT BOTH ENDS (36/62 vs 34/60), on purpose — do not
         * "fix" the mismatch. Adelle's italic sits on a smaller optical size than
         * Manrope: at an identical 60px the accent visibly read as the smaller of
         * the two, so it is nudged up until the two faces sit on the same line.
         * `h1-accent` needs no such nudge — verified against the Hero at 80px,
         * where it already matched.
         */
        "h2-accent": ["clamp(36px, 26.8px + 2.44vw, 62px)", { lineHeight: "1.2", letterSpacing: "-0.05em", fontWeight: "400" }],
        /**
         * The Services card title — a **40px** maximum, between `h2` (60) and `h3` (35).
         *
         * ⚠️ A NEW STEP ON THE SCALE, not a one-off. It exists because the card title
         * went h2 → h3 → h2 → 50 → 45 → 40 across 13 Aug: 60 crowded the box, 35 read as a
         * card label rather than a heading, and neither neighbour was right. Fluid on
         * the same 375 → 1440 range as the rest.
         *
         * ⚠️ It takes `h2`'s FACE — Regular 400, line-height 1.2, tracking -0.03em —
         * not `h3`'s Medium 500 at 1.1. It is a smaller h2, not a larger h3, which is
         * what keeps it reading as a heading.
         *
         * ⚠️ `QuizPanel`'s card-state heading uses this too, and steps to `text-h2`
         * when it expands. The two are meant to be the same type; change one and
         * change the other.
         */
        "service-title": ["clamp(28px, 23.8px + 1.13vw, 40px)", { lineHeight: "1.2", letterSpacing: "-0.03em", fontWeight: "400" }],
        h3: ["clamp(26px, 22.8px + 0.85vw, 35px)", { lineHeight: "1.1", letterSpacing: "-0.01em", fontWeight: "500" }],
        h4: ["clamp(24px, 21.2px + 0.75vw, 32px)", { lineHeight: "1.2", letterSpacing: "-0.04em", fontWeight: "400" }],
        h5: ["clamp(22px, 20.6px + 0.38vw, 26px)", { lineHeight: "1.2", letterSpacing: "-0.05em", fontWeight: "500" }],
        // Stat/*
        "stat-display": ["clamp(34px, 24.9px + 2.44vw, 60px)", { lineHeight: "1.2", letterSpacing: "-0.06em", fontWeight: "600" }],
        "stat-value": ["clamp(22px, 20.6px + 0.38vw, 26px)", { lineHeight: "1.4", letterSpacing: "-0.01em", fontWeight: "700" }],
        "stat-symbol": ["clamp(20px, 18.6px + 0.38vw, 24px)", { lineHeight: "1.4", letterSpacing: "-0.01em", fontWeight: "700" }],
        // Body/*
        "body-lg": ["clamp(16px, 15.3px + 0.19vw, 18px)", { lineHeight: "1.5", letterSpacing: "-0.01em", fontWeight: "400" }],
        "body-lg-strong": ["clamp(16px, 15.3px + 0.19vw, 18px)", { lineHeight: "1.5", letterSpacing: "-0.01em", fontWeight: "700" }],
        body: ["16px", { lineHeight: "1.5", letterSpacing: "-0.01em", fontWeight: "400" }],
        "body-strong": ["16px", { lineHeight: "1.5", letterSpacing: "-0.01em", fontWeight: "700" }],
        "list-item": ["16px", { lineHeight: "1.4", letterSpacing: "-0.01em", fontWeight: "400" }],
        "list-item-strong": ["16px", { lineHeight: "1.4", letterSpacing: "-0.01em", fontWeight: "700" }],
        "body-sm": ["14px", { lineHeight: "1.4", letterSpacing: "-0.01em", fontWeight: "400" }],
        "body-sm-strong": ["14px", { lineHeight: "1.4", letterSpacing: "-0.01em", fontWeight: "700" }],
        // Label/*
        eyebrow: ["13px", { lineHeight: "1", letterSpacing: "0.1em", fontWeight: "500" }],
        label: ["14px", { lineHeight: "1", letterSpacing: "0.06em", fontWeight: "600" }],
        tag: ["14px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "500" }],
      },

      /**
       * SPACING — exported from the Figma Spacing collection.
       * Component ramp is fixed px; structural tokens are fluid.
       * Drift absorbed: 8.1/9 -> sm, 16.01 -> base, 25 -> xl. See DESIGN_TOKENS.md.
       */
      spacing: {
        xxs: "2px", // the hair gap between a price figure and its $ / + symbols
        xs: "4px",
        sm: "8px", // absorbs 8.1 (icon internals), 9 (price symbol)
        md: "12px",
        base: "16px", // absorbs 16.01 (CTA link gap)
        lg: "20px",
        xl: "24px", // absorbs 25 (logo container)
        "2xl": "28px",
        "3xl": "32px",
        "4xl": "40px",
        "5xl": "48px",
        "6xl": "60px", // nav link gap
        /** Next step on the ramp (60 → 120). */
        "7xl": "120px",
        /**
         * The Testimonials foot — the gap the footer slides across on its way up.
         * A FIXED 150 rather than the fluid `section-y-flush`, which only reaches
         * 120 at 1440 and gives less everywhere below it; this needs its full depth
         * at every width or the footer starts covering the last row of cards on
         * smaller screens.
         */
        "testimonials-foot": "150px",
        /**
         * Extra right inset on the Services reel, on top of the section's own
         * `section-x-flush`. Its own token rather than a ramp step because it is
         * one composition's breathing room, not a rhythm anything else shares —
         * and it is fluid so it scales down instead of taking a fixed 100px out of
         * a phone.
         */
        "services-inset": "clamp(40px, 18.9px + 5.63vw, 100px)",
        /**
         * The LEADING half of the same inset — 70 at desktop against the trailing
         * 100, so the numerals-and-copy pair sits ~30px left of centre.
         *
         * ⚠️ THESE TWO ARE A PAIR AND THE DIFFERENCE BETWEEN THEM IS THE WHOLE POINT.
         * The row was symmetrical (`px-services-inset`) until 13 Aug; splitting it is
         * what nudges the composition left. Change one without the other and the
         * shift silently becomes something else — if they are ever made equal again
         * the pair re-centres, which is a design change, not a tidy-up.
         */
        "services-inset-left": "clamp(28px, 13.2px + 3.94vw, 70px)",

        // --- structural (fluid) ---
        // Containered sections: inside the gutter.
        "section-x": "clamp(20px, 9.4px + 2.83vw, 50px)",
        "section-y": "clamp(56px, 40.5px + 4.13vw, 100px)",
        // Flush sections: full-bleed, no gutter (Hero). Same optical 60px line.
        "section-x-flush": "clamp(20px, 5.9px + 3.76vw, 60px)",
        "section-y-flush": "clamp(64px, 44.3px + 5.26vw, 120px)",

        block: "clamp(48px, 36.7px + 3.01vw, 80px)", // gap between blocks in a section
        col: "clamp(40px, 32.9px + 1.88vw, 60px)", // gap between columns
        gutter: "var(--space-gutter)", // 10px desktop / 5px mobile — globals.css
        /**
         * Process: how far the 2nd and 4th step columns drop below the 1st and 3rd.
         * Figma sets it as a padding-top of 100 against 24 — the difference is 76.
         * Fixed px, because the connector geometry is derived from it and both must
         * agree exactly (see `sections/Process.tsx`).
         */
        "step-stagger": "76px",
      },

      /**
       * Carousel item widths that account for the GAP between them.
       *
       * ⚠️ A plain `basis-1/4` does not fit four across. Percentage basis resolves
       * against the container's content box, so four at 25% is already 100% before
       * a single `gap-xl` is added — the fourth card is then pushed a full three
       * gaps past the right edge. Each item has to give back its share of the gaps:
       * `(n − 1) × 24 ÷ n`.
       *
       * With these, four cards land exactly on the section's optical line at both
       * ends and the fifth is cut off by the viewport, which is the cue that the
       * strip continues.
       */
      flexBasis: {
        "card-2": "calc(50% - 12px)",
        "card-3": "calc(33.3333% - 16px)",
        "card-4": "calc(25% - 18px)",
        /**
         * The quiz's media column: Figma's 470 against the 1320 card = 35.61%.
         *
         * A PERCENTAGE, not a fixed 470px, because CLAUDE.md §1 allows fixed px
         * only for genuinely fixed things and this is a column. It is also not
         * `1/3` — the 1.6 points of difference is ~21px at 1440, which is visible
         * against a 5px inset.
         */
        "quiz-media": "35.61%",
      },

      // Body-copy measure cap (65–75ch rule). Use max-w-measure on paragraphs.
      maxWidth: {
        measure: "68ch",
        "measure-wide": "75ch",
        display: "60rem", // caps large display headings so they wrap centred
      },

      /**
       * RADIUS — exported from the Figma Radius collection.
       * Drift absorbed: 9 -> md, 15 -> lg, 45 -> 4xl, 50/100/1000 -> full.
       */
      borderRadius: {
        xs: "4px",
        sm: "6px", // form inputs
        md: "8px", // image overlays (absorbs 9)
        lg: "16px", // nav bar, chart card (absorbs 15)
        xl: "20px", // eyebrow pills
        "2xl": "24px",
        "3xl": "30px", // sections + cards
        "4xl": "48px", // (absorbs 45)
        full: "9999px", // pills, circles (absorbs 50, 100, 1000)
      },

      // Figma draws the hero arch cards with a 5px INSIDE stroke, not padding.
      borderWidth: {
        /**
         * ⚠️ `rule: "4px"` WAS HERE AND WAS REMOVED (13 Aug audit). It was the thick
         * green rule beside the Services card sub-copy, and it is dead because that
         * rule is no longer a BORDER: `ServicePanel` draws it as a flex sibling sized
         * with `w-xs`, which is what let it sit at a fixed height beside copy of any
         * length. Nothing else on the site has a non-hairline border.
         */
        card: "5px",
      },

      minHeight: {
        tap: "44px", // WCAG target
        "field-lg": "184px", // textarea
        /**
         * A quiz option row. Comfortably over the 44px tap floor, and sized so a
         * one-line option and a two-line one differ in height but not in weight.
         */
        option: "68px",
      },

      /**
         * Tactile press on option cards. Tailwind ships 95 and 100 with nothing
         * between; 95 on a 700px-wide row is a lurch, not a press. 0.985 is the
         * amount you feel rather than see.
         */
      scale: {
        press: "0.985",
      },

      // Fixed component sizes — genuinely fixed things, per CLAUDE.md §1.
      width: {
        icon: "24px",
        "icon-sm": "16px",
        /** The contact popup's close glyph — Figma's control is a 48px target. */
        "icon-lg": "32px",
        /**
         * The Quiz's back arrow, and **a bracketed value rather than a scale step**.
         *
         * **36 — SETTLED (Jimmy, 13 Aug).**
         *
         * The run: 32 (too quiet) → 40 (too big) → 36 (too big) → 32 (too small) → 34
         * (too big) → 33 (bracketed to 1px) → **back to 36**.
         *
         * ⚠️ THE SEVEN PASSES ARE THE POINT, and the lesson is not about this glyph.
         * 36 was rejected on pass three and chosen on pass seven with nothing about the
         * icon changed in between — what changed was everything AROUND it: the bare
         * circle became a filled `neutral-100` disc, and the control moved from the
         * panel corner onto the question's own line. **A glyph size is not judgeable in
         * isolation; it is judged against its container and its neighbours, and those
         * were still moving.** Bracketing by eye converged on 1px precisely because it
         * was measuring the wrong thing.
         *
         * The practical rule: settle a control's SURFACE and POSITION first, then size
         * the glyph once. Doing it the other way costs six passes and lands back where
         * it started.
         *
         * ⚠️ **IF THIS NEEDS TO MOVE AGAIN, MOVE THE DISC INSTEAD.** The glyph has been
         * bracketed to within 2px; what has not been tried is a larger circle at the
         * same 0.64 ratio the popup close uses. The disc is pinned at 50 only because
         * that keeps it level with the question heading's ~48px line box, and that
         * alignment is worth less than a control that reads correctly.
         *
         * ⚠️ The other untried lever is STROKE WEIGHT. `Arrow` is `strokeWidth="2"` on a
         * 24 viewBox, so at 34px it renders at ~2.8 device px — for a thin-stroked glyph
         * "bigger" often means "heavier", and weight can be changed without touching the
         * geometry that the disc alignment depends on.
         */
        "icon-xl": "35px",
        cta: "36px",
        contact: "50px",
        avatar: "46px", // testimonial client photo
        "step-icon": "120px", // Process step circle
        "quote-mark": "53px", // decorative testimonial quote glyph
        "step-glyph": "48px", // the icon inside the Process circle
        "service-glyph": "72px", // ⚠️ 100 → 64 → 80 → 72 on 13 Aug
        /**
         * The oversized Otix mark behind the Services reel. Deliberately LARGER than
         * the space it sits in — it is cropped by the section's right edge, which is
         * what stops it reading as a logo and lets it read as texture.
         *
         * ⚠️ CROPPED SIDEWAYS ONLY. The `min(…, 86vh)` is what enforces that: the reel
         * lives in a `h-screen overflow-hidden` sticky box, so at 960px the mark was
         * taller than a laptop viewport and lost its top and bottom as well — a flat
         * edge across a circular form, which reads as a rendering fault rather than as
         * a crop. The right-edge crop is intentional and continues off the page; a
         * horizontal slice through the top does not continue anywhere.
         *
         * ⚠️ `min()` of a `clamp()`, and it must be sized in ONE value used for both
         * width and height — the mark is square, so capping only the height would
         * squash it. 86vh rather than 100vh leaves the mark clear of the top and bottom
         * edges so it reads as sitting behind the section, not wedged into it.
         */
        watermark: "min(clamp(560px, 419.3px + 37.56vw, 960px), 86vh)",
        /**
         * The oversized Otix mark behind the Services reel. Deliberately LARGER than
         * the space it sits in — it is cropped by the section's right edge, which is
         * what stops it reading as a logo and lets it read as texture.
         */
        // The same glyph on a phone. 100 is a desktop size — in a carousel card it
        // took a quarter of the width from the heading beside it. It went 100 → 72
        // → 48: once the icon moved to the START of the title it is read as a mark
        // BEFORE the words, not as a second object balancing them, and at 72 it
        // still outweighed the line it was introducing.
        "service-glyph-sm": "48px",
        field: "50px", // form input height
        /**
         * Hero glow diameter as a proportion of the section — Figma's `Ellipse 4`
         * is 1100 in a 1440 frame. A PERCENTAGE, not px, so the pool keeps its
         * relationship to the arch at any width (CLAUDE.md §0).
         */
        "arch-glow": "76.39%",
        /**
         * The featured card's image at full width — the card MINUS its 4px inset
         * on both sides (`p-xs` ×2).
         *
         * ⚠️ Not `w-full`. An absolutely-positioned child resolves percentages
         * against the PADDING box, so `w-full` plus `left-xs` put the image 4px
         * past the right edge, where `overflow-hidden` clipped it — and the card's
         * white frame vanished on that side only. Every other variant grows in
         * height and never hit this.
         */
        "card-inner": "calc(100% - 8px)",
        /** Pairs with the same key in `height` — the peak dots must stay circular. */
        "chart-dot": "12px",
        /** Pairs with the same key in `height` — the stat disc must stay round. */
        /**
         * ⚠️ **96 → 108 min, 128 → 144 max (13 Aug).** The box was ALREADY a perfect
         * square (measured: 128 × 128, `border-radius: 9999px`), so this is not a
         * geometry fix — it is an OPTICAL one. The disc holds "60%+" over "growth", and
         * that content ran close to the horizontal diameter while leaving air above and
         * below, so a true circle read as an oval squeezed at the sides. Giving the
         * content more margin inside the same shape is what makes it look round.
         *
         * ⚠️ **The type is deliberately unchanged** (`text-stat-badge`, a SEPARATE token
         * that only shares the name). Growing both together would have preserved the
         * crowding at a larger size and fixed nothing.
         */
        "stat-badge": "clamp(108px, 95.3px + 3.38vw, 144px)",
        /** Pairs with the same key in `height` — the option's select dot. */
        radio: "22px",
        /**
         * The mobile carousel's step dots. The ACTIVE one is nearly double, which
         * is what makes the set read as a position rather than as decoration — at a
         * smaller difference the colour change was doing all the work and it was
         * hard to see which one you were on at a glance.
         */
        dot: "6px",
        "dot-active": "10px",
        /**
         * The Services spine's FILLED portion. 3px against the 1px track it rides
         * on — thick enough to take a round cap and read as a deliberate mark
         * rather than a hairline that happens to be green.
         */
        spine: "3px",
      },
      height: {
        icon: "24px",
        "icon-sm": "16px",
        /** The contact popup's close glyph — Figma's control is a 48px target. */
        "icon-lg": "32px",
        /**
         * The Quiz's back arrow, and **a bracketed value rather than a scale step**.
         *
         * **36 — SETTLED (Jimmy, 13 Aug).**
         *
         * The run: 32 (too quiet) → 40 (too big) → 36 (too big) → 32 (too small) → 34
         * (too big) → 33 (bracketed to 1px) → **back to 36**.
         *
         * ⚠️ THE SEVEN PASSES ARE THE POINT, and the lesson is not about this glyph.
         * 36 was rejected on pass three and chosen on pass seven with nothing about the
         * icon changed in between — what changed was everything AROUND it: the bare
         * circle became a filled `neutral-100` disc, and the control moved from the
         * panel corner onto the question's own line. **A glyph size is not judgeable in
         * isolation; it is judged against its container and its neighbours, and those
         * were still moving.** Bracketing by eye converged on 1px precisely because it
         * was measuring the wrong thing.
         *
         * The practical rule: settle a control's SURFACE and POSITION first, then size
         * the glyph once. Doing it the other way costs six passes and lands back where
         * it started.
         *
         * ⚠️ **IF THIS NEEDS TO MOVE AGAIN, MOVE THE DISC INSTEAD.** The glyph has been
         * bracketed to within 2px; what has not been tried is a larger circle at the
         * same 0.64 ratio the popup close uses. The disc is pinned at 50 only because
         * that keeps it level with the question heading's ~48px line box, and that
         * alignment is worth less than a control that reads correctly.
         *
         * ⚠️ The other untried lever is STROKE WEIGHT. `Arrow` is `strokeWidth="2"` on a
         * 24 viewBox, so at 34px it renders at ~2.8 device px — for a thin-stroked glyph
         * "bigger" often means "heavier", and weight can be changed without touching the
         * geometry that the disc alignment depends on.
         */
        "icon-xl": "35px",
        cta: "36px",
        contact: "50px",
        avatar: "46px",
        "step-icon": "120px",
        "step-glyph": "48px",
        "service-glyph": "72px", // ⚠️ 100 → 64 → 80 → 72 on 13 Aug
        /**
         * The oversized Otix mark behind the Services reel. Deliberately LARGER than
         * the space it sits in — it is cropped by the section's right edge, which is
         * what stops it reading as a logo and lets it read as texture.
         *
         * ⚠️ CROPPED SIDEWAYS ONLY. The `min(…, 86vh)` is what enforces that: the reel
         * lives in a `h-screen overflow-hidden` sticky box, so at 960px the mark was
         * taller than a laptop viewport and lost its top and bottom as well — a flat
         * edge across a circular form, which reads as a rendering fault rather than as
         * a crop. The right-edge crop is intentional and continues off the page; a
         * horizontal slice through the top does not continue anywhere.
         *
         * ⚠️ `min()` of a `clamp()`, and it must be sized in ONE value used for both
         * width and height — the mark is square, so capping only the height would
         * squash it. 86vh rather than 100vh leaves the mark clear of the top and bottom
         * edges so it reads as sitting behind the section, not wedged into it.
         */
        watermark: "min(clamp(560px, 419.3px + 37.56vw, 960px), 86vh)",
        /** Pairs with the same key in `width` — the phone-sized service glyph. */
        "service-glyph-sm": "48px",
        field: "50px", // form input height
        /**
         * StatChart plot area. A DEFINITE height is required, not aspect-ratio:
         * the bars are percentage heights of this box, and a percentage of an
         * auto height resolves to nothing.
         */
        chart: "clamp(220px, 184.8px + 9.39vw, 320px)",
        /**
         * Testimonial card. FIXED, not fluid, and applied only at `xl` where the
         * four-up arch exists — the arch only reads if all four cards are the same
         * height, and "same" has to be a number, not the tallest quote.
         *
         * ⚠️ 304 is sized for the LONGEST quote at the NARROWEST four-up width
         * (~275px at xl), where 110 characters run to 4.2 lines of `body-lg`.
         * That is the floor, not a preference: the measured content is
         * 28 padding + ~40 quote mark + 20 gap + ~113 quote + 28 + 46 caption
         * + 28 — about 303.
         *
         * ⚠️ It moves with the card's INTERNAL spacing. It was 296 until the gap
         * under the quote mark went 12 → 20, which pushed the content to 303 and
         * would have overflowed. Change either and re-check the other.
         *
         * Quotes need a character cap of roughly 110 (see CMS_READINESS.md); a
         * longer one does not push the card taller, it overflows it.
         */
        testimonial: "304px",
        /** The dot that lands on each peak of StatChart's trend line. */
        "chart-dot": "12px",
        /**
         * One slot of the Services reel — also how far each panel travels.
         *
         * ⚠️ It must be comfortably TALLER than the tallest panel's copy, because
         * the column is masked at top and bottom: at 560 the clear band was only
         * ~250px against ~450px of copy, so a panel was partly faded even while
         * fully centred. Sized so the clear band (80% of this — see PANEL_MASK in
         * sections/Services.tsx) holds the copy with room to spare.
         *
         * The two numbers are a pair: shrinking this, or widening the mask's fade,
         * brings the problem straight back.
         */
        "service-panel": "clamp(480px, 409.6px + 18.78vw, 680px)",
        /** StatChart's stat disc. Same family as the Process `step-icon` circle.
            ⚠️ Must stay identical to the `width` entry — see the note there. */
        "stat-badge": "clamp(108px, 95.3px + 3.38vw, 144px)",
        /**
         * Card geometry. The card needs a DEFINITE height so the image band can
         * animate between two real lengths on rollover — a content-sized card
         * makes `h-media -> full` uninterpolatable.
         *   card       = the card itself            (Figma 569)
         *   media      = image band at rest         (Figma 270–300)
         *   media-full = image once grown = card − 2×`p-xs` (8px total)
         */
        /**
         * ⚠️ 530, not Figma's 569 (12 Aug, Jimmy's call). The frame's copy runs to
         * two lines per card; ours is one, which left ~50px of dead white under the
         * description on the 2-up cards. Shortening the card absorbs it rather than
         * inflating the image to hide it.
         *
         * ⚠️ `media-full` is this MINUS 8 — the card's `p-xs` inset top and bottom.
         * They are two halves of one number: change them together or the image
         * stops filling the card on hover. (It was minus 10 until 13 Aug, taken
         * from Figma's 5px inset rather than the 4px the build actually uses, which
         * left a 2px fatter border along the bottom of every rolled-over card.)
         */
        card: "clamp(400px, 354.2px + 12.21vw, 530px)",
        /**
         * The `equal` (2-up) card, 50 taller than the rest. It is the widest
         * stacked variant and carries the tallest image band, so at `h-card` the
         * copy was squeezed against the bottom padding.
         *
         * ⚠️ Three tokens move together for this variant — `card-wide`,
         * `media-wide` and `media-full-wide`. `media-full-wide` is `card-wide − 8`
         * (`p-xs` top and bottom); if they drift, the image stops filling the card
         * on hover.
         */
        "card-wide": "clamp(450px, 404.2px + 12.21vw, 580px)",
        /**
         * The banner is 50px taller than a card at every width — it is a wide
         * letterbox with copy across the bottom, not a card, and at `h-card` it
         * read as squashed. Same ramp, offset by 50.
         */
        banner: "clamp(520px, 456.6px + 16.9vw, 700px)",
        /**
         * Image band at rest. TWO tokens, because Figma uses two heights and one
         * token split the difference and matched neither: the `narrow` card's
         * band is 270 and the wider `equal` card's is 300. A single
         * `clamp(…, 300px)` reached 300 only at a 1553px viewport, so the equal
         * card sat ~10px short at 1440 and the narrow one ~20px over.
         *
         *   media       narrow  — 270 at 1440, against `card` (530)
         *   media-wide  equal   — 340 at 1440, against `card-wide` (580)
         *
         * ⚠️ `media-wide` also drives the SPACER that pushes the copy down, so
         * raising it moves the copy with it — which is why the card height had to
         * grow alongside. At 340 against 580 the `equal` variant has ~192px of
         * usable copy height against ~170 of content.
         */
        media: "clamp(180px, 148.3px + 8.45vw, 270px)",
        "media-wide": "clamp(220px, 177.7px + 11.27vw, 340px)",
        /**
         * Grown image = its card minus the inset, top and bottom.
         *
         * ⚠️ THE INSET IS 8, NOT 10 — fixed 13 Aug. These were derived from Figma's
         * 5px card inset (5 + 5 = 10), but the card is built with `p-xs`, and `xs`
         * is **4px**. So the grown image came up 2px short and every `narrow` and
         * `equal` card sat with a visibly fatter white border along the bottom than
         * the other three sides on rollover.
         *
         * The maths, at 1440 and at 375 — both ends of the ramp have to hold or the
         * gap reappears at some widths only:
         *   card       530 − 8 = 522   ·   400 − 8 = 392
         *   card-wide  580 − 8 = 572   ·   450 − 8 = 442
         *
         * The slope (`12.21vw`) is IDENTICAL to the card's on purpose; only the
         * intercept shifts by 8. That is what keeps the difference at exactly 8 at
         * every width rather than only at the two ends.
         *
         * ⚠️ If `p-xs` on `Card` ever changes, these four numbers change with it.
         * There is no way for the config to read the component, so this note is the
         * link.
         */
        "media-full": "clamp(392px, 346.2px + 12.21vw, 522px)",
        "media-full-wide": "clamp(442px, 396.2px + 12.21vw, 572px)",

        /**
         * ── The quiz panel ────────────────────────────────────────────────────
         * Figma `WORK` / WhyOtix (36:266): a 1320 × 650 card, image 470 × 640 at a
         * 5px inset, panel 840 × 640.
         *
         * ⚠️ The height is FIXED at `lg` and above, and that is the whole point.
         * Eight screens of differing content in an auto-height panel means the card
         * grows and shrinks under the cursor on every step — the single most
         * expensive-looking mistake a multi-step flow can make. One height, sized to
         * the tallest step (step 1: four options), and every screen sits inside it.
         *
         * ⚠️ It is NOT applied below `lg`. On a phone the layout stacks and the
         * content sets its own height; a fixed 560px there would either clip the
         * long steps or leave the short ones half empty.
         */
        quiz: "clamp(560px, 528.3px + 8.45vw, 650px)",
        /** The quiz media column = the card height minus the 5px inset, as `media-full`. */
        "quiz-media": "clamp(550px, 518.3px + 8.45vw, 640px)",
        /** The stacked media band on mobile, where the panel sits BELOW the image. */
        "quiz-media-sm": "clamp(220px, 177.7px + 11.27vw, 340px)",
        /** Pairs with the same key in `width` — the option's select dot. */
        radio: "22px",
        /** Pair with the same keys in `width` — the carousel's step dots. */
        dot: "6px",
        "dot-active": "10px",
        /**
         * The Services spine. ⚠️ Exactly HALF `service-panel` — same ramp, both
         * ends halved (480→240, 680→340). It reads as a marker beside the copy
         * rather than a rule running its full height, which at full length competed
         * with the numerals for the eye.
         * If `service-panel` moves, this halves with it.
         */
        spine: "clamp(240px, 204.8px + 9.39vw, 340px)",
        /** The stepper's filled track. 4px reads as a deliberate bar, 2px as a hairline. */
        stepper: "4px",
      },

      boxShadow: {
        /**
         * Figma effect style "Shadow Effect" — 4 stacked drop shadows.
         * The 4th layer (0 0 0 1) is a hairline ring, not a shadow.
         */
        elevated: [
          "0 40px 40px -24px rgba(0,0,0,0.08)",
          "0 4px 6px 0 rgba(0,0,0,0.04)",
          "0 1px 2px 0 rgba(0,0,0,0.08)",
          "0 0 0 1px rgba(0,0,0,0.04)",
        ].join(", "),
        // Figma effect style "Inset Sunken" — form inputs.
        sunken: "inset 0 1px 5px 0 rgba(0,0,0,0.08), inset 0 1px 0 0 rgba(0,0,0,0.04)",
        // Eyebrow-pill glow (green 600 @ 15%) — pairs with the glass treatment.
        glass: "0 0 10px 0 rgba(49,92,74,0.15)",
        /**
         * A form field on the dark glass panel. Two inset layers:
         *   1px white top highlight  — the lit edge where glass catches the light
         *   soft black from above    — the recess under it
         *
         * ⚠️ THE HIGHLIGHT IS WHAT SELLS IT, not the blur. This is why the fields
         * do not carry their own `backdrop-filter`: a blur inside the panel's blur
         * composites against the already-blurred parent, which reads as mud rather
         * than glass, and Safari has long-standing trouble with nested ones. Six
         * blurred surfaces recompositing on every keystroke is also not free.
         *
         * ⚠️ REPLACES `shadow-sunken` on dark. That is an inset BLACK shadow built
         * for white inputs; over a translucent dark field it only adds murk.
         */
        "glass-field":
          "inset 0 1px 0 0 rgba(255,255,255,0.10), inset 0 2px 6px 0 rgba(0,0,0,0.18)",
        // Focus: visible ring (a11y). Must not depend on hover animation.
        focus: "0 0 0 3px rgba(49,92,74,0.25), 0 0 16px 0 rgba(49,92,74,0.2)",
        "focus-error": "0 0 0 3px rgba(229,72,77,0.25)",
      },

      // Figma BACKGROUND_BLUR radius 15 on the nav.
      /**
       * ASPECT RATIOS — media boxes whose height comes from their width.
       *
       * ⚠️ There is no `aspect-*` scale in this config beyond Tailwind's own
       * `square` / `video`, and `aspect-[4/3]` is an arbitrary value, which ESLint
       * bans (CLAUDE.md §6). A ratio IS a design decision — it is the shape of every
       * picture on a phone — so it gets a name.
       */
      aspectRatio: {
        /**
         * The stacked `ServiceCard`'s image, on mobile.
         *
         * ⚠️ NOT `square`, which is the row card's. Square works BESIDE copy because it
         * matches the copy block's height; square ON TOP of copy, in a card that is
         * three-quarters of a phone wide, takes most of the screen before a word is
         * read. 4:3 keeps the picture generous and still leaves the title above the
         * fold of the card.
         */
        media: "4 / 3",
      },

      backdropBlur: {
        glass: "4px", // approximates the Figma GLASS effect on eyebrow pills
        /**
         * The contact form panel. Much heavier than the pill's 4px, for the same
         * reason `blur-frost` is heavier than this: 4px across a 700px panel is
         * imperceptible, whereas on a 30px pill it is the whole effect.
         *
         * ⚠️ Only does anything because `bg-glow-form` sits behind the panel — see
         * that token. Over a flat fill this renders identically to no blur at all.
         */
        panel: "20px",
        /**
         * The Services card.
         *
         * ⚠️ 28, down from 40 (13 Aug). At 40 the frost was obvious where the wheel
         * passed behind a card and absent everywhere else, so it read as the effect
         * switching on and off as you scrolled rather than as a material. The
         * constant part of the look is `overlay-glass-card`; this only has to soften
         * the wheel where it shows through. 40 → 28 → 20: each step down came from
         * the frost reading as an effect rather than as a material.
         */
        card: "20px",
      },

      /**
       * The Work cards' image frost on rollover. Heavier than the `glass`
       * backdrop-blur (4px) because it works at a different scale: 4px on a small
       * pill reads as a material, but across a whole card it just looks like the
       * photo is slightly out of focus. 8 is enough to read as deliberate while
       * leaving the image recognisable — 12 was tried and buried the photography.
       */
      blur: {
        frost: "8px",
        /**
         * The scroll reveal's blur-to-sharp — see `Reveal`.
         *
         * ⚠️ SMALL ON PURPOSE. This is a REAL blur on the element, not a backdrop
         * filter, so it blurs the card's own type and shadow; past about 8 the copy
         * stops being recognisable as copy and the entrance reads as a page loading
         * badly rather than as something resolving into place. 6 is enough to register
         * as focus arriving and not enough to look broken at any frame.
         */
        reveal: "6px",
        /**
         * The Services background wheel. Soft, not hidden.
         *
         * ⚠️ It has to be this large because the stroke is: the mark renders at up to
         * 960px from a 23.352 viewBox, so its 1.8768 stroke scales to roughly 77 real
         * pixels. A 2–4px blur on a 77px band does nothing visible. This is enough to
         * take the hard edge off so the wheel sits BEHIND the cards in depth rather
         * than being a sharp graphic underneath them.
         */
        wheel: "14px",
      },

      // Keyframes live in globals.css — the one CSS file (CLAUDE.md §4).
      animation: {
        // Nav links on hover. Carried from v1 unchanged.
        "link-pulse": "link-pulse 1000ms ease-in-out infinite",
        /**
         * Hero rotating word. `steps(1)` so it snaps on and off like a real text
         * caret — eased, it reads as a pulse rather than a cursor.
         */
        "caret-blink": "caret-blink 1100ms steps(1, end) infinite",
        /**
         * Process step circles. 7s is long on purpose — fast enough to notice if
         * you look, slow enough that it never competes with reading the copy
         * beside it. `ease-in-out` so it eases at the turns like something
         * buoyant rather than tracking at constant speed.
         */
        "step-float": "step-float 7000ms ease-in-out infinite",
        /**
         * The quiz's incoming screen. A CSS ANIMATION, not a transition, and that
         * is the whole reason it exists: an animation plays on mount, whereas a
         * transition needs the element painted in a start state first and then
         * changed — which in React means a requestAnimationFrame dance that silently
         * never completes if the tab is backgrounded, leaving the panel blank.
         *
         * Two directions so the incoming screen always arrives from the side the
         * outgoing one did NOT leave towards. `slow` + `smooth` are the site's
         * arriving pair; no new curves (the brief asked for none).
         */
        "step-in-up": "step-in-up 420ms cubic-bezier(0.33, 1, 0.68, 1) both",
        "step-in-down": "step-in-down 420ms cubic-bezier(0.33, 1, 0.68, 1) both",
        /**
         * The mobile menu. The panel fades, then each row rises into place behind
         * it — the row delay is set inline from its index in `Nav`, because a
         * stagger is per-item data and cannot be a static class.
         *
         * `both` fill matters on the rows: without it a delayed row paints at full
         * opacity for its delay and then jumps to the start of the animation, which
         * reads as a flicker down the list.
         */
        "menu-panel": "menu-panel-in 280ms cubic-bezier(0.33, 1, 0.68, 1) both",
        "menu-row": "menu-row-in 420ms cubic-bezier(0.33, 1, 0.68, 1) both",
      },

      zIndex: {
        cursor: "100",
      },

      /**
       * MOTION — carried from v1 (design-agnostic curves), re-confirmed in D6.
       * Premium / agency feel: custom curves only, no default `ease`.
       */
      // The Card rollover animates the image's real dimensions (not `all`, which
      // would sweep up colour/shadow transitions and cost a repaint per frame).
      /**
       * ⚠️ `transitionDelay` IS GONE ENTIRELY (13 Aug audit). Its only member was
       * `stagger: "260ms"`, which sequenced panel 07's interior behind its box while
       * the expansion was a CSS-transition latch. Nothing on the site delays a
       * transition now — the reel's staging is done with ramps on one scroll value,
       * which is finer-grained than a delay and cannot fall out of step with it.
       */
      transitionProperty: {
        /**
         * ⚠️ `expand` AND `expand-inner` WERE HERE AND ARE GONE (13 Aug audit).
         * They listed the properties panel 07's box and interior moved on, for the
         * CSS-transition latch — an approach that was tried and reverted within the
         * hour, because the things staged on `expand` include a TYPE TOKEN SWAP and an
         * inline padding number and a CSS transition can interpolate neither.
         *
         * The expansion has been a scroll scrub twice and a transition once. It is not
         * coming back, so these are not kept "just in case" — a token nothing uses is
         * a token a future change will find and misapply.
         */
        size: "height, width",
        // ContactRow: the value scales AND recolours as one elastic gesture.
        elastic: "transform, color",
        /**
         * The Work cards' image frosting on rollover. `filter` is in none of
         * Tailwind's built-in transition groups, and it has to move together with
         * the `transform` that hides the blur's clipped edges — if only one of the
         * two animates, the soft border appears for the length of the transition.
         */
        frost: "filter, transform",
        /**
         * Scroll reveals: fade, rise and SHARPEN as one.
         *
         * ⚠️ `filter` was added 13 Aug for `Reveal`'s blur-to-sharp. It is safe for the
         * token's other consumers (`StatChart`'s dots and stat disc) because they never
         * change `filter` — an unused property in a transition list costs nothing.
         *
         * ⚠️ All three must be in ONE transition. Splitting the blur onto its own
         * property with its own duration is how the card ends up sharp before it has
         * finished moving, which reads as two effects rather than one arrival.
         */
        reveal: "opacity, transform, filter",
        /**
         * StatChart's trend line drawing itself in, as a left-to-right wipe.
         *
         * ⚠️ NOT `stroke-dashoffset`. A dash-based draw-on breaks here: the path
         * uses `vector-effect: non-scaling-stroke`, which makes dash lengths
         * resolve in SCREEN units while `pathLength="1"` normalises in USER
         * units. The two disagree and the line renders as a dashed line with
         * real gaps in it. A clip wipe has no such interaction.
         */
        clip: "clip-path",
        /**
         * A quiz option changing state. Four properties move together on select —
         * surface, edge, glow and the press — and they have to be one gesture; if
         * the border lands before the fill the row reads as two separate events.
         */
        option: "background-color, border-color, box-shadow, transform",
        /**
         * The locked reveal unblurring behind the email gate. `filter` again is in
         * none of Tailwind's built-in groups, and it moves with the opacity of the
         * lock overlay above it.
         */
        unlock: "filter, opacity",
        /**
         * The quiz's media cross-dissolve. All three move as one: the outgoing
         * frame fades while the incoming one settles from a slight over-scale and
         * desaturation, so the picture RESOLVES rather than hard-cutting.
         */
        dissolve: "opacity, filter, transform",
      },

      transitionDuration: {
        snap: "50ms",
        instant: "120ms",
        fast: "180ms",
        base: "280ms",
        slow: "420ms",
        /**
         * ⚠️ `measured`, RENAMED FROM `expand` (13 Aug audit). Every other step in this
         * scale is named for a SPEED; this one was named for a FEATURE — the Services
         * expansion — which no longer has a duration at all now that it is scrubbed by
         * scroll. It also had two unrelated consumers (`StatChart`'s trend line and
         * `Card`'s featured rollover), which is the tell that it was always a scale
         * step wearing a feature's name.
         *
         * Renamed rather than deleted: 560ms is a real gap between `slow` (420) and
         * `slower` (640) and both consumers want it.
         */
        measured: "560ms",
        slower: "640ms",
        slowest: "900ms",
        cinematic: "1200ms",
      },
      transitionTimingFunction: {
        standard: "cubic-bezier(0.4, 0, 0.2, 1)",
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "in-quart": "cubic-bezier(0.5, 0, 0.75, 0)",
        "in-out-quint": "cubic-bezier(0.83, 0, 0.17, 1)",
        "cta-expand": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "cta-retract": "cubic-bezier(0.22, 1, 0.36, 1)",
        smooth: "cubic-bezier(0.33, 1, 0.68, 1)",
        "soft-spring": "cubic-bezier(0.34, 1.2, 0.64, 1)",
        // Elastic settle — overshoots then springs back. Used by the CTA badge
        // returning on roll-off, and the label snapping to centre.
        "out-back": "cubic-bezier(0.175, 0.885, 0.32, 1.6)",
      },
    },
  },
  plugins: [],
};

export default config;
