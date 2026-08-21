import { Nav } from "@/components/Nav";

const links = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Process", href: "#process" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQs", href: "#faqs" },
];

/** Nav review harness — page sits inside the 10px gutter frame; sections are
 *  30px-radius cards. Dark hero tests the transparent nav; tall sections test
 *  hide-on-down / reveal-on-up and the background fade. */
export default function NavDevPage() {
  return (
    <div id="top" className="min-h-screen bg-surface-white p-gutter">
      <Nav links={links} cta={{ label: "Let's Chat", href: "#contact" }} />

      <div className="flex flex-col gap-gutter">
        <section className="flex min-h-screen flex-col items-center justify-center gap-sm rounded-xl bg-surface-navy px-section-x text-center text-text-on-dark">
          <p className="font-mono text-eyebrow uppercase text-primary-blue">Hero</p>
          <h1 className="text-h1">Nav is transparent here</h1>
          <p className="text-body-lg text-text-muted">Scroll down — the nav hides. Scroll up (over a section) — its link goes bold + teal.</p>
        </section>

        {[
          { id: "about", label: "About" },
          { id: "services", label: "Services" },
          { id: "work", label: "Work" },
          { id: "process", label: "Process" },
          { id: "pricing", label: "Pricing" },
          { id: "faqs", label: "FAQs" },
        ].map((s, i) => (
          <section
            key={s.id}
            id={s.id}
            className={`flex min-h-screen flex-col items-center justify-center rounded-xl px-section-x text-center ${i % 2 === 0 ? "bg-surface-white" : "bg-surface-light"}`}
          >
            <h2 className="text-h2 text-text-on-light">{s.label}</h2>
          </section>
        ))}
      </div>
    </div>
  );
}
