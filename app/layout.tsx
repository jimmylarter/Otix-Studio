import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Otix Studio",
  description: "AI-first web design studio — websites and apps built to convert.",
};

/**
 * v2 root layout.
 *
 * The page background is the warm neutral (`neutral-100`) and text is ink —
 * see CLAUDE.md §1.1: neutral is for surfaces, ink is for type. Never swap them.
 *
 * The v1 CustomCursor is intentionally NOT mounted yet. It is design-agnostic
 * logic worth carrying over, but its glow colour was teal and it is a D6 (motion)
 * decision whether v2 keeps it at all. It lives in `components_old/CustomCursor.tsx`.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  /*
   * ⚠️ Scroll snapping lives in `globals.css`, not here — see the `html` rule beside
   * `scroll-behavior`. It is a document-level scroll property like that one, and the
   * Tailwind utilities were not being emitted for the root element.
   *
   * ⚠️ It is FOR ONE MOMENT ON THE WHOLE SITE: the
   * Services finale coming to rest fully expanded, so an over-scroll does not carry
   * you straight through it into Process. The snap TARGET lives in `Services`.
   *
   * ⚠️ PROXIMITY, NEVER MANDATORY. Proximity only engages when a release lands near a
   * snap point, so with exactly one snap point on the page it is inert everywhere
   * else — which is what makes a document-level property acceptable for a
   * section-level need. `mandatory` would make every scroll jump to the nearest point
   * and would fight the pinned reel directly.
   *
   * ⚠️ It is on <html> because `scroll-snap-type` must sit on the SCROLL CONTAINER,
   * and the document is the scroller. It cannot live on the section.
   *
   * ⚠️ Snap points and `position: sticky` are a known source of jank in Chrome, and
   * this page has several sticky elements. If scrolling ever feels notchy through
   * Services, this is the first thing to remove.
   */
  return (
    <html lang="en">
      <head>
        {/*
          ⚠️ ADELLE COMES FROM ADOBE TYPEKIT, not from `/public/fonts` like every
          other face on this site. It is the one font that is a network dependency:
          if the kit is unreachable the italic accents fall back to Georgia, which
          is a legible degradation but not the design.

          A raw <link> rather than the Metadata API, which has no field for a
          stylesheet. `preconnect` first because the kit then loads its own woff2
          from a second origin (`p.typekit.net`) — without it the browser pays a
          fresh DNS + TLS handshake at the moment the font is needed.

          ⚠️ Kit `nzb3tlw` serves `adelle` (300/400/600, roman + italic) and
          `adelle-condensed`. Only ONE face is actually used: italic 600. If the kit
          is ever slimmed in Adobe's UI, that is the one to keep.
        */}
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://p.typekit.net" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://use.typekit.net/nzb3tlw.css" />
      </head>
      <body className="bg-neutral-100 font-sans text-ink-900 antialiased">{children}</body>
    </html>
  );
}
