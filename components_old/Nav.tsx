"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { Cta } from "@/components/Cta";
import { cn } from "@/lib/cn";

export interface NavLink {
  label: string;
  href: string;
}

export interface NavProps {
  links: NavLink[];
  cta: { label: string; href: string };
  className?: string;
}

const THRESHOLD = 8; // px of movement before hide/reveal flips (anti-flicker)
const SCROLLED_AT = 24; // background goes solid past this
const SCROLL_OFFSET = 100; // land the section below the nav
const HERO_HIDE_AT = 280; // hide once the hero's bottom is this close to the top — with lead so the nav is well clear before the white section reaches the nav

// easeInOutCubic — smooth acceleration then deceleration, no overshoot
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function smoothScrollTo(targetY: number, duration = 800, onDone?: () => void) {
  const startY = window.scrollY;
  const diff = targetY - startY;
  let startTime: number | undefined;
  function step(ts: number) {
    if (startTime === undefined) startTime = ts;
    const t = Math.min(1, (ts - startTime) / duration);
    window.scrollTo(0, startY + diff * easeInOutCubic(t));
    if (t < 1) requestAnimationFrame(step);
    else onDone?.();
  }
  requestAnimationFrame(step);
}

/**
 * Fixed glass nav. Hides on scroll down, reveals on scroll up (reveal is
 * faster than hide). Background fades to solid once scrolled; stays visible
 * near the top and while the mobile menu is open. Respects the page gutter.
 */
export function Nav({ links, cta, className }: NavProps) {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHref, setActiveHref] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false); // false → drops in from above on mount
  const [entering, setEntering] = useState(true); // spring-easing window for the load bounce
  const menuOpenRef = useRef(false);
  const navScrollingRef = useRef(false);

  // On load: drop down from above the frame with a spring overshoot, then hand
  // control back to the normal hide/reveal easing once the bounce settles.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setLoaded(true));
    const t = window.setTimeout(() => setEntering(false), 720);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    menuOpenRef.current = menuOpen;
    if (menuOpen) setHidden(false);
  }, [menuOpen]);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    function update() {
      const y = window.scrollY;
      setScrolled(y > SCROLLED_AT);
      // Stay visible for the whole hero; only start hiding once the hero's
      // bottom edge is nearly at the top (so the nav is gone before the white
      // section slides under it). Past the hero, normal hide/reveal applies.
      const heroEl = document.getElementById("top");
      const heroBottom = heroEl ? heroEl.getBoundingClientRect().bottom : 0;
      const withinHero = heroBottom > HERO_HIDE_AT;
      if (menuOpenRef.current || navScrollingRef.current || withinHero) {
        setHidden(false);
        lastY = y;
      } else {
        const delta = y - lastY;
        if (Math.abs(delta) > THRESHOLD) {
          setHidden(delta > 0);
          lastY = y;
        }
      }
      ticking = false;
    }
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // scroll-spy — highlight the link whose section is in view
  useEffect(() => {
    const els = links
      .map((l) => l.href)
      .filter((h) => h.startsWith("#"))
      .map((h) => document.getElementById(h.slice(1)))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActiveHref(`#${e.target.id}`);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [links]);

  function handleNavClick(e: React.MouseEvent, href: string) {
    setMenuOpen(false);
    if (!href.startsWith("#")) return;
    const el = document.getElementById(href.slice(1));
    if (!el) return;
    e.preventDefault();
    const targetY = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo(0, targetY);
      return;
    }
    navScrollingRef.current = true;
    setHidden(false);
    smoothScrollTo(targetY, 800, () => {
      navScrollingRef.current = false;
    });
  }

  return (
    <>
      {/* Masks the top white gutter so the nav slides under it near the top.
          Removed once scrolled — otherwise it clips the pinned nav bar. */}
      {!scrolled && (
        <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-50 h-gutter bg-surface-white" />
      )}
      <header
        className={cn(
          "fixed left-2xl right-2xl top-0 z-40 transition-all",
        scrolled ? "pt-gutter" : "pt-2xl", // slides up to a tighter gap once scrolled
        loaded ? "opacity-100" : "opacity-0",
        hidden || !loaded ? "-translate-y-full" : "translate-y-0",
        entering
          ? "duration-expand ease-cta-expand" // one-time spring drop on load
          : hidden
            ? "duration-slow ease-in-quart"
            : "duration-slow ease-smooth", // reveal — smooth glide, no snap
        className,
      )}
    >
      <nav
        className={cn(
          "flex h-nav items-center justify-between rounded-md border border-nav-border px-lg backdrop-blur-nav transition-colors duration-base ease-standard",
          scrolled ? "bg-primary-navy" : "bg-nav-glass",
        )}
      >
        <a href="#top" aria-label="Otix Studio — home" className="rounded-sm outline-none focus-visible:shadow-focus">
          <Logo className="h-md w-auto text-text-on-dark" />
        </a>

        <ul className="hidden items-center gap-5xl lg:flex">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                onClick={(e) => handleNavClick(e, l.href)}
                aria-current={l.href === activeHref ? "true" : undefined}
                className={cn(
                  "inline-block rounded-sm font-mono text-cta uppercase outline-none transition-colors duration-base ease-standard hover:animate-link-pulse hover:font-bold hover:text-primary-blue focus-visible:shadow-focus",
                  l.href === activeHref ? "font-bold text-primary-blue" : "text-surface-white",
                )}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden lg:block">
          <Cta variant="text" tone="dark" label={cta.label} href={cta.href} />
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
          className="grid size-cta place-items-center rounded-sm text-surface-white outline-none focus-visible:shadow-focus lg:hidden"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-icon w-icon">
            {menuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M4 8h16M4 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </nav>

      {menuOpen && (
        <div className="mt-xs flex flex-col gap-md rounded-md border border-nav-border bg-primary-navy p-lg lg:hidden">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={(e) => handleNavClick(e, l.href)}
              className="rounded-sm font-mono text-cta uppercase text-surface-white outline-none transition-colors duration-base ease-standard hover:text-primary-blue focus-visible:shadow-focus"
            >
              {l.label}
            </a>
          ))}
          <Cta variant="text" tone="dark" label={cta.label} href={cta.href} fullWidth />
        </div>
      )}
      </header>
    </>
  );
}

export default Nav;
