"use client";

import { Fragment, useEffect, useState } from "react";
import { Eyebrow } from "@/components/Eyebrow";
import { HeadingHighlight } from "@/components/SectionHeader";
import { Cta } from "@/components/Cta";
import { Card } from "@/components/Card";
import { CenterCarousel } from "@/components/CenterCarousel";
import { BackgroundVideo } from "@/components/BackgroundVideo";
import { cn } from "@/lib/cn";

interface HeroProject {
  image: string;
  tag: string;
  title: string;
  body: string;
  href?: string;
}

export interface HeroProps {
  eyebrow: string;
  headline: { pre: string; highlight: string; post: string };
  subhead: string;
  cta: { label: string; href: string };
  media: { poster: string; mp4: string; webm: string };
  projects: HeroProject[];
}

const WORD_STEP = 70; // ms between words as the headline cascades in

/** Word-by-word rise + fade cascade for a headline segment. */
function Words({ show, text, base }: { show: boolean; text: string; base: number }) {
  const words = text.trim().split(/\s+/);
  return (
    <>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span
            className={cn(
              "inline-block transition-all duration-slowest ease-smooth",
              show ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
            )}
            style={{ transitionDelay: `${base + i * WORD_STEP}ms` }}
          >
            {w}
          </span>
          {i < words.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </>
  );
}

export function Hero({ eyebrow, headline, subhead, cta, media, projects }: HeroProps) {
  const [shown, setShown] = useState(false);

  // Trigger the entrance on the frame after mount so the transitions run.
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section
      id="top"
      data-cursor="dark"
      className="relative flex min-h-screen transform-gpu flex-col overflow-hidden rounded-xl bg-surface-navy text-text-on-dark"
    >
      {/* faint ambient video in the top portion, fading down into the navy */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-3/5 opacity-20">
        <BackgroundVideo poster={media.poster} mp4={media.mp4} webm={media.webm} pingPong />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-3/5 bg-gradient-to-b from-transparent to-primary-navy" />

      <div className="relative z-10 flex flex-1 flex-col gap-12 pb-16 pt-52">
        <div className="flex flex-1 flex-col items-center justify-center gap-xl px-section-x text-center">
          {/* 1 — eyebrow: blur-in */}
          <div
            className={cn(
              "transition-all duration-slowest ease-smooth delay-hero-1",
              shown ? "translate-y-0 opacity-100 blur-0" : "translate-y-3 opacity-0 blur-sm",
            )}
          >
            <Eyebrow label={eyebrow} variant="tint" />
          </div>

          {/* 2 — headline: words cascade in, then "harder" + tail land together */}
          <h1 className="max-w-display font-sans text-h1 text-text-on-dark">
            <Words show={shown} text={headline.pre} base={220} />{" "}
            <span
              className={cn(
                "inline-block origin-center transition-all duration-slowest ease-soft-spring delay-hero-2",
                shown ? "scale-100 opacity-100" : "scale-90 opacity-0",
              )}
            >
              <HeadingHighlight>{headline.highlight}</HeadingHighlight>
            </span>{" "}
            <span
              className={cn(
                "inline-block transition-all duration-slowest ease-smooth delay-hero-2",
                shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
              )}
            >
              {headline.post.trimStart()}
            </span>
          </h1>

          {/* 3 — subhead: comes in first of the lower group */}
          <p
            className={cn(
              "max-w-measure text-body-lg text-text-muted transition-all duration-slowest ease-smooth delay-hero-3",
              shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
            )}
          >
            {subhead}
          </p>

          {/* 4 — CTA: a beat after the subhead (32px gap = column gap-xl + mt-xs2) */}
          <div
            className={cn(
              "mt-xs2 transition-all duration-slowest ease-smooth delay-hero-4",
              shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
            )}
          >
            <Cta variant="arrow" tone="dark" scrollCue label={cta.label} href={cta.href} />
          </div>
        </div>

        {/* 5 — project carousel: a beat after the CTA */}
        <div
          className={cn(
            "w-full transition-all duration-slowest ease-smooth delay-hero-5",
            shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
          )}
        >
          <CenterCarousel>
            {projects.map((p, i) => (
              <Card key={i} image={p.image} tag={p.tag} title={p.title} body={p.body} />
            ))}
          </CenterCarousel>
        </div>
      </div>
    </section>
  );
}

export default Hero;
