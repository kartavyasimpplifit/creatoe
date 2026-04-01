"use client";

import { Check, ArrowLeft } from "lucide-react";
import { CreatoeLogoInline } from "@/components/creatoe-logo";

const PLANS = [
  {
    name: "Free", price: "₹0", period: "", description: "Evaluate the platform",
    features: ["3 product matches / day", "5 AI searches / day", "8 creators per search", "4 videos per search", "3 deep dives / day", "Basic demand intelligence", "Hindi + English only"],
    cta: "Current Plan", highlighted: false,
  },
  {
    name: "Pro", price: "₹15,000", period: "/mo", description: "For category marketing teams",
    features: ["Unlimited product matches", "Unlimited AI searches", "All creators (no paywall)", "All videos (no paywall)", "100 deep dives / day", "Full marketplace intelligence", "All 6 languages", "Campaign builder + CSV export", "Outreach email drafts (20/day)", "Up to 10 team members"],
    addons: [
      { name: "Upcoming content scan", price: "₹50/creator" }, { name: "Instagram enrichment", price: "₹200/creator" },
      { name: "Creator fleet audit", price: "₹10/creator" }, { name: "Competitor watch", price: "₹1,000/brand/mo" },
    ],
    cta: "Upgrade to Pro", highlighted: true,
  },
  {
    name: "Enterprise", price: "Custom", period: "", description: "For the entire marketing org",
    features: ["Everything in Pro", "Unlimited everything", "API access", "Flipkart Commerce Cloud integration", "Affiliate attribution", "BigQuery data push", "Slack / Teams alerts", "Custom integrations", "Dedicated support", "All add-ons included"],
    cta: "Contact Sales", highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 glass" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto px-6 h-12 flex items-center gap-4">
          <a href="/" style={{ color: "var(--text-muted)" }}><ArrowLeft size={14} /></a>
          <a href="/"><CreatoeLogoInline /></a>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-20 hero-glow">
        <div className="relative z-10 text-center mb-16">
          <h1 className="text-2xl font-light tracking-tight mb-3" style={{ color: "var(--text)" }}>Simple, usage-based pricing</h1>
          <p className="text-[13px] font-light max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
            Start free. Upgrade when you need more.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map(plan => (
            <div key={plan.name} className="rounded-2xl p-6 flex flex-col transition-all duration-300"
              style={{
                backgroundColor: "var(--bg-card)",
                border: plan.highlighted ? "1px solid rgba(255,255,255,0.06)" : "1px solid var(--border)",
              }}>
              {plan.highlighted && (
                <div className="text-[8px] tracking-[0.3em] uppercase mb-2" style={{ color: "var(--text-secondary)" }}>Most Popular</div>
              )}
              <div className="text-base font-normal" style={{ color: "var(--text)" }}>{plan.name}</div>
              <div className="flex items-baseline gap-1 mt-1 mb-1">
                <span className="text-xl font-light" style={{ color: "var(--text)", fontFamily: "var(--font-mono)" }}>{plan.price}</span>
                {plan.period && <span className="text-[12px] font-light" style={{ color: "var(--text-dim)" }}>{plan.period}</span>}
              </div>
              <div className="text-[11px] font-light mb-5" style={{ color: "var(--text-dim)" }}>{plan.description}</div>

              <ul className="flex-1 space-y-2 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-[11px] font-light" style={{ color: "var(--text-secondary)" }}>
                    <Check size={12} className="flex-shrink-0 mt-0.5" style={{ color: "var(--success)" }} />
                    {f}
                  </li>
                ))}
              </ul>

              {plan.addons && (
                <div className="mb-5 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                  <div className="text-[8px] tracking-[0.2em] uppercase mb-2" style={{ color: "var(--text-dim)" }}>Add-ons</div>
                  {plan.addons.map(a => (
                    <div key={a.name} className="flex justify-between text-[10px] font-light py-0.5" style={{ color: "var(--text-dim)" }}>
                      <span>{a.name}</span>
                      <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{a.price}</span>
                    </div>
                  ))}
                </div>
              )}

              <button className="w-full py-2 rounded-xl text-[12px] font-normal transition-all duration-300"
                style={{
                  color: plan.highlighted ? "var(--text)" : "var(--text-muted)",
                  border: plan.highlighted ? "1px solid rgba(255,255,255,0.15)" : "1px solid var(--border)",
                  backgroundColor: "transparent",
                }}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
