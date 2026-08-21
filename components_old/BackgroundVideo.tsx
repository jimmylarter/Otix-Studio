"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export interface BackgroundVideoProps {
  poster: string;
  mp4: string;
  webm: string;
  /** play forward → reverse → forward (boomerang) so the loop has no jump */
  pingPong?: boolean;
  className?: string;
}

/**
 * Full-bleed ambient background video. Poster is the base (and the LCP); the
 * video mounts + fades in only on tablet+ with motion allowed — mobile /
 * reduced-motion get the poster alone. Decorative, safe to remove.
 * pingPong plays forward then steps back in reverse (browsers can't play video
 * in reverse natively) for a seamless-feeling loop.
 */
export function BackgroundVideo({ poster, mp4, webm, pingPong = false, className }: BackgroundVideoProps) {
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
      <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
      {mount && (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          preload="auto"
          poster={poster}
          loop={!pingPong}
          onCanPlay={() => setReady(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-base ease-standard",
            ready ? "opacity-100" : "opacity-0",
          )}
        >
          <source src={webm} type="video/webm" />
          <source src={mp4} type="video/mp4" />
        </video>
      )}
    </div>
  );
}

export default BackgroundVideo;
