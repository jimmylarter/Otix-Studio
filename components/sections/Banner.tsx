import { cn } from "@/lib/cn";
import { Card } from "@/components/Card";

/**
 * Banner — a full-bleed image card. Figma: `BANNER - 1` (36:232) and
 * `BANNER - 2` (36:1162).
 *
 * Both banners are identical, which is the whole reason this is a component and
 * not two blocks of markup. There is no variant and nothing to pass — if they ever
 * diverge, the difference belongs here as a prop, not in a second component
 * (CLAUDE.md §3).
 *
 * ⚠️ The section paints NOTHING — **the Card is the surface**. Everything on this
 * section is therefore an INSET around that card; the copy's own inset comes from
 * the `banner` variant inside `Card` and is not touched from here.
 *
 * The banner is a `Card` VARIANT, not its own component (COMPONENTS.md §7). It
 * renders permanently in the rolled-over state — copy on the image, scrim up,
 * mint tag — because there is nothing beneath it to reveal.
 */

export interface BannerProps {
  id?: string;
  image: string;
  tag?: string;
  title: string;
  description?: string;
  href?: string;
  className?: string;
}

export function Banner({ id, image, tag, title, description, href, className }: BannerProps) {
  /*
   * ── The inset ────────────────────────────────────────────────────────────────
   * ⚠️ The band is held **60px off the viewport**, not on the 10px page gutter:
   * `mx-gutter` (10) + `px-section-x` (→ 50 at 1440). That is the same optical line
   * every containered section lands its CONTENT on — applied here to the surface
   * itself, so the band reads as a plate sitting on the page rather than as part of
   * the page frame.
   *
   * It went gutter → 120 → gutter → 60 before settling (12–13 Aug). The flat 120
   * broke the page frame it shares with Work, WhyOtix and Pricing; 60 does not,
   * because 10 + 50 is a number the whole page already uses.
   *
   * ⚠️ BOTH banners take it. Banner 2 had it alone for one commit — that was a
   * misread, and two bands with different insets on one page read as a mistake
   * rather than a decision.
   *
   * ── The gap below ────────────────────────────────────────────────────────────
   * `pb-block` (→ 80). The banner is the only section followed DIRECTLY by another
   * containered panel (Banner 1 → WhyOtix, Banner 2 → Pricing), and two panels
   * butted together read as one mis-drawn shape.
   *
   * It went 10 → 24 → 100 → 48 → 80. 10 matched the side gutter and made the panels
   * look joined; 100 read as a section break rather than a gap between neighbours;
   * 48 was right while the band sat on the gutter, but against a 50px side inset it
   * looked like the short edge of a frame that is 50 everywhere else — the eye
   * reads that mismatch even though the numbers are close. Figma has them touching;
   * this whole gap is deliberate.
   *
   * ⚠️ Both are FLUID tokens, not the 1440 values they resolve to — a fixed 50/80
   * would eat a quarter of the band on a phone. And they are a PAIR: change the
   * side inset and the foot has to move with it.
   *
   * Not a `gap` on `<main>` — that would space every section, including the flush
   * ones that already carry their own vertical rhythm.
   */
  return (
    <section id={id} className={cn("mx-gutter px-section-x pb-block", className)}>
      <Card
        variant="banner"
        image={image}
        tag={tag}
        title={title}
        description={description}
        href={href}
      />
    </section>
  );
}
