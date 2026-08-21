"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * RotatingWord — a word that deletes and retypes itself, with an editing caret.
 *
 * ⚠️ INVENTED INTERACTION. Not in the Figma or the brief — Jimmy's idea, for the
 * Hero's accent word. Belongs in MOTION_SPEC.md as a deliberate addition.
 *
 * ── The box HUGS the word; the line reflows ──────────────────────────────────
 * The word sits mid-sentence: "…that work *harder* than you do." This span takes
 * the width of whatever is currently typed, so "than you do." slides in and out
 * as characters come and go and the gap tracks the text.
 *
 * That is a decision, not the default. Two earlier versions pinned the box to the
 * width of the longest word so the sentence could not move — first left-aligned,
 * then right-aligned to keep the caret still. Both were rejected: the fixed box
 * leaves a visible hole in the sentence whenever the word is short, and a headline
 * that refuses to move while its own word is being retyped reads as two unrelated
 * things rather than one sentence being edited.
 *
 * The cost is real and accepted: the line is centred, so every keystroke shifts
 * the words on BOTH sides of the accent. If that ever needs undoing, the fix is an
 * `inline-grid` with an invisible sizer holding the longest word in the same cell
 * — not a min-width, which cannot know the font's metrics.
 *
 * ── Timings ───────────────────────────────────────────────────────────────────
 * Deliberately the values of three duration tokens that were otherwise unused
 * (MOTION_SPEC.md §2 flagged them). These are JS timers, not CSS transitions, so
 * they cannot literally consume the tokens — but they are the same numbers, and
 * that is on purpose rather than a coincidence.
 *
 * Deleting is faster than typing, which is how real editing looks: you hold
 * backspace, but you type key by key.
 *
 * ── Accessibility ─────────────────────────────────────────────────────────────
 * The animated span is `aria-hidden` and a static word is exposed to screen
 * readers instead. Without that, the accessible name of the `h1` would change
 * several times a second — which is noise at best, and on some setups a stream of
 * interruptions.
 *
 * Under `prefers-reduced-motion` it renders `words[0]` statically with no caret
 * and no timers. This is the one component that loops, so it is also the one that
 * most needs that path.
 */

/** Per character while typing. Matches the `instant` duration token (120ms). */
const TYPE_MS = 120;
/** Per character while deleting. Matches `snap` (50ms) — backspace is held. */
const DELETE_MS = 50;
/** How long a completed word sits before it is deleted. Matches `cinematic`. */
const HOLD_MS = 1200;
/** Beat between finishing a delete and starting the next word. */
const SWITCH_MS = 240;

type Phase = "hold" | "deleting" | "typing";

export interface RotatingWordProps {
  /**
   * Cycled in order, looping. `words[0]` is the resting word: it is what renders
   * on the server, on first paint, and under reduced motion — so it should be the
   * word the design actually shows.
   */
  words: string[];
  className?: string;
}

export function RotatingWord({ words, className }: RotatingWordProps) {
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(words[0]?.length ?? 0);
  const [phase, setPhase] = useState<Phase>("hold");
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (!animate || words.length < 2) return;
    const word = words[index] ?? "";

    let delay: number;
    let next: () => void;

    if (phase === "hold") {
      delay = HOLD_MS;
      next = () => setPhase("deleting");
    } else if (phase === "deleting") {
      if (count > 0) {
        delay = DELETE_MS;
        next = () => setCount((c) => c - 1);
      } else {
        delay = SWITCH_MS;
        next = () => {
          setIndex((i) => (i + 1) % words.length);
          setPhase("typing");
        };
      }
    } else {
      if (count < word.length) {
        delay = TYPE_MS;
        next = () => setCount((c) => c + 1);
      } else {
        delay = 0;
        next = () => setPhase("hold");
      }
    }

    const id = window.setTimeout(next, delay);
    return () => window.clearTimeout(id);
  }, [animate, words, index, count, phase]);

  const shown = animate ? (words[index] ?? "").slice(0, count) : (words[0] ?? "");

  if (!animate) {
    return <span className={className}>{words[0]}</span>;
  }

  return (
    <>
      {/* What assistive tech reads. Static, so the h1's name never changes. */}
      <span className="sr-only">{words[0]}</span>

      {/* `whitespace-pre` so a fully-deleted word still occupies its line box and
          the caret does not jump to the baseline of an empty inline element. */}
      <span aria-hidden="true" className={cn("whitespace-pre", className)}>
        {shown}
        <span
          /* Sized in `em` so it tracks the fluid headline with no token of its
             own — it is a proportion of the type, not a fixed object. */
          style={{ width: "0.05em", height: "0.72em" }}
          className={cn(
            "ml-xxs inline-block translate-y-xxs bg-green-300",
            // Only blinks while the word rests. A caret that blinks WHILE
            // characters appear is the tell that it is an animation rather than
            // something being typed — real ones hold solid as you type.
            phase === "hold" && "animate-caret-blink",
          )}
        />
      </span>
    </>
  );
}
