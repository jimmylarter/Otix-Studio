"use client";

import { useEffect, useRef, useState } from "react";
import { Eyebrow } from "@/components/Eyebrow";
import { Pill } from "@/components/Pill";
import { cn } from "@/lib/cn";

export interface AboutProps {
  eyebrow: string;
  heading: string;
  body: string;
  pills: string[];
  image: string;
}

export function About({ eyebrow, heading, body, pills, image }: AboutProps) {
  const [shown, setShown] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Reveal once the text column scrolls into view (reduced-motion → immediate).
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="about"
      className="grid overflow-hidden rounded-xl bg-surface-light text-text-on-light lg:grid-cols-2"
    >
      {/* left — eyebrow + heading + body + service pills (scroll-revealed) */}
      <div ref={ref} className="flex flex-col gap-4xl px-section-x py-section-y-lg">
        <div className="flex flex-col gap-xl">
          <div className="flex flex-col gap-sm">
            {/* eyebrow — blur-in */}
            <div
              className={cn(
                "transition-all duration-cinematic ease-smooth",
                shown ? "translate-y-0 opacity-100 blur-0" : "translate-y-4 opacity-0 blur-sm",
              )}
            >
              <Eyebrow label={eyebrow} variant="tint" />
            </div>

            {/* heading — fades in as one block */}
            <h2
              className={cn(
                "font-sans text-h2 text-text-on-light transition-all duration-cinematic ease-smooth",
                shown ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
              )}
              style={{ transitionDelay: shown ? "200ms" : "0ms" }}
            >
              {heading}
            </h2>
          </div>

          {/* body — fade-rise */}
          <p
            className={cn(
              "max-w-measure text-body-lg text-text-muted-light transition-all duration-cinematic ease-smooth",
              shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
            )}
            style={{ transitionDelay: shown ? "200ms" : "0ms" }}
          >
            {body}
          </p>
        </div>

        {/* pills — soft fade-rise with a gentle stagger */}
        <ul className="flex flex-wrap items-start gap-base">
          {pills.map((label, i) => (
            <li
              key={label}
              className={cn(
                "transition-all duration-cinematic ease-smooth",
                shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
              )}
              style={{ transitionDelay: shown ? `${500 + i * 40}ms` : "0ms" }}
            >
              <Pill label={label} />
            </li>
          ))}
        </ul>
      </div>

      {/* right — full-height image (card's right corners come from overflow-hidden) */}
      <div className="relative aspect-card lg:aspect-auto">
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      </div>
    </section>
  );
}

export default About;
