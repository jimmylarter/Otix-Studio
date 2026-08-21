"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { Arrow, Cta } from "@/components/Cta";
import { Eyebrow } from "@/components/Eyebrow";
import { OptionCard } from "@/components/OptionCard";
import { QuizStepper } from "@/components/QuizStepper";

/**
 * Quiz — the WhyOtix panel. Figma: `Article Card` (36:266) — a 1320 × 650 card with
 * a 470-wide image and an 840-wide panel that the frame leaves EMPTY. The shell is
 * exported; everything inside it is designed to the system (COMPONENTS.md).
 *
 * Five questions → the reveal. Six screens in one fixed-height card.
 *
 * ── WHAT THIS IS FOR ──────────────────────────────────────────────────────────
 * **It is an explorer, not a lead form.** Jimmy's words, 13 Aug: "I just want to
 * make it easier for the user to explore options." Everything below follows from
 * that, and it is the thing to check any proposed change against.
 *
 * So: **no email step, no gate, nothing withheld.** An earlier build had one, with
 * the result blurred behind it. It was cut, and it should stay cut — a gate is what
 * you build when the address is the goal. Here the goal is that someone leaves
 * understanding which package fits them, whether or not you ever hear from them.
 * Adding a capture step back in would not be an enhancement, it would change what
 * the component is for.
 *
 * It also means **abandoning is not failure.** Someone who answers two questions,
 * sees the shape of the thing and scrolls on has been helped. Optimise for the
 * answers being easy to change, not for finishing.
 *
 * ── Decisions worth not re-litigating ─────────────────────────────────────────
 *
 * **The card height never changes.** `h-quiz` at `lg`+ (see tailwind.config.ts).
 * Six screens of different lengths in an auto-height panel means the card grows
 * and shrinks under the cursor on every step, and nothing makes a flow look cheaper.
 *
 * **Pointer/Enter selection auto-advances; arrow keys do not.** A keyboard user
 * arrowing through four options would be thrown to the next screen on the first
 * press. Arrow keys move and select in place (the platform behaviour for radios);
 * only a deliberate activation advances, after a 320ms beat so the selected state
 * is actually seen. Going back is always available.
 *
 * **It recommends REAL pricing tiers** — Spark/Studio/Summit for websites,
 * Pulse/Forge for apps and dashboards. The brief named Pulse/Forge/Orbit, but Pulse
 * and Forge already mean something else in the Pricing section and Orbit does not
 * exist; a quiz that contradicts the price list three sections down is worse than
 * no quiz. Decided 13 Aug.
 *
 * ── Motion ────────────────────────────────────────────────────────────────────
 * The outgoing screen LEAVES on a transition; the incoming one ARRIVES on a CSS
 * animation keyed to the step index (`animate-step-in-up` / `-down`), so it always
 * comes from the side the previous screen did not go towards.
 *
 * ⚠️ The arrival is an animation and not a transition, and that is not a style
 * preference. A transition needs the element painted in a start state and then
 * changed, which from React means scheduling the change inside a
 * `requestAnimationFrame` — and rAF does not fire in a backgrounded tab. The first
 * build did exactly that and left the panel permanently blank the moment focus
 * moved elsewhere mid-step. An animation runs on mount, unconditionally.
 *
 * Every duration and easing is an existing token; the brief asked for no new ones
 * and there are none. The two JS timings below are the ONLY numbers, and they are
 * a mirror of `duration-fast` and a deliberate beat — see the constants.
 */

/* ─── Types. Exported because `content/content.ts` types itself against them, so a
       shape change is a compile error rather than a runtime surprise. ─────────── */

/** Which set of step-3 wording (and which tier ladder) a visitor is on. */
export type QuizBranch = "website" | "webapp" | "dashboard" | "unsure";

/** The real pricing tiers. ⚠️ Must stay in sync with `content.pricing`. */
export type QuizTierId = "spark" | "studio" | "summit" | "pulse" | "forge";

export interface QuizOption {
  id: string;
  label: string;
  description?: string;
  /** Slots into the reveal sentence at this step's placeholder. */
  phrase: string;
  /** Step 1 only — chooses the step-3 wording and the tier ladder. */
  branch?: QuizBranch;
  /** Step 3 only — the tier this scope maps to. */
  tier?: QuizTierId;
}

export interface QuizQuestion {
  /** Also the placeholder name in `reveal.lead`, e.g. `{build}`. */
  id: string;
  question: string;
  help?: string;
  options: QuizOption[];
}

export interface QuizTier {
  id: QuizTierId;
  /** The short name, e.g. "Studio" — matches the Pricing card's eyebrow. */
  tier: string;
  /** The product name, e.g. "The Growth Engine". */
  name: string;
  /** ⚠️ Upper bounds are estimates and need sign-off — see content/content.ts. */
  range: string;
  summary: string;
}

export interface QuizContent {
  /**
   * Fixed order. `scope` resolves through the branch set by `build`.
   * ⚠️ The FIRST question is the opening screen — there is no separate start
   * card any more (13 Aug). A "click here to begin answering questions" screen is
   * a toll booth in front of the thing itself; showing question 1 immediately is
   * both one fewer click and a clearer offer.
   */
  order: string[];
  questions: Record<string, QuizQuestion>;
  scope: Record<QuizBranch, QuizQuestion>;
  reveal: {
    eyebrow: string;
    /** Placeholders are step ids: "You're {starting} {build}, {driver}, {timeline}." */
    lead: string;
    rangeLabel: string;
    cta: { label: string; href: string };
    secondary: { label: string; href: string };
    restart: string;
  };
  tiers: Record<QuizTierId, QuizTier>;
  /** One per screen, in order: the five questions, then the reveal. */
  images: string[];
  /**
   * ⚠️ NO LONGER RENDERED (13 Aug). It was the "Or just email us" link, live on every
   * screen. Kept in the TYPE and in `content.ts` rather than deleted, because it is a
   * brief-level decision that may be reversed — see the note on the foot row. Nothing
   * reads it; if it is still unused at launch, delete the field, the type and the
   * content together.
   */
  escape: { label: string; href: string };
  /**
   * The back control's accessible name. ⚠️ It has no VISIBLE label any more — the
   * control is an icon in the panel's top-right corner — but the authored word is
   * still what a screen reader announces, rather than something invented in the
   * component.
   */
  back: string;
  /** Template for the stepper's `aria-valuetext`, e.g. "Step {n} of {total}". */
  progressLabel: string;
}

export interface QuizProps {
  content: QuizContent;
  /**
   * Fires when the last question is answered. Optional, and nothing depends on it.
   *
   * ⚠️ This is an ANALYTICS hook, not a submission — the quiz deliberately collects
   * no contact detail (see the note at the top of this file). If it is ever wired
   * up, the useful question it can answer is "which tiers do people land on, and
   * where do they stop", which tells you whether the *pricing* is legible. It is
   * not a lead feed and should not be turned into one.
   */
  onComplete?: (payload: { tier: QuizTierId; answers: Record<string, string> }) => void;
  className?: string;
}

/**
 * Mirror of `duration-fast` (180ms). The exit has to finish before the content
 * swaps, and CSS cannot tell React when that is.
 * ⚠️ Change this and `duration-fast` together or the swap lands mid-animation.
 */
const EXIT_MS = 180;

/**
 * The beat between choosing and moving on. Not a token, because it is not a
 * transition — it is the pause that lets you SEE what you picked. Below ~250ms the
 * selected state never registers; above ~450ms it feels broken.
 */
const ADVANCE_MS = 320;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Quiz({ content, onComplete, className }: QuizProps) {
  /** 0..4 = the five questions · 5 = the reveal. Question 1 IS the opening screen. */
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const [direction, setDirection] = useState<1 | -1>(1);
  const [answers, setAnswers] = useState<Record<string, QuizOption>>({});

  const pending = useRef<number | null>(null);
  const advanceTimer = useRef<number | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  /** Blocks the focus-on-step-change from stealing focus on first paint. */
  const started = useRef(false);

  const QUESTION_COUNT = content.order.length;
  /** The reveal sits directly after the last question — no email gate (13 Aug). */
  const REVEAL_STEP = QUESTION_COUNT;
  const TOTAL_STEPS = QUESTION_COUNT;

  const branch: QuizBranch = (answers.build?.branch ?? "unsure") as QuizBranch;

  /** The five questions, with `scope` resolved through the branch. */
  const questions = useMemo(
    () => content.order.map((id) => (id === "scope" ? content.scope[branch] : content.questions[id])),
    [content, branch],
  );

  const tier = useMemo(() => {
    const id = answers.scope?.tier;
    return id ? content.tiers[id] : null;
  }, [answers.scope, content.tiers]);

  /** "You're rebuilding a marketing website, as you grow, on a 1–3 month timeline." */
  const lead = useMemo(
    () =>
      content.reveal.lead.replace(/\{(\w+)\}/g, (whole, key: string) => answers[key]?.phrase ?? whole),
    [content.reveal.lead, answers],
  );

  const go = useCallback(
    (next: number, dir: 1 | -1) => {
      if (next === index || phase !== "in") return;
      started.current = true;
      if (prefersReducedMotion()) {
        setIndex(next);
        return;
      }
      setDirection(dir);
      pending.current = next;
      setPhase("out");
    },
    [index, phase],
  );

  /* The exit. Once it has played, the content swaps and the incoming screen plays
     its own mount animation — there is no third phase to get stuck in. */
  useEffect(() => {
    if (phase !== "out") return undefined;
    const t = window.setTimeout(() => {
      if (pending.current !== null) setIndex(pending.current);
      pending.current = null;
      setPhase("in");
    }, EXIT_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  /* Move focus to the new screen's heading. Without this a keyboard or screen
     reader user advances and focus stays on a button that no longer exists, which
     drops them back at the top of the document. */
  useEffect(() => {
    if (!started.current) return;
    headingRef.current?.focus();
  }, [index]);

  useEffect(() => () => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
  }, []);

  const answer = useCallback(
    (question: QuizQuestion, option: QuizOption, advance: boolean) => {
      setAnswers((prev) => {
        const next = { ...prev, [question.id]: option };
        // ⚠️ Changing the build type invalidates the scope answer — its options
        // belong to the old branch and its `tier` points at the wrong ladder.
        if (question.id === "build" && prev.build?.branch !== option.branch) delete next.scope;
        return next;
      });
      if (!advance) return;
      /* The last answer completes the quiz. Fired HERE rather than on the reveal
         rendering, so it runs exactly once per completion — a reveal that can be
         reached again with Back would otherwise report twice. */
      if (index === QUESTION_COUNT - 1) {
        const payload = { ...answers, [question.id]: option };
        onComplete?.({
          tier: (option.tier ?? payload.scope?.tier ?? "spark") as QuizTierId,
          answers: Object.fromEntries(Object.entries(payload).map(([k, v]) => [k, v.id])),
        });
      }
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
      advanceTimer.current = window.setTimeout(() => go(index + 1, 1), prefersReducedMotion() ? 0 : ADVANCE_MS);
    },
    [go, index, answers, onComplete, QUESTION_COUNT],
  );

  /* Roving arrow-key navigation for the radiogroup. Selects in place — it does NOT
     advance, or the first arrow press would throw a keyboard user off the screen. */
  const onGroupKeyDown = useCallback(
    (e: KeyboardEvent, question: QuizQuestion) => {
      const keys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"];
      if (!keys.includes(e.key)) return;
      e.preventDefault();
      const opts = question.options;
      const current = opts.findIndex((o) => o.id === answers[question.id]?.id);
      const from = current === -1 ? 0 : current;
      const next =
        e.key === "Home" ? 0
        : e.key === "End" ? opts.length - 1
        : e.key === "ArrowDown" || e.key === "ArrowRight" ? (from + 1) % opts.length
        : (from - 1 + opts.length) % opts.length;
      answer(question, opts[next], false);
      const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
      buttons?.[next]?.focus();
    },
    [answers, answer],
  );

  /* ─── Presentation ─────────────────────────────────────────────────────────── */

  /* The EXIT only. The entrance is the keyed animation on the inner wrapper below —
     see the note at the top of this file for why the two are different mechanisms. */
  const stepMotion =
    phase === "out"
      ? cn(
          "opacity-0 transition-reveal duration-fast ease-in-quart",
          direction === 1 ? "-translate-y-2xl" : "translate-y-2xl",
        )
      : "translate-y-0 opacity-100";

  /* `key` is what makes this replay: React tears the old node down and mounts a
     new one, and a CSS animation runs on mount. */
  const stepEnter = direction === 1 ? "animate-step-in-up" : "animate-step-in-down";

  /* Question 1 is index 0 — there is no start screen in front of it. */
  const question = index < QUESTION_COUNT ? questions[index] : null;
  const progress = Math.min(index + 1, TOTAL_STEPS);

  return (
    <div
      className={cn(
        // ⚠️ NO `group` here. `Cta` animates its badge on `group-hover`, and
        // Tailwind's `group-hover:` matches ANY ancestor carrying `.group` — not
        // the nearest one. A `group` on this card therefore fired the reveal's
        // "Book a call" animation whenever the pointer touched the panel, several
        // hundred pixels away. Nothing here needs it. (13 Aug)
        "relative isolate flex flex-col overflow-hidden rounded-2xl bg-neutral-0 p-xs shadow-elevated",
        "lg:h-quiz lg:flex-row",
        className,
      )}
    >
      {/* ── Media column ──────────────────────────────────────────────────────
          All eight images sit in the DOM because a cross-dissolve needs both
          frames present. They are 800px wide rather than 2x precisely because of
          that — total weight matters more than per-image sharpness here.

          The active image is fully saturated and at rest; the others are held
          slightly scaled and desaturated, so the picture RESOLVES as the flow
          advances instead of eight unrelated photos hard-cutting. The image
          carries the progress rather than decorating it.

          `aria-hidden` throughout — it is decoration and must stay removable
          (CLAUDE.md §5). */}
      <div
        aria-hidden="true"
        className={cn(
          "relative shrink-0 overflow-hidden rounded-xl",
          "h-quiz-media-sm w-full lg:h-quiz-media lg:w-auto lg:basis-quiz-media",
        )}
      >
        {content.images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            loading={i === 0 ? "eager" : "lazy"}
            className={cn(
              "absolute inset-0 size-full object-cover",
              "transition-dissolve duration-cinematic ease-smooth",
              i === index ? "opacity-100" : "opacity-0",
            )}
            style={{
              // Inline because these are computed from step position, not a fixed
              // set of classes — the same reason the Hero's glow sets `top`.
              filter: i === index ? "saturate(1.02)" : "saturate(0.82)",
              transform: i === index ? "scale(1)" : "scale(1.06)",
            }}
          />
        ))}
      </div>

      {/* ── Panel ─────────────────────────────────────────────────────────────
          `min-h-0` matters: a flex child defaults to `min-height: auto`, which
          refuses to shrink below its content and would push the panel past the
          fixed card height on the longest step instead of scrolling inside it. */}
      <div className="relative flex min-h-0 flex-1 flex-col justify-between gap-xl p-2xl lg:p-5xl">
        {/* ══ BACK, top-right ══════════════════════════════════════════════════
            ⚠️ AN ICON IN THE CORNER, NOT A TEXT LINK IN THE FOOT (Jimmy, 13 Aug).
            It went with the "Or just email us" link, and the two leaving together is
            what makes the foot work: a row holding a navigation control, a reset and
            an escape hatch was three unrelated jobs sharing one line.

            ⚠️ IT IS NOT A CLOSE BUTTON, and the arrow is what says so. `Arrow` from
            `Cta` rotated 180° — the same glyph every CTA on the site uses, pointing
            the other way. A cross here would read as "dismiss the quiz", which is a
            different and much more destructive action than "go back one question".

            ⚠️ `aria-label` carries `content.back`, so the accessible name is still the
            authored word rather than something invented here — the visible label went,
            the label did not.

            ⚠️ A CREAM DISC THAT TURNS GREEN, not the popup's bare-circle-on-hover
            (Jimmy, 13 Aug). The bare version was too quiet here: the popup's close sits
            on a dark panel where a white glyph carries itself, whereas this one is a
            grey arrow on a WHITE card, with nothing to separate it from the surface
            until you hover — which is the definition of a control you have to hunt for.

            `neutral-100` at rest is the PAGE colour, so the disc reads as a small piece
            of the page set into the card. Hover fills it `green-600` with a `neutral-0`
            arrow — the same inversion `Tag` and the Work cards use, so the gesture
            belongs to the site rather than to this component.

            Measured: arrow `ink-600` on `neutral-100` **6.19:1**, and `neutral-0` on
            `green-600` **7.61:1**. Both clear 4.5:1, so the control is legible in each
            state rather than only in one.

            ⚠️ IT SITS ON THE PANEL'S OWN PADDING (`2xl`/`5xl`), NOT in the corner —
            the opposite of the popup's choice, and deliberately so. The popup's close
            is pulled to 24 from the edges precisely so it does NOT line up with the
            reading column, because a close control belongs to the dialog rather than to
            its content. This one belongs WITH the question: same top line, far right of
            the same row (Jimmy, 13 Aug). Aligning it to the padding is what puts it on
            the title's line.

            ⚠️ The 50px target against the heading's ~48px line box is why the two look
            level rather than merely top-aligned. If the heading token changes size,
            check this again — they are related by coincidence of measurement, not by
            anything the layout enforces.

            `h-contact` (50) clears the 44px tap floor (CLAUDE.md §5).

            ⚠️ Hidden on step 1 — there is nowhere to go back TO — and present on the
            reveal, where it keeps the answers. That is the difference between a result
            and something you can explore: changing "within a month" to "one to three"
            should cost one click, not five. */}
        {index > 0 ? (
          <button
            type="button"
            onClick={() => go(index - 1, -1)}
            aria-label={content.back}
            className={cn(
              "absolute right-2xl top-2xl z-10 lg:right-5xl lg:top-5xl",
              "flex h-contact w-contact items-center justify-center rounded-full",
              "bg-neutral-100 text-ink-600 transition-colors duration-base ease-smooth",
              "hover:bg-green-600 hover:text-neutral-0",
              "focus-visible:shadow-focus focus-visible:outline-none",
            )}
          >
            {/* ⚠️ `icon-xl` (35).

                🔴 **PART OF THIS SIZE HUNT WAS CHASING A BUG, NOT A JUDGEMENT.** The
                run was 32 → 40 → 36 → 32 → 34 → 33 → 36 → 35, and the pass that set
                `h-icon-lg` (32) actually RENDERED AT 16: `Arrow` carried its own
                `h-icon-sm` base, `cn` is a plain join rather than `tailwind-merge`, and
                Tailwind emits `.h-icon-lg` before `.h-icon-sm` — so the smaller rule
                won on source order. "32 is too small" was really "16 is too small",
                which is why the bracketing kept converging on nothing. `Arrow` no
                longer carries a base size; see the note on it in `Cta`.

                The disc has stayed at 50 through all of it, because that is what keeps
                the control level with the heading's ~48px line box. The glyph is the
                only thing that has moved, which may itself be the reason this took five
                passes. */}
            <Arrow className="h-icon-xl w-icon-xl rotate-180" />
          </button>
        ) : null}

        {/* ⚠️ `justify-start`, and the spacer that used to sit above this is gone
            (13 Aug). The panel was three rows under `justify-between` — an empty
            spacer, the question centred in the middle row, then the foot — so the
            question floated in the vertical middle of the card and moved as its
            answers changed length.

            It now reads top-down: question at the top, `flex-1` taking the slack, and
            the stepper and controls pushed to the foot by `justify-between`. The
            question's position no longer depends on how tall its options are. */}
        <div className={cn("flex min-h-0 flex-1 flex-col justify-start", stepMotion)}>
          {/* ⚠️ `key={index}` is load-bearing, not a React lint appeasement: it is
              what remounts the screen so its entrance animation plays. Remove it
              and every step after the first arrives with no motion at all. */}
          <div key={index} className={cn("flex min-h-0 flex-col gap-xl", stepEnter)}>
          {/* ── Questions ─────────────────────────────────────────────────── */}
          {question ? (
            /* ⚠️ `gap-3xl` (32) between the question block and the options, against
               `gap-xl` (24) elsewhere in this card (Jimmy, 13 Aug). Deliberately
               asymmetric: the heading now runs at `text-service-title` (up to 40px), and
               a 24px gap under 40px type reads as the options being part of the
               question rather than the answer to it. The gap has to grow with the type
               above it or the hierarchy inverts. */
            <div className="flex min-h-0 flex-col gap-3xl">
              {/* ⚠️ `pr-7xl` RESERVES THE BACK BUTTON'S COLUMN. The control is
                  absolutely positioned, so it takes no space and a long question would
                  otherwise run underneath it. 120 = the 50px button plus clearance.

                  ⚠️ ALWAYS reserved, including on step 1 where there is no button. It
                  could be conditional, but then the FIRST question would wrap
                  differently from the other four and the title would re-flow the moment
                  you pressed back — a heading that changes shape as you navigate is
                  worse than one that is consistently a little narrower. */}
              <div className="flex flex-col gap-sm pr-7xl">
                <h3
                  ref={headingRef}
                  tabIndex={-1}
                  id={`quiz-q-${question.id}`}
                  /* ⚠️ `text-service-title` (28 → 40), up from `text-h4` (24 → 32) and
                     `text-h5` (22 → 26) before that. It is now the SERVICE CARD's
                     title token — the question and a service name sit at one rank
                     (Jimmy, 13 Aug), which is right: both are the head of a card the
                     reader is being asked to consider.

                     ⚠️ ONE RENDER SERVES ALL FIVE QUESTIONS, so this is the only place
                     the size lives — there is no per-question class to keep in step.

                     ⚠️ The REVEAL's heading below moved with it and must keep doing so.
                     The question and its answer are the same kind of thing at the same
                     size; letting one drift makes the reveal read as a different screen
                     rather than as the end of the same one. */
                  className="text-service-title text-ink-900 focus:outline-none"
                >
                  {question.question}
                </h3>
                {question.help ? (
                  <p className="max-w-measure text-body-sm text-ink-600">{question.help}</p>
                ) : null}
              </div>

              <div
                ref={groupRef}
                role="radiogroup"
                aria-labelledby={`quiz-q-${question.id}`}
                onKeyDown={(e) => onGroupKeyDown(e, question)}
                className="flex min-h-0 flex-col gap-md overflow-y-auto"
              >
                {question.options.map((option, i) => {
                  const selected = answers[question.id]?.id === option.id;
                  /* Roving tabindex: the selected option is the tab stop, or the
                     first one if nothing is chosen yet. */
                  const tabbable = selected || (!answers[question.id] && i === 0);
                  return (
                    <OptionCard
                      key={option.id}
                      label={option.label}
                      description={option.description}
                      selected={selected}
                      tabbable={tabbable}
                      onSelect={() => answer(question, option, true)}
                    />
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* ── Reveal ────────────────────────────────────────────────────── */}
          {index === REVEAL_STEP && tier ? (
            <div className="flex flex-col items-start gap-lg">
              <Eyebrow label={content.reveal.eyebrow} />
              {/* ⚠️ Tracks the QUESTION heading's token — see the note above. */}
              <h3 ref={headingRef} tabIndex={-1} className="text-service-title text-green-600 focus:outline-none">
                {tier.name}
              </h3>
              <p className="max-w-measure text-body-lg text-ink-900">{lead}</p>
              <p className="max-w-measure text-body text-ink-600">{tier.summary}</p>

              <div className="flex flex-col gap-xxs">
                <span className="font-mono text-eyebrow uppercase text-ink-500">
                  {content.reveal.rangeLabel}
                </span>
                <span className="text-stat-value text-ink-900">{tier.range}</span>
              </div>

              <div className="flex flex-wrap items-center gap-base">
                <Cta label={content.reveal.cta.label} href={content.reveal.cta.href} tone="ink" />
                <a
                  href={content.reveal.secondary.href}
                  className="rounded-sm text-body-sm-strong text-green-600 underline underline-offset-4 transition-colors duration-base ease-smooth hover:text-green-700 focus-visible:shadow-focus focus-visible:outline-none"
                >
                  {content.reveal.secondary.label}
                </a>
              </div>
            </div>
          ) : null}
          </div>
        </div>

        {/* ⚠️ THE STEPPER IS THE LAST THING IN THE CARD (13 Aug). It went above the
            question → above the back/skip row → **below it**, at the very bottom.

            🔴 ⚠️ `order-last` MOVES IT VISUALLY WITHOUT MOVING IT IN THE DOM, and that
            separation is the whole reason this is a wrapper rather than a re-ordered
            JSX block. Flex `order` affects paint order only; screen readers and the
            tab sequence follow DOM order. So it is still announced BEFORE the controls
            that change it — "step 2 of 5", then Back / Start again — which is the order
            that makes sense when you cannot see the layout. **Do not "tidy" this by
            moving the element down in the source; that would sink the progress
            announcement below the buttons.**

            ⚠️ It has no `gap` of its own — the column's `gap-xl` handles it — so the
            foot row and the bar sit on the same rhythm as everything above them.

            Hidden on the reveal: that screen is the result, not a step. */}
        {index < REVEAL_STEP ? (
          <div className="order-last">
            <QuizStepper
              current={progress}
              total={TOTAL_STEPS}
              valueText={content.progressLabel
                .replace("{n}", String(progress))
                .replace("{total}", String(TOTAL_STEPS))}
            />
          </div>
        ) : null}

        {/* ── Foot: START AGAIN, and nothing else ───────────────────────────
            ⚠️ IT LOST TWO OF ITS THREE OCCUPANTS ON 13 Aug (Jimmy). `Back` became the
            corner icon above; the "Or just email us" escape link was removed outright.

            Losing the escape link is a real change, not a tidy-up: the original brief
            asked for it on every screen, and the reasoning was that someone who does
            not want to answer questions should always have a way out. It is a
            deliberate reversal — the quiz already ends in a CTA, the section sits above
            a contact form, and a permanent mailto competing with the primary action on
            all six screens was reading as an apology for the quiz existing.

            ⚠️ `content.escape` is now unused. Left in `content.ts` for the moment
            rather than deleted, because it is the kind of thing that comes back — see
            CMS_READINESS.

            ⚠️ The row only renders on the REVEAL now, so it is conditional rather than
            always-present-and-sometimes-empty. An empty flex row still consumes the
            column's `gap-xl`, which put phantom space under every question screen. */}
        {index === REVEAL_STEP ? (
          <div className="flex flex-wrap items-center gap-base">
            {/* The clean slate, as against `Back`'s "change one answer". Both exist
                because they are genuinely different intentions. */}
            <button
              type="button"
              onClick={() => {
                setAnswers({});
                go(0, -1);
              }}
              className="rounded-sm text-body-sm text-ink-600 underline underline-offset-4 transition-colors duration-base ease-smooth hover:text-ink-900 focus-visible:shadow-focus focus-visible:outline-none"
            >
              {content.reveal.restart}
            </button>
          </div>
        ) : null}
      </div>

      {/* Announces the new screen. Without it a screen reader user hears nothing
          when the panel swaps — the heading gets focus, but focus alone does not
          announce that the surrounding content changed. */}
      <p aria-live="polite" className="sr-only">
        {question ? question.question : `${content.reveal.eyebrow}: ${tier?.name ?? ""}`}
      </p>
    </div>
  );
}
