"use client";

import { Children, type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Carousel — a horizontal scroll-snap strip, optionally looping endlessly.
 *
 * Restored from the v1 archive (it was cut from v2 when the hero became a static
 * arch) and extended with `loop`. The drag-to-scroll and snap behaviour is
 * unchanged — design-agnostic logic, CLAUDE.md §3.
 *
 * ── Native scrolling, not a transform track ───────────────────────────────────
 * A real overflow container with CSS scroll-snap, so wheel, trackpad, touch and
 * keyboard all work for free and momentum feels native. Mouse and pen get
 * click-drag on top, because they have no other way to pull it.
 *
 * Snap is DISABLED mid-drag and re-enabled on release — that is what lets the
 * strip follow the cursor freely and then settle on the nearest card, rather than
 * fighting the pointer for every pixel.
 *
 * ── How the loop works ────────────────────────────────────────────────────────
 * The children are rendered TWICE and the strip starts at scrollLeft 0. Once the
 * scroll position passes one set's width, `scrollLeft` jumps back by exactly that
 * width — the same card is then under the same pixel, so the jump is invisible and
 * the strip runs forever.
 *
 * ⚠️ It starts at the TRUE beginning, not in a middle copy. Starting mid-loop is
 * the usual way to get a bidirectional loop, and it was tried — but it always
 * leaves a card peeking in from the left, because there is by definition content
 * behind you. Opening cleanly on the optical line matters more here than being
 * able to swipe backwards from a standing start; the second copy still gives a
 * full set of backward runway the moment you have moved at all.
 *
 * ⚠️ The jump is applied with `scrollLeft =`, never `scrollTo({behavior:'smooth'})`
 * — it must be instantaneous. A smooth reposition animates the very seam it exists
 * to hide.
 *
 * ⚠️ The clones are `aria-hidden` and the real set is not, so a screen reader is
 * offered each testimonial exactly once rather than three times.
 */

export interface CarouselProps {
  children: ReactNode;
  /** Width classes for each item, e.g. `"basis-4/5 sm:basis-1/2 xl:basis-1/4"`. */
  itemClassName?: string;
  /** Repeat the children so the strip scrolls endlessly in both directions. */
  loop?: boolean;
  /**
   * Fires with 0–1 as the strip scrolls, for an external progress indicator.
   *
   * ⚠️ Meaningless when `loop` is set — a looping strip has no end, and the
   * reposition jump would make the value snap backwards. Only wire this up on a
   * finite strip.
   */
  onProgress?: (progress: number) => void;
  /**
   * Space between cards. A PROP rather than something callers override through
   * `className` — both would be single classes on the same element, so which one
   * won would come down to stylesheet order rather than intent. That exact trap is
   * already on record for the `Tag` mint variant.
   */
  gapClassName?: string;
  className?: string;
}

export function Carousel({
  children,
  itemClassName,
  loop = false,
  onProgress,
  gapClassName = "gap-xl",
  className,
}: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startScroll: 0 });
  const [dragging, setDragging] = useState(false);

  const items = Children.toArray(children);
  const sets = loop ? 2 : 1;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !loop || items.length === 0) return;

    let setWidth = 0;
    let ticking = false;

    function measure() {
      // ⚠️ Measured as the PITCH between the same card in two consecutive copies,
      // not as `scrollWidth / sets`. That division is wrong twice over: scrollWidth
      // includes the container's padding, and the flex gap falls between every
      // item — so the last set is one gap shorter than the others. Both errors are
      // small, and both accumulate into visible drift every time the strip wraps.
      const kids = el!.children;
      if (kids.length < items.length * 2) return;
      setWidth =
        (kids[items.length] as HTMLElement).offsetLeft - (kids[0] as HTMLElement).offsetLeft;
    }

    function reposition() {
      // One direction only: once you are a full set along, drop back a set. The
      // view is identical at both positions, so nothing appears to happen — and
      // scrollLeft stays inside `[0, setWidth)` forever.
      if (setWidth > 0 && el!.scrollLeft >= setWidth) el!.scrollLeft -= setWidth;
      ticking = false;
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(reposition);
    }

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", onScroll);
    };
  }, [loop, sets, items.length]);

  /**
   * Progress, for a caller that wants to draw its own indicator.
   *
   * ⚠️ rAF CANCEL-AND-RESCHEDULE, not a `ticking` latch. rAF does not fire in a
   * backgrounded tab, and a latch that is only cleared inside the callback stays
   * true forever if that frame never arrives — which silently freezes the readout
   * for the rest of the session. Same trap as `Services`' scroll handler.
   */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !onProgress || loop) return;
    let raf = 0;

    function report() {
      const max = el!.scrollWidth - el!.clientWidth;
      onProgress!(max > 0 ? Math.min(Math.max(el!.scrollLeft / max, 0), 1) : 0);
    }
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(report);
    }

    report();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [onProgress, loop]);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    // Touch already scrolls natively — hijacking it would only make it worse.
    if (e.pointerType === "touch") return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const el = scrollRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft };
    el.setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = scrollRef.current;
    if (!drag.current.active || !el) return;
    const dx = e.clientX - drag.current.startX;
    // 4px of slop so a click on a card is not read as a drag.
    if (!dragging && Math.abs(dx) > 4) setDragging(true);
    el.scrollLeft = drag.current.startScroll - dx;
  }

  function endDrag() {
    drag.current.active = false;
    setDragging(false); // re-enables snap → settles on the nearest card
  }

  return (
    <div
      ref={scrollRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDragStart={(e) => e.preventDefault()}
      className={cn(
        "no-scrollbar flex select-none overflow-x-auto",
        gapClassName,
        dragging ? "cursor-grabbing snap-none" : "cursor-grab snap-x snap-mandatory",
        className,
      )}
    >
      {Array.from({ length: sets }).flatMap((_, set) =>
        items.map((child, i) => (
          <div
            key={`${set}-${i}`}
            // Only the first copy is real to assistive tech — the rest is runway.
            aria-hidden={loop && set !== 0 ? true : undefined}
            className={cn("shrink-0 snap-start", itemClassName)}
          >
            {child}
          </div>
        )),
      )}
    </div>
  );
}
