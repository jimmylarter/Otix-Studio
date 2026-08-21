"use client";

import { useState } from "react";
import { SegmentedToggle } from "@/components/SegmentedToggle";
import { TierCard } from "@/components/TierCard";

/**
 * Harness-only: proves `SegmentedToggle` actually drives the tier set, rather than
 * showing it as a decorative control. The real wiring happens in D8.
 */

const TABS = [
  { value: "web", label: "Websites" },
  { value: "apps", label: "Apps & Dashboards" },
];

export function PricingTabs() {
  const [tab, setTab] = useState("web");

  return (
    <div className="flex w-full flex-col items-center gap-block">
      <SegmentedToggle label="Pricing category" options={TABS} value={tab} onChange={setTab} />

      {tab === "web" ? (
        <div className="grid w-full gap-lg lg:grid-cols-3">
          <TierCard
            tier="Spark"
            name="The Launchpad"
            description="For new businesses ready to make their mark."
            price="2,500"
            features={[
              "Up to 5 custom pages",
              "AI chatbot — lead capture",
              "On-page SEO setup",
              { label: "CMS (content management)", included: false },
              { label: "E-commerce capability", included: false },
            ]}
            cta={{ label: "Get started", href: "#" }}
          />
          <TierCard
            featured
            tier="Studio"
            name="The Growth Engine"
            description="For established businesses ready to scale."
            price="5,500"
            features={[
              "Up to 10 custom pages",
              "Advanced AI chatbot with FAQ training",
              "Booking system integration",
              "CMS — edit content yourself",
              { label: "E-commerce (add-on available)", included: false },
            ]}
            cta={{ label: "Get started", href: "#" }}
          />
          <TierCard
            tier="Summit"
            name="The Full Stack"
            description="For ambitious brands building something big."
            price="12,000"
            features={[
              "Unlimited pages",
              "Custom-trained AI assistant",
              "Full e-commerce + CRM integration",
              "Unlimited revisions",
              "Priority retainer access",
            ]}
            cta={{ label: "Get started", href: "#" }}
          />
        </div>
      ) : (
        <div className="grid w-full gap-lg lg:grid-cols-2">
          <TierCard
            tier="Pulse"
            name="The Dashboard"
            description="For businesses drowning in spreadsheets."
            price="6,000"
            features={[
              "Your data on one clean screen",
              "Live numbers: sales, jobs, stock, bookings",
              "User logins & permissions",
              "AI insights & alerts",
              "Typically live in 4–6 weeks",
            ]}
            cta={{ label: "Get started", href: "#" }}
          />
          <TierCard
            tier="Forge"
            name="The Web App"
            description="For the idea you keep saying someone should build."
            price="15,000"
            features={[
              "Full product design & build",
              "Customer accounts, payments, notifications",
              "CMS/admin panel included",
              "Built to grow — not a throwaway prototype",
              "Typically live in 6–8 weeks",
            ]}
            cta={{ label: "Get started", href: "#" }}
          />
        </div>
      )}
    </div>
  );
}
