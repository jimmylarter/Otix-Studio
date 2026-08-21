/**
 * Homepage content. Copy is verbatim from Figma (testimonials excepted, written
 * fresh). This is the single source the section components read from — it maps
 * 1:1 to the Sanity schemas later (see CMS_READINESS.md). No layout logic here.
 *
 * ── D8 pass: reshaped to match the v2 component props ─────────────────────────
 * This file was written for v1 and its shapes had drifted from the components
 * built in D4. CMS_READINESS.md §3 listed every mismatch; all of them are fixed
 * here. The COPY is unchanged — this was a restructure, not a rewrite.
 *
 * What changed, and why it matters when reading git:
 *   · every heading is now `HeadingSegment[]` — one shape, not three
 *   · `services.rows` (3) + `services.features` (3) merged into `panels` (6)
 *   · pricing tiers renamed to the `TierCard` props, and the separate `excluded`
 *     array folded INTO `features` so the designed row order survives
 *   · `body` → `description` wherever it feeds a Card
 *   · `process.steps` cut 6 → 4 (see the note there)
 *   · cut sections moved out of `content` entirely, to `cutFromV2` at the bottom
 *
 * `HeadingSegment` is imported from the component ON PURPOSE. It is a type-only
 * import, erased at build, and it makes the prop shape enforce itself here at
 * compile time rather than being a convention someone has to remember.
 */
import type { HeadingSegment } from "@/components/SectionHeader";
import type { QuizContent } from "@/components/Quiz";
import type { IconName } from "@/components/Icon";
import type { ContactIcon } from "@/components/ContactRow";

/** A heading with no italic accent — still a segment array, just one segment. */
const plain = (text: string): HeadingSegment[] => [{ text }];

export const content = {
  nav: {
    links: [
      { label: "About", href: "#about" },
      { label: "Work", href: "#work" },
      { label: "Services", href: "#services" },
      { label: "Process", href: "#process" },
      { label: "Pricing", href: "#pricing" },
      // ⚠️ The FAQs link is GONE — that section is cut from v2 (CLAUDE.md §3).
      // It was still here and would have scrolled to nothing.
    ],
    cta: { label: "Let's Chat", href: "#contact" },
  },

  hero: {
    eyebrow: "All-In-One Design Studio",
    // Was `{ pre, highlight, post }` — now the same segment array as every other
    // heading, so `SectionHeader` renders it with no special case.
    heading: [
      { text: "We build things that work " },
      { text: "harder", accent: true },
      { text: " than you do." },
    ] as HeadingSegment[],
    /**
     * The accent slot types and deletes through these on a loop.
     * ⚠️ `[0]` MUST stay "harder" — it is the resting word: what renders on the
     * server, on first paint, and under reduced motion, and what the Figma frame
     * shows. Reordering this list changes the design's static state.
     */
    accentWords: ["harder", "smarter", "faster"],
    subhead:
      "Otix Studio's designs and builds intelligent, bespoke websites and apps for ambitious businesses — powered by AI, built to convert.",
    cta: { label: "Start Project", href: "#about" },
    /**
     * The row across the bottom of the hero — Figma `Footer Container` (36:81).
     * ⚠️ **NOT CURRENTLY RENDERED** (removed 12 Aug, Jimmy's call). Kept because
     * it is in the design and reinstating it is markup only.
     *
     * Stored in natural case and uppercased by the component, which is the same
     * pattern `nav.links` uses. The email is deliberately duplicated from
     * `footer.contacts[0]`; they are two separate placements of one address, and
     * a CMS should be able to change one without the other.
     */
    scroll: { label: "Lets have a scroll", href: "#about" },
    email: { label: "hello@otix.studio", href: "mailto:hello@otix.studio" },
    /**
     * Two sets of footage live in `public/media`, and this is the ONLY line that
     * chooses between them:
     *   `background.*` — supplied 12 Aug, 1.0MB. **Currently in use.**
     *   `hero.*`       — the original (13 Jul), 5.7MB.
     * Swapping is these three paths and nothing else.
     */
    media: {
      poster: "/media/background-poster.jpg",
      mp4: "/media/background.mp4",
      webm: "/media/background.webm",
    },
    /**
     * `HeroArch` takes images and nothing else — it is `aria-hidden` decoration.
     * This was `projects[]` carrying tag/title/body/href for a carousel that no
     * longer exists. Five, because the desktop arch is five cards.
     */
    archImages: [
      "/media/work/arch-01.webp",
      "/media/work/arch-02.webp",
      "/media/work/arch-03.webp",
      "/media/work/arch-04.webp",
      "/media/work/arch-05.webp",
    ],
  },

  about: {
    eyebrow: "About Otix",
    /**
     * Verbatim from the v2 frame, including its two authored line breaks — the
     * accent lands on its own third line. Rendered via `whitespace-pre-line`.
     * (v1's "Design. Build. Dominate." is retired.)
     */
    heading: [
      { text: "We don’t just build\nwebsites. We build\n" },
      { text: "growth engines.", accent: true },
    ] as HeadingSegment[],
    body: "Otix Studio is a boutique design and build studio that believes every business deserves digital tools that work as hard as they do. Websites that win customers. Apps that keep them. Dashboards that show you what's actually going on — all designed properly, built cleanly, and sharpened with AI.",
    /**
     * `pills` and `image` are GONE from v2 — the six-pill row is not in the
     * design, and the chart replaced the photo. Removed rather than left unused,
     * so no schema is written around dead fields.
     *
     * Illustrative figures, not real analytics. `StatChart` DERIVES the headline
     * percentage from the first and last `Visitors` value, so these numbers and
     * the badge can never contradict each other — edit the values and the
     * percentage follows.
     */
    chart: {
      caption:
        "Bar chart showing visitors and interactions rising month on month from January to July — visitors up 533%.",
      /**
       * The stat disc. ⚠️ AUTHORED, not derived from `series`.
       *
       * It used to be computed from the first and last Visitors value (which gives
       * +533%), so it could never contradict the bars. Jimmy asked for 60%, so it
       * is a content field now — which means **it is on us to keep it sensible if
       * the series changes.** The figures are illustrative either way; if they ever
       * become real numbers, derive this again.
       */
      stat: { value: 60, suffix: "%", label: "growth" },
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      /** First series is the primary one: it drives the trend line and the stat. */
      series: [
        { label: "Visitors", values: [120, 190, 245, 310, 425, 580, 760] },
        { label: "Interactions", values: [85, 140, 195, 260, 350, 490, 660] },
      ] as [{ label: string; values: number[] }, { label: string; values: number[] }],
    },
  },

  /**
   * ⚠️ RE-POINTED 13 Aug, from Figma `BANNER - 1` (36:232).
   *
   * This is no longer a case-study band. It now carries the copy that used to head
   * the WhyOtix section — "Most visitors decide in 3 seconds…" and the "things that
   * think" body — because WhyOtix's header became the quiz's invitation and this
   * copy had nowhere left to live. Nothing was written fresh; it moved.
   *
   * ⚠️ The title carries an AUTHORED LINE BREAK and needs both lines. `Card`
   * renders it with `whitespace-pre-line` for exactly this. On one line at 1440 it
   * runs past the scrim's readable area and sits on the bright half of the photo.
   *
   * Side effect worth knowing: banner 1 and banner 2 are no longer near-identical
   * Veda Studio bands, which was the loudest of the repeated placeholder copy.
   * Banner 2 is still holding copy.
   */
  /**
   * ⚠️ RESTORED 13 Aug, and it moved: it used to sit between Services and WhyOtix,
   * and now sits between **About and Work**. The removal note is worth keeping —
   * it was cut because the quiz became panel 07 of the Services reel and inherited
   * this banner's image, so a full-bleed banner and a full-bleed quiz card two
   * sections apart were two interruptions where the page needed one. Moving it up
   * the page resolves that: it is now nowhere near the reel.
   *
   * ⚠️ IT NO LONGER USES `img-10`. That asset is the quiz panel's background now, and
   * the same photograph twice on one page reads as a shortage of pictures rather than
   * as a motif. `img-12` is unused elsewhere — check that before changing it.
   */
  banner1: {
    image: "/media/work/img-12.webp",
    tag: "Web Design",
    title: "Most visitors decide in 3 seconds.\nWe make sure those 3 seconds count.",
    description:
      "Most studios build things that look good. We build things that think. Every Otix project ships with AI woven into the foundation — capturing leads, answering customers, and crunching your numbers while you get on with running the business.",
    href: "#work",
  },

  banner2: {
    image: "/media/work/img-11.webp",
    tag: "Web Design",
    title:
      "A website is your hardest-working\nemployee. An app is your second.\nNeither asks for annual leave.",
    description:
      "It answers at 2am, works every weekend, and never has an off day. Build it properly once — the right structure, honest copy, AI handling the repetitive parts — and it keeps selling, booking and answering long after everyone else has clocked off.",
    href: "#work",
  },

  /**
   * ⚠️ PANELS 01–03 WERE CUT TO ROUGHLY HALF LENGTH (13 Aug, Jimmy's call), so their
   * cards sit closer in height to 04–06 on the orbit. Nothing was dropped in meaning
   * — every claim in the long versions survives — but the qualifying clauses did:
   * "clean modern code that Google and your customers both love", the list of things
   * a dashboard might track, "the six-month quote you got elsewhere", "the
   * boring-but-critical stuff".
   *
   * ⚠️ THIS BREAKS CLAUDE.md §2's "verbatim from Figma" rule for these three, and
   * that is deliberate rather than drift. The Figma frames still carry the long copy;
   * if the file is ever re-exported these three will look like regressions. Panels
   * 04–06 are untouched and still match.
   */
  services: {
    /**
     * ⚠️ NOW RENDERED (13 Aug). Figma's `SERVICES TITLE` (170:2705) was built and
     * reverted earlier the same day; it is back, above the pinned reel.
     *
     * ⚠️ ONE SEGMENT, NO ITALIC ACCENT, and an AUTHORED break after "Everything you"
     * — both taken from the frame rather than from the site's pattern. That makes
     * Services the ONLY section header on the page without an accent word, which was
     * flagged as a deliberate choice when the frame was first measured at 2600px.
     * The accented version, if it is ever wanted back:
     *   [{ text: "Everything you need to " }, { text: "win online", accent: true }]
     */
    eyebrow: "Services",
    heading: [{ text: "Everything you\nneed to win online." }] as HeadingSegment[],
    body: "We work with small and growing businesses across hospitality, wellness, trades and e-commerce. Whether you need a full bespoke build, a dashboard to replace the spreadsheet graveyard, or an app your customers will actually open — Otix exists to give you an unfair advantage online.",
    /** Sits under the body in the header's right column, as `split` does elsewhere. */
    cta: { label: "Start Project", href: "#contact" },
    /**
     * Every panel shows the same eyebrow, so it is ONE field rather than the same
     * word repeated six times (CMS_READINESS.md §1.5 — one field per idea).
     */
    /**
     * ⚠️ `panelEyebrow: "Services"` WAS HERE AND IS GONE (13 Aug). It labelled the
     * mobile carousel strip, sitting 28px below a `SectionHeader` that already carries
     * the same eyebrow — two eyebrows for one section. It predated the header being
     * added to that branch and nobody removed it afterwards.
     *
     * ⚠️ `icon` went from each panel at the same time. Neither branch renders a service
     * glyph now: desktop dropped its icon column when the cards gained images, and
     * mobile followed when it moved to the same `ServiceCard`. `SERVICE_ICONS` still
     * exists in `Icon.tsx` — only the per-service binding is gone.
     */
    /**
     * The six services. v1 split these across `rows` (3 full-width divider rows)
     * and `features` (3 cards) — two different layouts. v2 makes them six panels
     * of one kind, so they are one list, in the Figma panel order 01→06.
     *
     * The three former `features` had a single-string body; they are arrays now
     * because `ServicePanel.body` is `string[]`. Copy is untouched.
     *
     * `image` is dropped — v2 uses a stroked icon instead. `icon` values are
     * `SERVICE_ICONS` in this exact order.
     */
    /**
     * ⚠️ `tags` AND `image` ARE WRITTEN IN BUILD, not exported from Figma (13 Aug).
     * Every other string in this section is verbatim from the frames; these two are
     * not, and the distinction matters when the file is next reconciled.
     *
     * ⚠️ `question`, ONE PER CARD, REPLACED A LIST OF CATEGORY TAGS (Jimmy, 13 Aug).
     * The pills were "Web Design" / "AI" — descriptors drawn from each service's own
     * copy. They are now a single QUESTION in the reader's words, above a title in the
     * studio's: "Still running it on spreadsheets?" over "Apps & Dashboards".
     *
     * The reason it is better is that a category pill tells you what the card is filed
     * under, which you can already see from the title underneath it. A question tells
     * you whether the card is about YOU, which the title cannot.
     *
     * ⚠️ ONE, not a list, and the field is singular so it cannot quietly become a list
     * again. Two questions stacked would be two competing hooks.
     *
     * ⚠️ VARY THE OPENING. They read as a set down a single column, so six questions
     * all starting "Launching…" would land as a template rather than as six different
     * problems. Current openers: Launching / Still / Ready / Not / Outgrown / Site.
     *
     * A CMS field rather than a hard-coded map, so it can be reworded without a deploy.
     *
     * ⚠️ THE IMAGES ARE THE QUIZ'S OWN STEP RENDERS, reused. That puts the same six
     * pictures in two places on one page — the Services cards and the quiz's media
     * column — which is a known cost, taken because they are the abstract set the
     * concept shows and no services-specific imagery exists. `step-07` and `step-08`
     * are unused if a seventh is ever needed.
     */
    panels: [
      {
        title: "Web Design & Development",
        question: "Launching a new business?",
        image: "/media/quiz/step-01.webp",
        body: [
          "Custom-designed, fast-loading, SEO-ready websites that make your business the obvious choice. No templates, no page builders creaking at the seams.",
          "Mobile-first, quick to load, and a CMS you can actually use. You own all of it, forever.",
        ],
      },
      {
        title: "Apps & Dashboards",
        question: "Still running it on spreadsheets?",
        image: "/media/quiz/step-02.webp",
        body: [
          /**
           * ⚠️ ONE PARAGRAPH — the second was cut on 13 Aug: "Customer-facing ideas
           * too — built to grow, delivered in weeks, with AI woven in where it earns
           * its keep."
           *
           * ⚠️ That line carried the ONLY mention of AI in the Services section, and
           * AI is in the hero's sub-copy and the pricing tiers. Worth knowing if the
           * section is ever reviewed for whether it says enough about it.
           */
          "Running the business out of seventeen spreadsheets and a group chat? We build web apps and dashboards that put it all on one clean screen.",
        ],
      },
      {
        title: "E-Commerce Builds",
        question: "Ready to start selling online?",
        image: "/media/quiz/step-03.webp",
        body: [
          /**
           * ⚠️ ONE PARAGRAPH, not two. The second — "We handle payments and shipping
           * logic, on a stack that won't fall over on your biggest sales day." — was
           * cut on 13 Aug.
           *
           * `ServicePanel` renders `body` as one `<p>` per entry, so a single-item
           * array is a supported shape and needs no special case. This is the only
           * panel with one; if a second is ever wanted back, add a string rather than
           * folding it into the first with a full stop.
           */
          "Online stores built to sell: smooth checkout, easy product management, and a design that isn't another off-the-shelf theme.",
        ],
      },
      {
        title: "SEO & Analytics",
        question: "Not showing up on Google?",
        image: "/media/quiz/step-04.webp",
        body: [
          "Being invisible on Google is a hobby, not a business. Every build ships with SEO foundations and analytics wired in — so you can see what's working and double down on it.",
        ],
      },
      {
        title: "Brand Identity",
        question: "Outgrown your first logo?",
        image: "/media/quiz/step-05.webp",
        body: [
          "Logo, colours, type, tone of voice. The full kit, so everything you put into the world looks like it came from the same (very good) place.",
        ],
      },
      {
        title: "Retainer & Support",
        question: "Site been left to fend for itself?",
        image: "/media/quiz/step-06.webp",
        body: [
          "Updates, backups, tweaks, and “hey, can you just quickly…” requests. We stick around after launch — from $99/month, with a real human answering the emails.",
        ],
      },
    ],
  },

  work: {
    eyebrow: "Our Work",
    /** Three lines, authored breaks — the accent sits alone on the third. */
    heading: [
      { text: "Websites, apps and\ndashboards we’ve\n" },
      { text: "delivered.", accent: true },
    ] as HeadingSegment[],
    body: "Websites that win customers, apps that keep them, dashboards that show the whole picture. Every build is designed properly, coded cleanly and sharpened with AI where it earns its keep. Click through, be nosy, and picture your project in the lineup.",
    cta: { label: "Start Project", href: "#contact" },
    featured: {
      image: "/media/work/img-06.webp",
      tag: "E-Commerce",
      title: "Aura Supplements",
      description:
        "Full e-commerce store with AI product recommendation quiz, subscription model, and editorial brand identity — built to turn first-time browsers into loyal, repeat customers.",
      href: "#work",
      stats: [
        { value: "+68%", label: "Conversion rate" },
        { value: "+$42", label: "Avg order value" },
        { value: "6 wks", label: "To launch" },
      ],
    },
    tall: {
      image: "/media/work/img-07.webp",
      tag: "Restaurant",
      title: "Miso Kitchen",
      description: "Restaurant site with AI booking, digital menu, and staff training chatbot.",
      href: "#work",
      stats: [{ value: "+210%", label: "Direct bookings" }],
    },
    /**
     * ⚠️ TWO, not three. The v2 frame shows four cards total — featured + `tall`
     * on the first row, then two full-width-half cards on the second. v1 carried a
     * third here that the design has no slot for; dropped rather than left unused.
     */
    grid: [
      /**
       * ⚠️ These descriptions are written to run to TWO lines, and the length is
       * the point — a one-line body left the copy panel looking half-empty against
       * the taller `equal` image band. `max-w-measure` (68ch) is what wraps them,
       * NOT the card width, so the break point is the same at every viewport above
       * `lg`. Roughly 80–140 characters holds two lines; below ~70 it collapses
       * back to one. Worth knowing before anyone edits this in the CMS.
       */
      { image: "/media/work/img-08.webp", tag: "Restaurant", title: "Veda Wellness Studio", description: "Studio website with AI class scheduling, a member portal and automated waitlists — so classes fill themselves and the front desk stops chasing.", href: "#work" },
      { image: "/media/work/img-09.webp", tag: "Restaurant", title: "Veda Wellness Studio", description: "Studio website with AI class scheduling, a member portal and automated waitlists — so classes fill themselves and the front desk stops chasing.", href: "#work" },
    ],
  },

  whyOtix: {
    /**
     * ⚠️ REPOINTED 13 Aug. This section is no longer a general "why us" pitch — it
     * is the quiz, and its header is the quiz's invitation. The header now does the
     * job the quiz's own start screen used to do, which is exactly why that screen
     * could be cut: saying "not sure what you need?" twice, forty pixels
     * apart, was the reason it read as a toll booth.
     *
     * ⚠️ NO CTA. Removed deliberately — the card directly below IS the call to
     * action, and a "Start Project" button above it competes with the thing it is
     * introducing. Every other section keeps its CTA; this one has something better.
     *
     * Previous copy, if it is ever wanted back: eyebrow "Why Otix Studio", heading
     * "Most visitors decide in 3 seconds. / We make sure those 3 seconds count."
     * (v1's `quote1`, promoted), with the "Most studios build things that look
     * good" body and a Start Project CTA.
     */
    eyebrow: "Find your fit",
    /**
     * ⚠️ "which package" → "what" (13 Aug). The literal swap would have left "Not
     * sure which what you need?", so "which" goes with it — the sentence needs both
     * words or neither.
     *
     * It also broadens the question, which suits where this now sits: the quiz asks
     * what you are building before it ever mentions a tier, so leading with
     * "package" named the answer before the question.
     */
    heading: plain("Not sure what you need?"),
    /**
     * ⚠️ "Five" must match `quiz.order.length`. It said six for one commit after the
     * email step was cut — a number in body copy that counts something structural is
     * a promise, and this is the one place it can silently go stale. If a question
     * is ever added or removed, this sentence changes with it.
     */
    body: "Five quick questions and I'll tell you where I'd start you, what it's likely to cost, and why. No sales pitch until you ask for one — just an honest read on what your project actually needs, and a realistic idea of the budget it takes to build it properly.",
    /**
     * ⚠️ The two reused Work cards that used to sit here are GONE (13 Aug). They
     * were `content.work.tall` and `content.work.featured` rendered a second time,
     * which meant a visitor met the same two projects twice on one page. The Figma
     * frame now draws a single 1320 × 650 card in their place — see `quiz` below.
     */

    /**
     * ⚠️ INHERITED FROM THE DELETED `banner1` (13 Aug) — same asset, new job. It is
     * the background of panel 07 in the Services reel, frosted while the panel is a
     * card and clear once it expands.
     *
     * ⚠️ DECORATIVE, and it must stay that way (CLAUDE.md §5): the panel's heading
     * and the quiz carry all the meaning, so the image can be removed without the
     * section losing anything. That is also why it has no `alt` in the props — it
     * is a background, not content.
     */
    image: "/media/work/img-10.webp",
  },

  /**
   * ── The recommendation quiz ─────────────────────────────────────────────────
   * Lives inside WhyOtix, in the card Figma draws at 36:266 (image left, empty
   * panel right). Eight screens: a start, five questions, an email step, a reveal.
   *
   * ⚠️ IT RECOMMENDS THE REAL PRICING TIERS. The brief asked for Pulse / Forge /
   * Orbit as a three-rung ladder, but on this site Pulse and Forge are the *Apps &
   * Dashboards* tiers ($6,000 and $15,000) and Orbit does not exist at all. A quiz
   * that recommends "Forge" for a small website points at the $15,000 Web App card
   * three sections further down. So the ladders here are the ones in
   * `content.pricing`, and nothing else:
   *
   *   Websites            Spark → Studio → Summit
   *   Apps & Dashboards   Pulse → Forge          ← only TWO rungs
   *
   * Because the app ladder has two rungs and each step-3 question has three
   * buckets, two of the app buckets legitimately land on the same tier. That is
   * the pricing being honest, not a mapping bug — do not invent a third app tier
   * here to make the table look tidy.
   *
   * ⚠️ THE RANGE UPPER BOUNDS ARE PLACEHOLDERS. The lower bound of each is the
   * real "from" price on the pricing card; the top of each range is a reasonable
   * guess and needs Jimmy's sign-off before this goes live.
   *
   * ── How the reveal sentence is built ────────────────────────────────────────
   * Every option carries a `phrase`, and `reveal.lead` is a template whose
   * placeholders are step ids. The component does a plain string replace, so a CMS
   * editor can rewrite the sentence without touching code — but the phrases have to
   * stay grammatical in the slot they land in. Read the template out loud with each
   * option substituted before changing any of them.
   */
  quiz: {
    /**
     * Fixed order. `scope` is resolved through the branch that `build` sets.
     *
     * ⚠️ FIVE screens, not eight (13 Aug). Two were cut:
     *
     *   · the START screen — question 1 is now the opening screen. A "click to
     *     begin" card is a toll booth in front of the thing itself, and the first
     *     question is a better invitation than a description of the questions.
     *   · the EMAIL step — the reveal follows the last answer directly.
     *
     * ⚠️ The quiz collects NO contact detail, and that is the point rather than a
     * gap. Jimmy, 13 Aug: "I don't think we need to capture an email, I just want
     * to make it easier for the user to explore options." Someone who answers two
     * questions, sees the shape of the thing and scrolls on has been helped.
     * **Do not add an email step back in** — it would change what this is for.
     */
    order: ["build", "starting", "scope", "driver", "timeline"],

    questions: {
      build: {
        id: "build",
        question: "What are you looking to build?",
        options: [
          { id: "website", label: "A website", description: "Marketing site, brochure site, online presence.", phrase: "a marketing website", branch: "website" },
          { id: "webapp", label: "A web app", description: "Something customers log into and use.", phrase: "a web app", branch: "webapp" },
          { id: "dashboard", label: "A dashboard or internal tool", description: "Something your team uses to run the business.", phrase: "an internal dashboard", branch: "dashboard" },
          { id: "unsure", label: "Not sure yet", description: "I know the problem, not the shape of the fix.", phrase: "a new build", branch: "unsure" },
        ],
      },
      starting: {
        id: "starting",
        question: "Where are you starting from?",
        options: [
          { id: "fresh", label: "Starting fresh", description: "Nothing exists yet.", phrase: "starting fresh with" },
          { id: "rebuild", label: "Rebuilding something that exists", description: "It's there, it's just not working.", phrase: "rebuilding" },
          { id: "adding", label: "Adding to what I've got", description: "Keeping the foundation, extending it.", phrase: "adding to" },
        ],
      },
      driver: {
        id: "driver",
        question: "What's driving this?",
        help: "This doesn't change the recommendation — it changes how we'd approach it.",
        options: [
          { id: "launch", label: "A new launch", description: "New business, product or location.", phrase: "for a new launch" },
          { id: "performance", label: "What I've got isn't performing", description: "Traffic arrives, nothing happens.", phrase: "because what you've got isn't pulling its weight" },
          { id: "growth", label: "Growing and levelling up", description: "The business has outgrown the website.", phrase: "as the business grows and levels up" },
          { id: "campaign", label: "A specific campaign", description: "There's a date and a push behind it.", phrase: "for a specific campaign" },
        ],
      },
      timeline: {
        id: "timeline",
        question: "When do you need it live?",
        options: [
          { id: "month", label: "Within a month", description: "There's a deadline and it's close.", phrase: "and you want it live within the month" },
          { id: "quarter", label: "One to three months", description: "Room to do it properly.", phrase: "on a one-to-three-month timeline" },
          { id: "exploring", label: "Just exploring", description: "Working out what this would involve.", phrase: "with no fixed date yet" },
        ],
      },
    },

    /**
     * Step 3 — the tier-mapping question, in business terms rather than feature
     * lists. ⚠️ Four branches, and `unsure` deliberately mirrors `website`: it is
     * the broadest ladder and the one most "not sure yet" answers actually want.
     */
    scope: {
      website: {
        id: "scope",
        question: "How much site do you actually need?",
        help: "Best guess is fine — this is what sets the ballpark.",
        options: [
          { id: "essentials", label: "Just the essentials", description: "A few pages that say who you are and how to reach you.", phrase: "kept to the essentials", tier: "spark" },
          { id: "full", label: "A full marketing site", description: "Several pages, case studies or a blog, copy written to convert.", phrase: "built out in full", tier: "studio" },
          { id: "involved", label: "Something more involved", description: "Integrations, a CMS your team runs, e-commerce or a member area.", phrase: "with integrations and a CMS behind it", tier: "summit" },
        ],
      },
      webapp: {
        id: "scope",
        question: "How much product are we talking about?",
        help: "Best guess is fine — this is what sets the ballpark.",
        options: [
          { id: "focused", label: "A focused first version", description: "One job done well, a small group of users.", phrase: "as a focused first version", tier: "pulse" },
          { id: "full", label: "A full product", description: "Accounts, permissions, several connected areas.", phrase: "with the full set of features", tier: "forge" },
          { id: "involved", label: "A product with real integrations", description: "Talking to other systems, payments, custom AI.", phrase: "with real integrations behind it", tier: "forge" },
        ],
      },
      dashboard: {
        id: "scope",
        question: "How much tool do you need?",
        help: "Best guess is fine — this is what sets the ballpark.",
        options: [
          { id: "single", label: "One clear view", description: "The numbers that matter, on one screen.", phrase: "as a single clear view", tier: "pulse" },
          { id: "connected", label: "Several connected views", description: "A few areas, filtered and shared across the team.", phrase: "across several connected views", tier: "pulse" },
          { id: "daily", label: "A tool the team works in daily", description: "Logins, roles, data going in as well as out.", phrase: "as a tool the team works in daily", tier: "forge" },
        ],
      },
      unsure: {
        id: "scope",
        question: "Roughly how big does this feel?",
        help: "Best guess is fine — we'll pin it down properly on a call.",
        options: [
          { id: "essentials", label: "Small and focused", description: "One clear job, done well.", phrase: "kept small and focused", tier: "spark" },
          { id: "full", label: "A proper build", description: "Several parts working together.", phrase: "done properly", tier: "studio" },
          { id: "involved", label: "Ambitious", description: "Integrations, automation, a system rather than a site.", phrase: "with real ambition behind it", tier: "summit" },
        ],
      },
    },

    reveal: {
      eyebrow: "Your recommendation",
      /**
       * ⚠️ Placeholders are STEP IDS. Read it aloud with each option's `phrase`
       * substituted before editing — the phrases are written to be grammatical in
       * exactly these slots and nowhere else.
       */
      lead: "You're {starting} {build} {scope}, {driver}, {timeline}.",
      rangeLabel: "Typical range",
      cta: { label: "Book a call", href: "#contact" },
      secondary: { label: "See what's included", href: "#pricing" },
      restart: "Start again",
    },

    /** ⚠️ Lower bounds are the real "from" prices. Upper bounds need sign-off. */
    tiers: {
      spark: { id: "spark", tier: "Spark", name: "The Launchpad", range: "$2,500 – $4,500", summary: "Everything a new business needs to look established from day one — designed properly, built cleanly, live in weeks." },
      studio: { id: "studio", tier: "Studio", name: "The Growth Engine", range: "$5,500 – $9,000", summary: "The one most businesses land on. A full site with a CMS you control and an AI chatbot that answers customers while you sleep." },
      summit: { id: "summit", tier: "Summit", name: "The Full Stack", range: "$12,000 – $20,000", summary: "Unlimited pages, e-commerce, a custom-trained AI assistant and a dedicated project manager. For brands building something that has to scale." },
      pulse: { id: "pulse", tier: "Pulse", name: "The Dashboard", range: "$6,000 – $10,000", summary: "Your data on one clean screen — sales, jobs, bookings, stock, whatever you track — instead of five spreadsheets and a hunch." },
      forge: { id: "forge", tier: "Forge", name: "The Web App", range: "$15,000 – $30,000", summary: "A real product: accounts, permissions, integrations and AI woven through it. Delivered in weeks rather than the six-month quote you got elsewhere." },
    },

    /**
     * One per screen, in order: the five questions, then the reveal.
     * Holding imagery from `Supplied Files/Holding Images`, cropped to the card's
     * 470 × 640 portrait. ⚠️ 800px wide rather than 2x on purpose — all six sit
     * in the DOM at once so the cross-dissolve has both frames, so total weight
     * matters more than per-image sharpness.
     */
    images: [
      "/media/quiz/step-01.webp",
      "/media/quiz/step-02.webp",
      "/media/quiz/step-03.webp",
      "/media/quiz/step-04.webp",
      "/media/quiz/step-05.webp",
      "/media/quiz/step-06.webp",
    ],

    /** ⚠️ Live on EVERY screen, per the brief — never only at the end. */
    /**
     * ⚠️ UNUSED SINCE 13 Aug — the quiz no longer renders an escape link. Kept because
     * removing it is a brief-level decision that may be reversed: the original brief
     * asked for a way out on every screen. It was removed because the quiz already ends
     * in a CTA, the section sits above a contact form, and a permanent mailto competing
     * with the primary action on all six screens read as an apology for the quiz
     * existing. If it is still unused at launch, delete this, the `escape` field on
     * `QuizContent`, and the CMS entry together.
     */
    escape: { label: "Or just email us", href: "mailto:hello@otix.studio" },
    back: "Back",
    progressLabel: "Step {n} of {total}",
    /**
     * `satisfies`, not `as` — it checks the shape AND narrows the string literals
     * (`branch`, `tier`) to their union types, so a typo like `tier: "orbit"` is a
     * compile error here rather than a blank reveal in the browser.
     */
  } satisfies QuizContent,

  process: {
    eyebrow: "Our Process",
    heading: plain(
      "No guesswork, no scope creep. Every project follows a proven framework designed to move fast without cutting corners.",
    ),
    /**
     * ⚠️ CUT 6 → 4. v1 had Discovery / Strategy / Design / Build / Launch / Grow.
     * The v2 Figma section has FOUR steps, and `PROCESS_ICONS` — matched 1:1
     * against those frames in D4 — is exactly `discovery, design, build, launch`.
     * So Strategy and Grow are the two that go; their copy is preserved verbatim
     * in `cutFromV2` at the bottom of this file rather than deleted.
     *
     * `number` is dropped: `StepCard` does not take one, and the numbering is a
     * section-level ornament, not content that should be typed by hand.
     */
    steps: [
      {
        icon: "discovery" as IconName,
        title: "Discovery",
        description:
          "We dig into your business, audience, and goals. By the end of this call, we know exactly what success looks like for you.",
      },
      {
        icon: "design" as IconName,
        title: "Design",
        description:
          "High-fidelity designs built to convert, not just look good. You see every screen before a single line of code is written.",
      },
      {
        icon: "build" as IconName,
        title: "Build",
        description:
          "Pixel-perfect development with AI features woven into the foundation. Chatbots, lead capture, automation — all integrated from day one.",
      },
      {
        icon: "launch" as IconName,
        title: "Launch",
        description:
          "Rigorous QA, performance tuning, and a seamless go-live. We handle hosting, DNS, and everything in between so you don't have to.",
      },
    ],
  },

  /**
   * Testimonials — copy written fresh (placeholder in Figma). Avatars are the
   * holding set in `public/media/work` (see the note on that folder).
   *
   * ⚠️ QUOTES ARE CAPPED AT ~110 CHARACTERS. The four-up arch gives every card a
   * FIXED height (`h-testimonial`), which is what makes it read as an arch rather
   * than a ragged row — so a longer quote does not make its card taller, it
   * overflows it. The current set runs 88–110; treat 110 as the ceiling and
   * enforce it in the CMS field (CMS_READINESS.md).
   */
  testimonials: {
    eyebrow: "What our clients say",
    /** One line. The frame breaks it after "our"; that break is removed. */
    heading: plain("Don't just take our word for it."),
    items: [
      {
        quote: "The new site paid for itself in the first month. Bookings came in while I slept — exactly what they promised.",
        name: "Priya Shah",
        role: "Owner, Gloss Salon",
        avatar: "/media/work/avatar-01.webp",
      },
      {
        quote: "We went from a spreadsheet nightmare to one dashboard the whole team actually uses. Total game-changer.",
        name: "Marco Ellis",
        role: "Director, Ellis & Co",
        avatar: "/media/work/avatar-02.webp",
      },
      {
        quote: "Otix understood our brand better than we did. The AI booking flow is genuinely seamless.",
        name: "Hannah Reid",
        role: "Founder, Veda Wellness",
        avatar: "/media/work/avatar-03.webp",
      },
      {
        quote: "Fast, sharp and no jargon. Our conversion rate is up 60% and I finally understand my own analytics.",
        name: "Daniel Okafor",
        role: "Owner, Aura Supplements",
        avatar: "/media/work/avatar-04.webp",
      },
      {
        quote: "They shipped in weeks what another agency quoted six months for. Can't recommend them enough.",
        name: "Sofia Marchetti",
        role: "Manager, Miso Kitchen",
        avatar: "/media/work/avatar-05.webp",
      },
      {
        quote: "Honestly the best money we've spent on the business. The chatbot handles enquiries we used to miss entirely.",
        name: "Tom Bright",
        role: "Owner, Bright Electrical",
        avatar: "/media/work/avatar-06.webp",
      },
      {
        quote: "Professional, patient and genuinely creative. Our online store finally looks the part — and sells like it too.",
        name: "Amara Nwosu",
        role: "Founder, Lumo Skincare",
        avatar: "/media/work/avatar-01.webp",
      },
    ],
  },

  pricing: {
    eyebrow: "Pricing",
    /** Two lines, the accent alone on the second — as the frame sets it. */
    heading: [
      { text: "Pick your package.\n" },
      { text: "Let's build.", accent: true },
    ] as HeadingSegment[],
    body: "Everything Otix builds has AI at its core — faster builds, smarter products, more bang for your budget. Fixed quotes before we start: the price we agree is the price you pay.",
    /**
     * Tier fields now match `TierCardProps` exactly:
     *   eyebrow → tier · title → name · subtitle → description · popular → featured
     *
     * ⚠️ The important one: `excluded` was a SEPARATE array, and `TierCard` takes
     * ONE ordered list where an exclusion is `{ label, included: false }`. Figma
     * interleaves the excluded rows rather than appending them, so keeping two
     * lists and concatenating at render would have silently lost the designed
     * order. They are merged here, in the order the design shows them.
     */
    tabs: [
      {
        value: "web",
        label: "Websites",
        tiers: [
          {
            tier: "Spark",
            name: "The Launchpad",
            description: "For new businesses ready to make their mark.",
            price: "2,500",
            features: [
              "Up to 5 custom pages",
              "AI chatbot — lead capture",
              "On-page SEO setup",
              "Google Analytics",
              "Mobile-responsive design",
              "2 rounds of revisions",
              "2 weeks post-launch support",
              { label: "CMS (content management)", included: false },
              { label: "E-commerce capability", included: false },
              { label: "Email automation", included: false },
            ],
            cta: { label: "Start Project", href: "#contact" },
          },
          {
            tier: "Studio",
            name: "The Growth Engine",
            description: "For established businesses ready to scale.",
            price: "5,500",
            featured: true,
            badge: "Most Popular",
            features: [
              "Up to 10 custom pages",
              "Advanced AI chatbot with FAQ training",
              "Booking system integration",
              "Email automation flows",
              "Full technical SEO",
              "CMS — edit content yourself",
              "Custom analytics dashboard",
              "3 rounds of revisions",
              "1 month post-launch support",
              { label: "E-commerce (add-on available)", included: false },
            ],
            cta: { label: "Start Project", href: "#contact" },
          },
          {
            tier: "Summit",
            name: "The Full Stack",
            description: "For ambitious brands building something big.",
            price: "12,000",
            features: [
              "Unlimited pages",
              "Custom-trained AI assistant",
              "Full e-commerce + CRM integration",
              "AI-driven personalisation",
              "Advanced analytics + AI insights",
              "CMS included",
              "Unlimited revisions",
              "3 months post-launch support",
              "Dedicated project manager",
              "Priority retainer access",
            ],
            cta: { label: "Start Project", href: "#contact" },
          },
        ],
      },
      {
        value: "apps",
        label: "Apps & Dashboards",
        tiers: [
          {
            tier: "Pulse",
            name: "The Dashboard",
            description: "For businesses drowning in spreadsheets.",
            price: "6,000",
            features: [
              "Your data on one clean screen",
              "Live numbers: sales, jobs, stock, bookings",
              "User logins & permissions",
              "AI insights & alerts",
              "Typically live in 4–6 weeks",
            ],
            cta: { label: "Start Project", href: "#contact" },
          },
          {
            tier: "Forge",
            name: "The Web App",
            description: "For the idea you keep saying someone should build.",
            price: "15,000",
            features: [
              "Full product design & build",
              "Customer accounts, payments, notifications",
              "CMS/admin panel included",
              "Built to grow — not a throwaway prototype",
              "Typically live in 6–8 weeks",
            ],
            cta: { label: "Start Project", href: "#contact" },
          },
        ],
      },
    ],
  },

  // Footer copy verbatim from Figma; icons + form field options supplied in page.tsx.
  // projectTypes/budgets are select options (not specified in Figma — drafted).
  footer: {
    /** ⚠️ The v2 frame reads "LETS CHAT", not v1's "Get In Touch". */
    eyebrow: "Lets Chat",
    /** Three lines, the accent alone on the third. */
    heading: [
      { text: "Let’s build\nsomething\n" },
      { text: "great together.", accent: true },
    ] as HeadingSegment[],
    body: "Tell us about your project and we'll respond within 24 hours. Or skip ahead and book a free 30-minute discovery call.",
    /** `key` is typed, not a loose string — it selects one of three real icons. */
    contacts: [
      { key: "mail", label: "Write", value: "hello@otix.studio", href: "mailto:hello@otix.studio" },
      { key: "phone", label: "Call", value: "0424 249 667", href: "tel:0424249667" },
      { key: "instagram", label: "Social", value: "instagram", href: "#" },
    ] as Array<{ key: ContactIcon; label: string; value: string; href: string }>,
    projectTypes: [
      { value: "web", label: "Website" },
      { value: "app", label: "App / Dashboard" },
      { value: "ecom", label: "E-commerce" },
    ],
    budgets: [
      { value: "a", label: "$2k–5k" },
      { value: "b", label: "$5k–12k" },
      { value: "c", label: "$12k+" },
    ],
    /**
     * The contact form. Labels are never shown — the design is placeholder-only —
     * but every field still carries one, rendered `sr-only`, because a form
     * control whose only label is a placeholder has no accessible name once
     * anything is typed into it.
     *
     * ⚠️ The frame's message placeholder reads "hello@yourbusiness.com", copied
     * from the email field above it. Corrected here; flag if that was deliberate.
     */
    form: {
      name: { name: "name", label: "Your name", placeholder: "Alex Johnson" },
      company: { name: "company", label: "Company", placeholder: "Company Ltd." },
      email: { name: "email", label: "Email address", placeholder: "hello@yourbusiness.com" },
      projectType: { name: "projectType", label: "Project type", placeholder: "Select a project type…" },
      budget: { name: "budget", label: "Budget range", placeholder: "Select a budget range…" },
      message: { name: "message", label: "About your project", placeholder: "Tell us what you're building…" },
      submit: "Send Message",
    },
    /**
     * ⚠️ A HARD-CODED YEAR, and it will go stale. Left as content rather than
     * derived from `new Date()` on purpose: a copyright year rendered on the server
     * and again on the client can disagree across a New Year boundary and throw a
     * hydration mismatch, and it is one word to edit. If it should update itself,
     * it belongs in the component with `suppressHydrationWarning`, not here.
     */
    legalLeft: "2026 Otix Studio",
    /**
     * ⚠️ TWO FIELDS, not one string. The studio name is bold and the lead-in is
     * not, and CLAUDE.md §2 is explicit that emphasis inside a string is expressed
     * structurally rather than as markup — the same reason headings are segment
     * arrays. A CMS can render the weight without anyone typing `<strong>`.
     */
    legalRight: { prefix: "Designed & built by ", name: "Otix Studio" },
  },
};

/**
 * Copy for sections and steps that v2 CUT. Kept verbatim so nothing is lost, and
 * kept OUT of `content` so it can never be mistaken for live content or picked up
 * by a Sanity schema (CMS_READINESS.md §3.7).
 *
 * Nothing imports this. Delete it once the cuts are final.
 */
export const cutFromV2 = {
  /** Quotes ×2 — both quote sections are cut from v2. */
  quote1: "Most visitors decide in 3 seconds.\nWe make sure those 3 seconds count.",
  quote2:
    "A website is your hardest-working employee. An app is your second. Neither asks for annual leave.",

  /** The two Process steps cut in the 6 → 4 reduction. */
  processSteps: [
    {
      title: "Strategy",
      description:
        "We map out the sitemap, user journey, and AI opportunities — identifying where automation will have the biggest impact on your bottom line.",
    },
    {
      title: "Grow",
      description:
        "Post-launch isn't an afterthought. We monitor performance, refine AI models, and continuously optimise to keep results climbing.",
    },
  ],

  /**
   * The FAQs section — cut from v2, and its nav link removed. The answers were
   * marked DRAFT in v1 and were never signed off.
   */
  faqsNote:
    "The FAQs section (eyebrow, heading, body and 6 draft Q&As) was removed in the D8 content pass. Recover it from git history at tag `v1-teal-navy` if it is ever reinstated.",
};
