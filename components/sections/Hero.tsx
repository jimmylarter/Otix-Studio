import { cn } from "@/lib/cn";
import { Eyebrow } from "@/components/Eyebrow";
import { Cta } from "@/components/Cta";
import { HeroArch } from "@/components/HeroArch";
import { BackgroundVideo } from "@/components/BackgroundVideo";
import { RotatingWord } from "@/components/RotatingWord";
import type { HeadingSegment } from "@/components/SectionHeader";

/**
 * Hero — the first section. Figma: `HERO` (67:1753), 1440×1274.
 *
 * ── Why this does not use `SectionHeader` ─────────────────────────────────────
 * `SectionHeader` stacks eyebrow → heading → body left-aligned (or split). The hero
 * is centred, its accent word sits INLINE on its own line beside the rest of the
 * sentence, and its subhead is width-capped independently. Forcing it through
 * `SectionHeader` would mean adding a `hero` align variant used exactly once —
 * which is how a shared component turns into a switch statement. The type tokens
 * are identical either way, so nothing drifts.
 *
 * ── FLUSH section (CLAUDE.md §0.1) ───────────────────────────────────────────
 * The only one. No gutter, `section-x-flush` / `section-y-flush`. The 60px optical
 * line comes from `0 + 60` rather than `10 + 50`.
 *
 * ⚠️ Figma's nav is an 84px in-flow frame at the top of the container, so its copy
 * starts 164px down. Our `Nav` is FIXED and floats over the hero, so there is no
 * 84px of flow to account for — the top inset is `section-y-flush` per §0.1, and
 * the nav overlaps it. Do not add 84px of padding to "match": you would be
 * reserving space for an element that is not in the flow.
 *
 * ── The three dark layers, bottom to top ──────────────────────────────────────
 * All three are `#0C1813` = `green-950`. They are separate because they do
 * different jobs and Figma models them as three nodes:
 *
 *   1. `BackgroundVideo`          the footage itself
 *   2. radial vignette (fill)     80% at centre → 100% at the edges. Only ~20% of
 *                                 the video ever shows through, and only in the
 *                                 middle — the video is atmosphere, not subject.
 *   3. `Ellipse 4` (36:36)        a 1100×1100 radial pool, opaque at its centre
 *                                 → transparent at its edge, sitting behind the
 *                                 arch. This is what makes the white-bordered
 *                                 cards read: without it their 5px borders sit on
 *                                 whatever the video happens to be doing.
 *
 * Layer 3 is centred horizontally (Figma x=170 in a 1440 frame → 170+550 = 720)
 * and sits low, centred on the arch rather than on the section.
 *
 * ── The bottom curve ─────────────────────────────────────────────────────────
 * `Rectangle 25` (36:88) — a vector, NOT a border-radius. The hero's dark surface
 * ends in a shallow downward bulge, deepest in the middle. It is its own 103px
 * band below the container, so it is stacked after rather than overlaid.
 *
 * It scales with WIDTH (`h-auto`, no `preserveAspectRatio` override), which keeps
 * the drawn curvature exactly as designed at every viewport. Pinning its height
 * instead would deepen the bulge on a phone into something the design never shows.
 */

export interface HeroProps {
  eyebrow: string;
  heading: HeadingSegment[];
  subhead: string;
  /**
   * The button under the sub-copy. ⚠️ **ADDED 13 Aug** — `content.hero.cta` had been
   * sitting in the content file unrendered since the section was assembled.
   */
  cta: { label: string; href: string };
  media: { poster: string; mp4: string; webm: string };
  /** Decorative — the arch is `aria-hidden`. Safe to pass an empty array. */
  archImages: string[];
  /**
   * Words the accent slot cycles through, typed and deleted in place. Optional:
   * with fewer than two, the heading's own accent segment renders statically.
   * `accentWords[0]` should match that segment — it is the resting state.
   */
  accentWords?: string[];
  className?: string;
}

/**
 * The hero headline breaks across two lines with the accent word leading the
 * second, so the segments are split at the first accent rather than flowed. Figma
 * models this as two frames; this reproduces it without hard-coding the copy.
 */
function splitAtAccent(segments: HeadingSegment[]) {
  const i = segments.findIndex((s) => s.accent);
  return i === -1
    ? { first: segments, second: [] as HeadingSegment[] }
    : { first: segments.slice(0, i), second: segments.slice(i) };
}

export function Hero({
  eyebrow,
  heading,
  subhead,
  cta,
  media,
  archImages,
  accentWords,
  className,
}: HeroProps) {
  const { first, second } = splitAtAccent(heading);

  return (
    <section id="hero" className={cn("relative w-full", className)}>
      {/* The dark box. `isolate` keeps the layers below from escaping, and
          `overflow-hidden` is what clips the video and the glow — the curve below
          is deliberately OUTSIDE it so it stays a clean solid shape. */}
      {/* Base is `green-900`, NOT 950 — the video is burned onto it. The darkest
          green is reserved for the edges and the curve. `isolate` confines the
          blend below to this section. */}
      <div className="relative isolate w-full overflow-hidden bg-green-900">
        {/* Layer 1 — the video, COLOUR BURNED onto the base. This is exactly what
            the Figma frame does; `HERO Container` (36:35) carries three fills:
              1. SOLID  #142920  normal        ← the `bg-green-900` above
              2. VIDEO           COLOR_BURN    ← this layer
              3. GRADIENT_RADIAL normal        ← the scrim below (hidden in Figma
                                                 while Jimmy judged the burn)

            ⚠️ THE VIDEO IS THE BURN SOURCE AND THE GREEN IS THE BACKDROP. Every
            earlier attempt had this inverted — a green fill burning onto the video
            — and that is why none of them looked right. Burn is
            `1 − (1−backdrop) ÷ source`, so with the video as source the result is
            always at or below the base green: pure white in the footage leaves the
            green untouched, and everything darker drives it toward black. The clip
            therefore carves its texture INTO the green rather than tinting it.

            That also means the base is doing the colouring: change `bg-green-900`
            and the whole hero changes hue.

            Previously tried and rejected — all of them a consequence of getting the
            direction wrong: `screen` (blew out), `plus-darker` (flattened it),
            `color` (read as a filter), `luminosity` (lost the depth), and
            `color-burn` with the layers the wrong way round (pale with a light
            source, solid black with a dark one). */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 mix-blend-color-burn"
        >
          <BackgroundVideo poster={media.poster} mp4={media.mp4} webm={media.webm} />
        </span>

        {/* Layer 2 — the scrim. Fully clear in the middle: it no longer darkens
            the footage at all (the blend does that), it only masks the edges to
            solid `green-950`, which is what lets this section meet the curve with
            no seam. `farthest-side` is what makes the edges actually reach it. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-scrim-hero"
        />

        {/* Layer 3 — `Ellipse 4` (36:36): a 1100×1100 pool of `green-950`, opaque
            at its centre and transparent at its edge, sitting behind the arch.

            ⚠️ It must sit HERE, AFTER the scrim. Figma stacks it above the
            container's own fills — video and gradient are both fills, this is a
            child — so it paints over them. A negative z-index would post it behind
            the video, where it would do nothing at all.

            Square + `closest-side` so the radial stays a true circle, and sized as
            a proportion of the section (1100/1440) so it keeps its relationship to
            the arch at any width rather than being pinned in px.

            ⚠️ Centred LOW, not at 50%. 70% sits just above Figma's own 71.6%,
            which keeps it on the arch while letting the video's motion read behind
            the headline. At 50% it was behind the copy, which is where it does
            least — the copy already has the scrim, and the cards do not. */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute left-1/2 aspect-square w-arch-glow",
            "-translate-x-1/2 -translate-y-1/2 bg-glow-hero",
          )}
          style={{ top: "70%" }}
        />

        {/* Layer 4 — the foot. Takes the bottom band to a TRUE solid `green-950`,
            which the radial no longer does now that it ends at 95%.

            It sits above the glow, so it is the last thing before the content: the
            curve below is solid, and anything painted after this would reintroduce
            the mismatch it exists to remove. A generous band (40%) so the ramp is
            long enough to be invisible — a short one reads as its own edge. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-scrim-hero-foot"
        />

        {/* Asymmetric on purpose: Figma is 164 above the copy and 60 below the
            arch. `section-y-flush` is the §0.1 rule for the top; the bottom is
            `6xl` (60) exactly. Even top-and-bottom would double the space beneath
            the arch, where the design deliberately runs tight into the curve.

            ⚠️ The horizontal padding is on the COPY BLOCK, not here. The arch is
            full-bleed: in Figma it is 1440 wide in a 1440 frame, and its run is
            1572, so it is meant to be cropped by the viewport on both sides.
            Padding this wrapper inset the arch and the crop never happened. */}
        <div className="relative flex flex-col items-center pb-6xl pt-section-y-flush">
          {/* `mt-5xl` on top of the wrapper's `section-y-flush` lands the copy at
              168px — which is Figma's 164 inset, restored. It was short before
              because `section-y-flush` alone (120) is the §0.1 rule for the
              section, and the design adds space on top of it for the nav. */}
          {/* ⚠️ `relative` IS LOAD-BEARING — it is what the CTA at the foot of this
              column anchors its `top-full` to, and it must sit on THIS div rather than
              on the eyebrow/heading block inside it. That block closes before the
              sub-copy: it holds the eyebrow and the `h1` only, and the `<p>` is its
              SIBLING. Anchoring there put the button at the bottom of the hero.

              `HeroArch` is a sibling of this column, so `top-full` lands the button in
              the space between the two without either of them moving. */}
          <div className="relative mt-5xl flex flex-col items-center gap-xl px-section-x-flush">
            <div className="flex flex-col items-center gap-base">
              <Eyebrow label={eyebrow} variant="dark" />

              {/* ⚠️ `gap-0` on mobile, `gap-md` from `md` up.
                  The two lines of the heading are two flex CHILDREN, so the space
                  between them is the flex gap PLUS the line-height leading — while
                  the space between wrapped lines inside the first child is leading
                  alone. On a phone, where the first line wraps to two, that made
                  the last gap visibly bigger than the one above it.

                  Zeroing the gap on mobile leaves only the leading, which is
                  exactly what separates the wrapped lines, so all three read as one
                  evenly-set block. Above `md` the first line no longer wraps, there
                  is nothing to match, and the 12px is the designed separation. */}
              <h1 className="flex flex-col items-center gap-0 text-center text-h1 text-neutral-0 md:gap-md">
                {/* ⚠️ MOBILE ONLY (`md:text-wrap` puts it back). At `text-h1` on a
                    375px phone this line wraps to two or three lines, and left to
                    itself the browser fills each greedily — which strands "work"
                    alone at the bottom. Balancing evens the lines instead, and on a
                    five-word headline that is what guarantees two words minimum.

                    Scoped rather than global because above `md` the line fits on
                    one and balancing has nothing to do — but leaving it on would
                    silently change how the headline breaks if the copy ever grows,
                    and the desktop break is a design decision, not a fallback. */}
                <span className="block text-balance md:text-wrap">
                  {first.map((s) => s.text).join("")}
                </span>
                {second.length ? (
                  /* One row, `base` gap: the accent word and the words after it
                     are a lockup, not a sentence that reflows. It wraps only when
                     the viewport genuinely cannot hold it. */
                  <span className="flex flex-wrap items-center justify-center gap-base">
                    {second.map((s) =>
                      s.accent ? (
                        <span
                          key={s.text}
                          className="font-serif text-h1-accent italic text-green-300"
                        >
                          {accentWords && accentWords.length > 1 ? (
                            <RotatingWord words={accentWords} />
                          ) : (
                            s.text.trim()
                          )}
                        </span>
                      ) : (
                        <span key={s.text}>{s.text.trim()}</span>
                      ),
                    )}
                  </span>
                ) : null}
              </h1>
            </div>

            {/* Figma caps this at 608px. That is `max-w-measure` — 68ch of
                Manrope at 18px lands within a few px of it — so this is the
                measure rule, not a bespoke width, and it gets the token.

                ⚠️ `w-4/5` is MOBILE ONLY — `md:w-full` hands the job back to the
                cap above that breakpoint. On a phone the column is far narrower
                than 68ch, so the measure was doing nothing at all and the copy ran
                the full width; a proportion is what holds the shorter line there.
                On desktop the two would not fight (80% of 1320 is well past 608),
                but scoping it says which one is in charge at which size. */}
            <p className="w-4/5 max-w-measure text-center text-body-lg text-green-100 md:w-full">
              {subhead}
            </p>

            {/* ══ THE CTA ══════════════════════════════════════════════════════
                🔴 ⚠️ IT TAKES NO SPACE IN THE FLOW, AND THAT IS THE WHOLE POINT
                (Jimmy, 13 Aug: "just add the cta, don't nudge everything down").
                A normal flex child would grow this column by its own height plus a
                gap, and the arch below is positioned RELATIVE to the column
                (`-mt-sm md:mt-3xl`) — so every pixel of button would push the arch,
                and the arch's offset is a settled value that went 32 → 16 → −16 → −8
                and is explicitly marked "do not re-derive without looking on a real
                phone".

                `absolute top-full` hangs it off the bottom edge of this column, so the
                column's height is unchanged and NOTHING below moves. `mt-4xl` (40) is
                its own gap from the sub-copy — up from `mt-xl` (24) on 13 Aug — and it
                lives on the button rather than in the column's `gap-xl`, because the
                column's gap would also apply above the block and move things.

                ⚠️ **INCREASING THIS GAP PUSHES THE BUTTON INTO THE ARCH**, since the
                arch does not move. Measured at 1723px wide: the sub-copy ends at 507,
                the button is 44 tall, and the arch's CENTRE card — the only one the
                button sits over horizontally — starts at 718. So the gap can reach
                roughly **165** before they touch, and 40 uses a quarter of that. The
                outer cards start at the arch's top edge but are far left and right of
                a centred button.

                ⚠️ It lands in the arch's VALLEY, which is why it can overlap without
                colliding: the centre card starts 150/1572 of the run width down
                (~9.5%), so the middle of the arch is empty exactly where a centred
                button sits. The outer cards start at top 0 but are far left and right.
                **This is the constraint to check if the arch geometry ever changes** —
                see `HeroArch`'s CARDS table.

                ⚠️ `whitespace-nowrap` on the wrapper: an absolutely-positioned element
                shrink-wraps, and without it a narrow viewport would wrap the label
                inside the pill.

                ⚠️ The alternative was pulling the arch up by the button's height, which
                needs a JS measure — a resize-observed magic number to keep a static
                composition still. Not worth it. */}
            {/* 🔴 ⚠️ `z-10` IS WHY THE ROLLOVER WORKS. Without it the button was
                painted UNDER the arch and never received hover — `HeroArch` is a LATER
                SIBLING at the same `z-index: auto`, so it wins on paint order, and the
                button deliberately overlaps its top edge. Confirmed by hit-testing the
                button's own centre point: `elementsFromPoint` returned the arch's
                wrapper and one of its cards ABOVE the `<a>`.

                ⚠️ The symptom was hover-only, which is what made it look like a CSS
                problem with `.cta-fill` rather than a stacking one — a click at the
                same point would have missed too, and the label still rendered fine
                because painting order does not stop something being visible.

                ⚠️ The arch is `aria-hidden` decoration, so taking hover away from its
                top strip costs nothing. `LiquidImage`'s own hover still works
                everywhere the button is not. */}
            <div className="absolute left-1/2 top-full z-10 mt-4xl -translate-x-1/2 whitespace-nowrap">
              <Cta label={cta.label} href={cta.href} tone="mint" />
            </div>
          </div>

          {/* Figma actually OVERLAPS the copy and the arch by 10px — the arch
              reads as separated anyway because its tall middle card starts 150px
              down.

              ⚠️ `-mt-sm` (−8) on mobile, `md:mt-3xl` (32) above it. It went
              32 → 16 → −16 → −8, so this is a settled value rather than a first
              guess — do not re-derive it without looking on a real phone.

              The safety gap existed because the mobile arch used to run at a 190%
              spread, which put its tall centre card directly under the subhead. At
              140% that is no longer true, and the gap read as dead space rather than
              clearance. Pulling it NEGATIVE brings the mobile composition in line
              with the 10px overlap Figma draws on desktop.

              ⚠️ It is safe to overlap because the cards carry their own clearance:
              the mobile run's first card starts 7.2% of the run width down (~38px at
              this spread), so a small negative pull still leaves room before
              anything touches the subhead. That headroom is what limits how far this
              can go — past about −32 the outer cards start meeting the copy. */}
          <HeroArch images={archImages} className="-mt-sm md:mt-3xl" />

          {/* ⚠️ Figma's `Footer Container` (36:81) — a scroll cue on the left and
              the email on the right, across the bottom — is NOT built (removed
              12 Aug, Jimmy's call). `hero.scroll` and `hero.email` are still in
              `content.ts`, and `Arrow` is exported from `Cta` for it, so it is
              markup-only to reinstate. See CMS_READINESS.md. */}
        </div>
      </div>

      {/* The curve. Its own band, so the page background shows either side of the
          bulge. `block` kills the inline-svg baseline gap that would otherwise
          leave a hairline of page colour above it. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 103.152"
        className="block h-auto w-full fill-green-950"
      >
        <path d="M 0 0 L 1440 0 L 1440 10 C 885.5194702148438 133.82177734375 570.4300537109375 134.58423614501953 0 10 L 0 0 Z" />
      </svg>
    </section>
  );
}
