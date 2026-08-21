import { Nav } from "@/components/Nav";

/**
 * /dev/nav — Nav needs a scrollable page to review, so it gets its own harness
 * rather than sitting in the component grid.
 *
 * What to check: hides on scroll DOWN, reveals on scroll UP, goes solid past the
 * hero, never hides with the mobile menu open, and the menu locks the page behind.
 */

const LINKS = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Process", href: "#process" },
  { label: "Pricing", href: "#pricing" },
];

export default function DevNav() {
  return (
    <>
      <Nav links={LINKS} cta={{ label: "Lets chat", href: "#contact" }} />

      <main>
        {/* Stand-in for the hero: the nav is transparent over this. */}
        <section className="relative flex h-screen items-center justify-center overflow-hidden bg-green-950">
          <video
            className="absolute inset-0 size-full object-cover opacity-60"
            src="/media/background.mp4"
            poster="/media/background-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
          />
          <p className="relative font-mono text-eyebrow uppercase text-green-100">Scroll to test the nav</p>
        </section>

        {[...Array(4)].map((_, i) => (
          <section key={i} className="flex h-screen items-center justify-center bg-neutral-100">
            <p className="text-h3 text-ink-900">Section {i + 1}</p>
          </section>
        ))}
      </main>
    </>
  );
}
