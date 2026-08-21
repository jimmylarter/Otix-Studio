"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/Logo";
import { Cta } from "@/components/Cta";
import { ContactRow, type ContactIcon } from "@/components/ContactRow";

/**
 * Nav — the fixed page navigation. Figma: `NAV` (1440×84, inside the Hero).
 *
 * Links are Manrope SemiBold 14 uppercase in white, 60px apart, with the mint CTA
 * at the right and the logo at the left.
 *
 * ── Geometry: CONSTANT ────────────────────────────────────────────────────────
 * The bar is ALWAYS the compact floating size — inset by the 10px gutter, 12px
 * vertical padding, 16px corners. It does not resize or reposition on scroll.
 *
 * That is deliberate. An earlier build morphed it (full-bleed 20px tall -> inset
 * 12px tall) and the geometry change read as a wobble: the logo and CTA shifted
 * while the page was still moving. Holding the shape fixed and animating ONLY the
 * fill gives the same "it became solid" read with none of the movement.
 *
 * Horizontal padding is card-scale (`xl`, 24), not section-scale. A detached
 * floating bar is its own object, so it is padded like a card rather than aligned
 * to the page's 60px optical line.
 *
 * ⚠️ Figma puts a BACKGROUND_BLUR (15) on the nav. Deliberately NOT built: over the
 * hero video it muddied the footage, and behind a solid fill it does nothing.
 *
 * ── Behaviour ─────────────────────────────────────────────────────────────────
 * The gradient fill fades in as soon as you scroll, but the bar does NOT hide
 * until the hero has passed (`hideAfter`) — over the hero it is part of the
 * composition. Scrolling back INTO the hero always restores it.
 *
 * Reveal is `base`/out-expo so it returns immediately; hide is `slower`/in-quart.
 *
 * It must NEVER hide while the mobile menu is open (CLAUDE.md §5), and the menu
 * locks body scroll so the page behind cannot move under it.
 */

export interface NavLink {
  label: string;
  href: string;
}

export interface NavContact {
  key: ContactIcon;
  label: string;
  value: string;
  href: string;
}

export interface NavProps {
  links: NavLink[];
  cta: { label: string; href: string };
  /**
   * Shown at the foot of the MOBILE menu only. Reused from `content.footer` —
   * they are one set of contact details appearing in two places, not two lists.
   */
  contacts?: NavContact[];
  /**
   * Scroll distance before hide-on-scroll engages. Defaults to one viewport, which
   * is the hero. Pass the real hero height in D8 if it is not full-screen.
   */
  hideAfter?: number;
  /**
   * Element ids the bar must stay hidden over, regardless of scroll direction.
   *
   * ⚠️ It exists for the Services reel, which pins for five viewport-heights and
   * then opens a full-bleed quiz card. Both are compositions that own the whole
   * screen, and a floating bar sitting on top of them — reappearing every time you
   * nudged upward — read as chrome that had not been told what was going on.
   *
   * ⚠️ NAV DECIDES THIS, NOT THE SECTION. The alternative was for Services to push
   * state up to the page and back down, which means the page becomes a client
   * component and two siblings become coupled. An id and a rect keeps the knowledge
   * where the behaviour is, and a section that does not care simply is not listed.
   */
  hideOver?: string[];
  className?: string;
}

/** Ignore sub-pixel jitter; only react to deliberate scrolling. */
const THRESHOLD = 8;

export function Nav({ links, cta, contacts = [], hideAfter, hideOver, className }: NavProps) {
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function update() {
      const y = window.scrollY;
      setSolid(y > 24);

      /**
       * ⚠️ Checked BEFORE the direction logic and it wins outright, so scrolling up
       * inside one of these sections does not bring the bar back.
       *
       * "Covers the viewport" is `top <= 0 && bottom >= innerHeight` — the element
       * spans the whole screen. A simple `isIntersecting` was tried first and was
       * far too eager: it hid the bar the moment a single pixel of the section
       * appeared at the bottom of the screen, a whole viewport before it took over.
       */
      const covering = hideOver?.some((id) => {
        const r = document.getElementById(id)?.getBoundingClientRect();
        return r ? r.top <= 0 && r.bottom >= window.innerHeight : false;
      });

      const floor = hideAfter ?? window.innerHeight;
      if (covering && !open) {
        setHidden(true);
      } else if (open) {
        // Never hide with the menu open (CLAUDE.md §5).
      } else if (y <= floor) {
        // Inside the hero the bar is always visible. This branch MUST exist: with
        // only a `y > floor` guard, scrolling back up into the hero left `hidden`
        // stuck at its last value, so the nav stayed off-screen until you scrolled
        // down and up again. That was the "lag".
        setHidden(false);
      } else if (Math.abs(y - lastY.current) > THRESHOLD) {
        setHidden(y > lastY.current);
      }
      lastY.current = y;
      ticking.current = false;
    }
    function onScroll() {
      if (ticking.current) return;
      ticking.current = true;
      // rAF-throttled: scroll fires far more often than the screen repaints.
      window.requestAnimationFrame(update);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open, hideAfter, hideOver]);

  /** Lock the page behind the open menu. */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  /**
   * ── Focus, the same three obligations `ContactPopup` carries ────────────────
   * The menu covers the whole screen, so it is modal whether or not it is labelled
   * as such. Before 13 Aug it did none of this: opening it left focus on the page
   * behind, Tab walked invisibly through the hidden site underneath, and closing
   * dropped you at the top of the document.
   *
   *   1. Focus moves to the first link on open.
   *   2. Tab is trapped inside while it is open.
   *   3. Focus returns to the toggle on close.
   *
   * ⚠️ The trap reads the focusable list on every Tab rather than caching it. The
   * menu's contents are not static — the contact rows are optional — and a cached
   * list silently stops matching the DOM.
   */
  useEffect(() => {
    if (!open) return;

    const menu = menuRef.current;
    menu?.querySelector<HTMLElement>("a, button")?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !menu) return;

      const focusable = [...menu.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      // Wrap at both ends. Without the `shift` branch, Shift+Tab from the first
      // item escapes backwards into the page — the half of the trap people forget.
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      // Returning focus is part of closing, so it belongs in the cleanup — it then
      // runs however the menu was dismissed: Escape, the toggle, or a link.
      toggleRef.current?.focus();
    };
  }, [open]);

  return (
    <header
      className={cn(
        // OUTER carries only the hide/reveal transform. The gutter margin lives on
        // the inner bar so translating -100% clears the margin with it — on the
        // outer it would leave a 10px sliver of the bar showing at the top.
        "fixed inset-x-0 top-0 z-50",
        // Reveal is quick — coming back should feel immediate. Hide is longer and
        // softer so leaving does not compete with the content.
        "transition-transform duration-base ease-out-expo",
        hidden && "-translate-y-full duration-slower ease-in-quart",
        className,
      )}
    >
      {/* `px-xl` (24), not `section-x` (50): once the bar is a detached floating
          object it reads as a card, so it takes card-style interior padding rather
          than the page's section padding. It deliberately no longer sits on the
          60px optical line — that line governs page content, not floating chrome. */}
      <div className="relative isolate m-gutter px-xl py-md">
        {/* The ONLY thing that changes on scroll. Slow on purpose — it should
            settle in behind the links without announcing itself. */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 -z-10 rounded-lg bg-gradient-green",
            // Asymmetric: arriving is slow and unannounced, leaving is quick — a
            // fill that lingers on the way out looks like it is lagging the scroll.
            "transition-opacity ease-smooth",
            solid ? "opacity-100 duration-cinematic" : "opacity-0 duration-base",
          )}
        />

        <nav className="flex items-center justify-between gap-lg" aria-label="Main">
          <Logo variant="nav" href="/" />

          <ul className="hidden items-center gap-6xl lg:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className={cn(
                    "inline-flex min-h-tap items-center rounded-sm text-label uppercase text-neutral-0",
                    // v1 behaviour, carried unchanged: the link pulses and turns
                    // green on hover. Keyframe is `link-pulse` in globals.css.
                    "transition-colors duration-base ease-smooth",
                    "hover:animate-link-pulse hover:text-green-300",
                    "focus-visible:shadow-focus focus-visible:outline-none",
                  )}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden lg:block">
            <Cta label={cta.label} href={cta.href} tone="mint" />
          </div>

          <button
            ref={toggleRef}
            type="button"
            aria-expanded={open}
            aria-controls="nav-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
            className={cn(
              "flex h-cta w-cta items-center justify-center rounded-full lg:hidden",
              "bg-green-300 text-green-950",
              "focus-visible:shadow-focus focus-visible:outline-none",
            )}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-icon w-icon">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M4 8h16M4 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </nav>
      </div>

      {/* Full-screen overlay menu — D5 decision, carried from v1. */}
      {/*
        ── The mobile menu ────────────────────────────────────────────────────
        ⚠️ THE OPEN/CLOSED STATE IS A CLASS, NOT THE `hidden` ATTRIBUTE.

        It was `hidden={!open}` with `flex` in the class list, and that meant the
        menu was open on every page load on mobile — permanently covering the site.
        Both `[hidden]` (preflight) and `.flex` (utilities) have specificity 0,1,0,
        so the tie is broken by source order, and Tailwind emits utilities AFTER
        base. `display: flex` therefore beat `display: none` every time and the
        attribute did nothing at all.

        Toggling `flex`/`hidden` puts both sides of the decision in the same layer,
        so there is nothing left to tie-break. `.hidden` is still `display: none`,
        so the menu leaves the accessibility tree when closed exactly as before —
        and it renders closed before hydration, since `open` starts false.

        ── Composition ────────────────────────────────────────────────────────
        ⚠️ ANCHORED LOW, not centred (13 Aug). `justify-end` puts the list under
        the thumb rather than in the middle of the screen, and left-aligned type at
        `text-h2` reads as a designed screen rather than a desktop dropdown
        enlarged. It was centred `text-h3` — which is body scale on a full-screen
        surface.

        ⚠️ `overflow-y-auto` and `pt-` clearing the bar: on a short phone (SE, 667)
        the list plus contacts can exceed the viewport. It SCROLLS rather than
        shrinking anything — dropping the contact rows at a breakpoint would mean
        two different menus to keep honest.

        ⚠️ NO LOCKUP. One was added at the foot on 13 Aug and removed the same day.
        The nav bar sits directly above this (the menu is at `-z-10`, behind it) and
        already carries the logo, so a second mark 60px below it was the same thing
        twice. The links and the contact rows are what the menu is for.
      */}
      <div
        ref={menuRef}
        id="nav-menu"
        className={cn(
          open ? "flex" : "hidden",
          "fixed inset-0 -z-10 flex-col justify-end gap-block overflow-y-auto lg:hidden",
          "bg-gradient-green px-section-x-flush pb-block pt-7xl",
          "animate-menu-panel",
        )}
      >
        {/*
          ⚠️ Every child is a `menu-row`, and the DELAY is what makes it a stagger
          rather than five things arriving at once. It is set inline because the
          value is derived from the item's index — per-item data cannot be a static
          class (CLAUDE.md §1 bans arbitrary values in CLASSES, not computed style).

          50ms apart: enough to read as a cascade, short enough that the last item
          is not still arriving after the eye has reached it.
        */}
        <ul className="flex flex-col gap-md">
          {links.map((l, i) => (
            <li key={l.href} className="animate-menu-row" style={{ animationDelay: `${i * 50}ms` }}>
              <a
                href={l.href}
                onClick={() => setOpen(false)}
                /* ⚠️ `text-h1` — the largest step on the scale, and the same size
                   the Hero's headline uses. It went `h3` → `h2` → `h1`: at h3 (35)
                   this read as a desktop dropdown enlarged, and at h2 it was still
                   competing with the contact rows below rather than dominating them.

                   It is a SIZE token, not a heading level — these are links, and
                   the document's single `h1` is still the Hero's. The two are
                   answering different questions (CLAUDE.md §5).

                   ⚠️ At 40px on a 375px phone, five links plus the contact rows and
                   the CTA run close to the viewport. That is what `overflow-y-auto`
                   on the panel is for — it scrolls rather than compressing. */
                className={cn(
                  "flex min-h-tap items-baseline gap-base rounded-sm text-h1 text-neutral-0",
                  "transition-colors duration-base ease-smooth hover:text-green-300",
                  "focus-visible:shadow-focus focus-visible:outline-none",
                )}
              >
                {/* The brand's own device, in miniature — the Services numerals are
                    the same face and tone at display size. `aria-hidden` because it
                    is a visual rhythm, not part of the link's name. */}
                <span
                  aria-hidden="true"
                  /* ⚠️ `font-normal` stated explicitly rather than left to inherit.
                     `text-body-lg` happens to be 400 today, so this is currently a
                     no-op — it is here so that if the body token ever moves, these
                     numerals do NOT quietly become Adelle Semibold Italic, which is
                     a different face rather than a heavier rendering of this one. */
                  className="font-serif text-body-lg font-normal italic leading-none text-accent-numeral"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* ⚠️ NO divider between the links and the contact details. One was tried
            on 13 Aug and removed the same day — at `text-h1` the links are so much
            larger than the contact rows that the size difference already separates
            them, and the rule only added furniture. `gap-block` does the work. */}

        {/* Reused from the footer — one set of contact details in two places, not
            two lists (CLAUDE.md §3). It is what gives a full-screen menu a reason
            to be full-screen rather than five links floating in a gradient. */}
        {contacts.length > 0 ? (
          <div className="flex flex-col gap-lg">
            {contacts.map((c, i) => (
              <div
                key={c.key}
                className="animate-menu-row"
                style={{ animationDelay: `${(links.length + i) * 50}ms` }}
              >
                <ContactRow icon={c.key} label={c.label} value={c.value} href={c.href} />
              </div>
            ))}
          </div>
        ) : null}

        {/* ⚠️ LAST, beneath the contact details (13 Aug). It sat directly under the
            links before, which put the loudest element in the middle of the stack
            and made the contact rows read as an afterthought below it. At the foot
            it is the thing your thumb reaches first and it closes the sequence —
            browse, then the quieter ways to reach us, then the ask.

            It also arrives last in the stagger, which is the point: the cascade
            should land ON the call to action rather than run past it. */}
        <div
          className="animate-menu-row"
          style={{ animationDelay: `${(links.length + contacts.length) * 50}ms` }}
        >
          <Cta label={cta.label} href={cta.href} tone="mint" fullWidth />
        </div>
      </div>
    </header>
  );
}
