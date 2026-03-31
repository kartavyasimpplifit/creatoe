"use client";

import { Check, ArrowLeft } from "lucide-react";
import { CreatoeLogoInline } from "@/components/creatoe-logo";

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: "",
    description: "Evaluate the platform",
    features: [
      "3 product matches / day",
      "5 AI searches / day",
      "8 creators per search",
      "4 videos per search",
      "3 creator deep dives / day",
      "Basic demand intelligence",
      "Hindi + English only",
    ],
    cta: "Current Plan",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "₹15,000",
    period: "/mo",
    description: "For category marketing teams",
    features: [
      "Unlimited product matches",
      "Unlimited AI searches",
      "All creators (no paywall)",
      "All videos (no paywall)",
      "100 deep dives / day",
      "Full marketplace intelligence",
      "All 6 languages",
      "Campaign builder + CSV export",
      "Outreach email drafts (20/day)",
      "Up to 10 team members",
    ],
    addons: [
      { name: "Upcoming content scan", price: "₹50/creator" },
      { name: "Instagram enrichment", price: "₹200/creator" },
      { name: "Creator fleet audit", price: "₹10/creator" },
      { name: "Competitor watch", price: "₹1,000/brand/mo" },
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For the entire marketing org",
    features: [
      "Everything in Pro",
      "Unlimited everything",
      "API access",
      "Flipkart Commerce Cloud integration",
      "Affiliate attribution",
      "BigQuery data push",
      "Slack / Teams alerts",
      "Custom integrations",
      "Dedicated support",
      "All add-ons included",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="border-b border-[var(--border)] glass sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-12 flex items-center gap-4">
          <a href="/" className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
            <ArrowLeft size={14} />
          </a>
          <a href="/"><CreatoeLogoInline /></a>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <h1 className="text-3xl font-extrabold text-[var(--text)] tracking-tight mb-3">Simple, usage-based pricing</h1>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
            Start free. Upgrade when you need more. Pay-as-you-go add-ons for premium features.
          </p>
          <div className="mt-3 text-[11px] text-[var(--text-muted)]">
            Pro and Enterprise plans require a business email (company domain).
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map(plan => (
            <div key={plan.name}
              className={`bg-[var(--bg-card)] border rounded-2xl p-6 flex flex-col transition-all duration-200 ${
                plan.highlighted
                  ? "border-[var(--accent)]/30 shadow-[0_0_40px_rgba(129,140,248,0.06)]"
                  : "border-[var(--border)] hover:border-[var(--border-light)]"
              }`}>
              {plan.highlighted && (
                <div className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-[0.2em] mb-2">Most Popular</div>
              )}
              <div className="text-lg font-bold text-[var(--text)]">{plan.name}</div>
              <div className="flex items-baseline gap-1 mt-1 mb-1">
                <span className="text-2xl font-extrabold text-[var(--text)]" style={{ fontFamily: "var(--font-mono)" }}>{plan.price}</span>
                {plan.period && <span className="text-sm text-[var(--text-muted)]">{plan.period}</span>}
              </div>
              <div className="text-xs text-[var(--text-muted)] mb-5">{plan.description}</div>

              <ul className="flex-1 space-y-2.5 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                    <Check size={14} className="text-[var(--success)] flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              {plan.addons && (
                <div className="mb-5 pt-4 border-t border-[var(--border)]">
                  <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em] mb-2">Pay-per-use Add-ons</div>
                  {plan.addons.map(a => (
                    <div key={a.name} className="flex justify-between text-[11px] text-[var(--text-muted)] py-1">
                      <span>{a.name}</span>
                      <span className="text-[var(--text-secondary)]" style={{ fontFamily: "var(--font-mono)" }}>{a.price}</span>
                    </div>
                  ))}
                </div>
              )}

              <button className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                plan.highlighted
                  ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-lg shadow-[var(--accent)]/10"
                  : "bg-[var(--bg-elevated)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--bg-card-hover)]"
              }`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="text-xs text-[var(--text-muted)]">
            All paid plans require a business email (company domain). Personal emails (Gmail, Yahoo) are limited to the Free tier.
          </div>
        </div>
      </div>
    </div>
  );
}
