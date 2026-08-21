"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * BackgroundVideo — full-bleed ambient video behind the Hero.
 *
 * Carried over from v1 UNCHANGED in behaviour (CLAUDE.md §3: design-agnostic logic
 * only). Nothing here is a visual decision, so the v2 redesign does not touch it.
 *
 * ── The poster is the base layer, not a fallback ──────────────────────────────
 * The poster `<img>` is always rendered and is the LCP element. The video mounts
 * ON TOP and fades in once it can actually play, so there is never a black or
 * empty frame — and on the paths where the video never mounts, the poster is
 * already the finished state rather than a degraded one.
 *
 * The video is not mounted at all when:
 *   - the viewport is under 640px — a multi-MB autoplaying video on mobile data
 *     for pure decoration is not a trade worth making
 *   - `prefers-reduced-motion` is set (CLAUDE.md §5)
 * Note this is a mount-time check, not a media query: it deliberately does not
 * re-evaluate on resize, because swapping a background video in and out while
 * someone drags a window would be worse than either state.
 *
 * ── pingPong — ON by default ──────────────────────────────────────────────────
 * Browsers cannot play video in reverse: `playbackRate` rejects negative values,
 * so there is no native way to do this. A clip whose last frame does not match its
 * first therefore jumps visibly every time a plain `loop` restarts it.
 *
 * `pingPong` plays forward, then walks `currentTime` backwards on rAF to fake a
 * reverse pass, then plays forward again — so the motion reverses at the ends and
 * never cuts. The result reads as one continuous loop from footage that was never
 * cut to loop.
 *
 * The backward walk steps by REAL elapsed time (`dt`), not a fixed amount per
 * frame, so the reverse pass runs at the same speed as the forward one on any
 * refresh rate. Stepping a constant amount would make it play faster on a 120Hz
 * screen than a 60Hz one.
 *
 * `loop` is set only when ping-pong is OFF — the two are mutually exclusive,
 * because a looping video never fires the `ended` event this depends on.
 *
 * Decorative throughout: `aria-hidden`, no captions, carries no meaning, and is
 * safe to remove entirely (CLAUDE.md §5).
 */

export interface BackgroundVideoProps {
  poster: string;
  mp4: string;
  webm: string;
  /**
   * Play forward → reverse → forward so the clip cycles with no visible jump.
   * Defaults to ON — it is what the ambient background is for. Pass `false` only
   * for footage that was genuinely cut to loop, where a plain `loop` is cheaper.
   */
  pingPong?: boolean;
  className?: string;
}

export function BackgroundVideo({
  poster,
  mp4,
  webm,
  pingPong = true,
  className,
}: BackgroundVideoProps) {
  const [mount, setMount] = useState(false);
  const [ready, setReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 640px)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setMount(wide && !reduce);
  }, []);

  useEffect(() => {
    if (!mount || !pingPong) return;
    const video = videoRef.current;
    if (!video) return;
    let last = 0;

    /** Walks `currentTime` backwards in real time — the fake reverse pass. */
    function reverseStep(now: number) {
      const v = videoRef.current;
      if (!v) return;
      const dt = last ? (now - last) / 1000 : 0;
      last = now;
      const t = v.currentTime - dt;
      if (t <= 0) {
        v.currentTime = 0;
        last = 0;
        void v.play();
        return;
      }
      v.currentTime = t;
      rafRef.current = requestAnimationFrame(reverseStep);
    }

    function onEnded() {
      const v = videoRef.current;
      if (!v) return;
      v.pause();
      last = 0;
      rafRef.current = requestAnimationFrame(reverseStep);
    }

    video.addEventListener("ended", onEnded);
    return () => {
      video.removeEventListener("ended", onEnded);
      cancelAnimationFrame(rafRef.current);
    };
  }, [mount, pingPong]);

  return (
    <div className={cn("absolute inset-0", className)} aria-hidden="true">
      {/* TODO(D9): next/image with `priority` — this is the LCP element. */}
      <img src={poster} alt="" className="absolute inset-0 size-full object-cover" />
      {mount ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          preload="auto"
          poster={poster}
          // `loop` only when NOT ping-ponging — ping-pong needs the `ended` event,
          // which a looping video never fires.
          loop={!pingPong}
          onCanPlay={() => setReady(true)}
          className={cn(
            "absolute inset-0 size-full object-cover",
            "transition-opacity duration-base ease-standard",
            ready ? "opacity-100" : "opacity-0",
          )}
        >
          <source src={webm} type="video/webm" />
          <source src={mp4} type="video/mp4" />
        </video>
      ) : null}
    </div>
  );
}
