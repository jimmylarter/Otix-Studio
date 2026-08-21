"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { ContactPanel, type ContactPanelProps } from "@/components/ContactPanel";

/**
 * ContactPopup — the enquiry dialog. Figma: `POPUP CONTACT` (126:2).
 *
 * The footer's own contact block on the same gradient and radius, minus the logo
 * and legal row, with a close control top-right. It shares `ContactPanel` with the
 * footer rather than restating it (COMPONENTS.md).
 *
 * ── How it opens ──────────────────────────────────────────────────────────────
 * By intercepting clicks on `a[href="#contact"]` — **except inside the site
 * header** — rather than threading an `onOpen` through every CTA in every section.
 * The nav's "Let's Chat" therefore scrolls to the footer like the nav links beside
 * it, while every body CTA opens the dialog.
 *
 * That is deliberate, and it is the accessible order of operations: those links
 * are REAL links to the footer, so with JavaScript unavailable — or before hydration
 * — "Start Project" still takes you to the contact form. The dialog is an
 * enhancement layered on top, and `preventDefault` only runs once it is listening.
 * Threading a callback would have replaced a working link with a dead button.
 *
 * A single delegated listener also means a CTA added later is wired up by writing
 * the same href, with nothing to remember.
 *
 * ── The modal obligations, none of which are optional ─────────────────────────
 *   · `role="dialog"` + `aria-modal`, named by the panel's own heading via
 *     `aria-labelledby` — pointing at the visible text rather than repeating it in
 *     an `aria-label` that would drift the moment the copy changed.
 *   · Escape closes it.
 *   · Body scroll locks while open, or the page scrolls behind the dialog.
 *   · Focus moves to the close button on open and RETURNS to whichever CTA was
 *     clicked on close — without that, a keyboard user is dropped back at the top
 *     of the document with no idea where they were.
 *
 * ── Motion ────────────────────────────────────────────────────────────────────
 * Slides up from the bottom on `slow`/`cta-expand` — the site's "arriving" pair,
 * so it belongs to the same language as the CTA it came from. The backdrop fades
 * on the same clock. Under reduced motion §7.2 drops `transform` and it simply
 * appears, which is the correct behaviour for a dialog rather than a degraded one.
 */

export type ContactPopupProps = Omit<ContactPanelProps, "headingId" | "className">;

const HEADING_ID = "contact-popup-heading";

export function ContactPopup(props: ContactPopupProps) {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setShown(false);
    // Let the slide-out play before unmounting; without this the dialog vanishes
    // instead of leaving.
    window.setTimeout(() => {
      setOpen(false);
      returnTo.current?.focus();
      returnTo.current = null;
    }, 260);
  }, []);

  /* Delegated open. One listener for every `#contact` link on the page. */
  useEffect(() => {
    function onClick(e: MouseEvent) {
      // Let modified clicks through — cmd-click on a real link should still work.
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      const link = (e.target as HTMLElement | null)?.closest?.('a[href="#contact"]');
      if (!link) return;
      // ⚠️ The NAV's "Let's Chat" is left alone — it scrolls to the footer like the
      // other nav links beside it. A link in the site header is navigation; a link
      // in the body is an action, and only the actions open the dialog. Anything
      // else makes one item in a row of five behave unlike its neighbours.
      if (link.closest("header")) return;
      e.preventDefault();
      returnTo.current = link as HTMLElement;
      setOpen(true);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  /* Mount, then animate — a transition cannot run from a state the element has
     never been painted in, so the two have to be separate frames. */
  /**
   * ⚠️ rAF **plus a timeout backstop**, not rAF alone. `requestAnimationFrame`
   * does not fire in a backgrounded tab, and with only the rAF the dialog mounted
   * with `shown` stuck at `false` — so it opened held at `translate-y-full`,
   * entirely off-screen, and stayed there. Whichever of the two lands first flips
   * it; the other is a no-op.
   *
   * Found 13 Aug, and it is the third instance of the same trap in this codebase
   * (see `Quiz`'s entrance animation and `Services`' scroll handler). **Do not
   * schedule state that the UI depends on inside a bare rAF.**
   */
  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => setShown(true));
    const timer = window.setTimeout(() => setShown(true), 60);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby={HEADING_ID}
    >
      {/* Backdrop. A button, not a div with onClick — click-to-dismiss has to be
          reachable some other way for anyone not using a pointer, and Escape is
          that way, so this stays out of the tab order.
          ⚠️ Since 13 Aug the panel fills the viewport inside a 10px frame, so the
          only part of this that is still clickable is that frame. Dismissal now
          rests on Escape and the close button, which is why both are non-negotiable
          here — see the modal obligations above. */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={close}
        className={cn(
          "absolute inset-0 bg-overlay-green-20 backdrop-blur-glass",
          "transition-opacity duration-slow ease-smooth",
          shown ? "opacity-100" : "opacity-0",
        )}
      />

      {/*
        The scroller. `h-dvh` + `p-gutter` puts the SAME 10px frame on all four
        sides, and because the scroller is exactly the viewport it always starts at
        the top — the panel's first pixel is 10px down, before you touch the wheel.

        ⚠️ It was `items-end` + `max-h-dvh` + `pb-gutter` (13 Aug and earlier): no
        top gutter at all, and with the flex parent bottom-aligning a
        shorter-than-viewport panel it read as floating mid-screen. Height, not
        max-height, is what fixes it — a max-height only caps the box, it does not
        make it start anywhere in particular.
      */}
      <div
        className={cn(
          "relative h-dvh w-full overflow-y-auto p-gutter",
          "transition-transform duration-slow ease-cta-expand",
          shown ? "translate-y-0" : "translate-y-full",
        )}
      >
        {/*
          `min-h-full` is what stretches the panel to the bottom of a tall screen
          rather than leaving it floating with dead space beneath. It resolves
          against the scroller's CONTENT box — `100dvh` minus the 20px of padding —
          so the panel lands exactly on the 10px frame top and bottom.

          `justify-center` only does anything when there is spare room: once the
          content is taller than the panel the flex container grows to fit it and
          centring becomes a no-op, so nothing is ever clipped off the top.
        */}
        {/* `overflow-hidden` for the same reason as the Footer's panel — the form's
            glow bleeds 80px past its box and would otherwise widen the dialog. */}
        <div className="relative flex min-h-full flex-col justify-center overflow-hidden rounded-3xl bg-gradient-green px-section-x py-section-y">
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Close"
            className={cn(
              // `h-contact` (50) is the tap target; the glyph inside is `icon-lg`
              // (32). Figma's control is 48 square — the target matches it and the
              // cross fills it rather than sitting small in the middle.
              //
              // ⚠️ `xl` (24) from both edges, NOT the panel's own padding. It sat
              // at `right-section-x top-5xl` (50/48), which lined it up with the
              // content — and that was the problem: a close control that respects
              // the reading column reads as part of the content rather than as
              // chrome. Pulled into the corner 13 Aug.
              //
              // ⚠️ 24 is about as tight as it goes. The panel is `rounded-3xl`
              // (30), so the corner arc occupies the first 30px of each edge; any
              // closer and the round button starts riding the curve instead of
              // sitting inside it. The 50px target still clears the 44px floor
              // with the whole button inside the panel.
              "absolute right-xl top-xl flex h-contact w-contact items-center justify-center rounded-full",
              "text-neutral-0 transition-colors duration-base ease-smooth",
              "hover:bg-overlay-green-20 focus-visible:shadow-focus focus-visible:outline-none",
            )}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-icon-lg w-icon-lg">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <ContactPanel {...props} headingId={HEADING_ID} />
        </div>
      </div>
    </div>
  );
}
