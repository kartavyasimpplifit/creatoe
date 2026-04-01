"use client";

import { ArrowLeft, Check, Clock, Plug } from "lucide-react";
import { CreatoeLogoInline } from "@/components/creatoe-logo";

const INTEGRATIONS = [
  {
    category: "Your Platforms",
    items: [
      { name: "Flipkart Commerce Cloud", description: "Product catalog, real-time pricing, ad performance", unlock: "Real product prices, bestseller data, FCC Ads CPV comparison", status: "available" as const },
      { name: "Flipkart Affiliate", description: "Conversion tracking, sales attribution per creator", unlock: "True ROAS: actual orders and GMV per creator", status: "available" as const },
      { name: "Qoruz Creator Database", description: "Import your existing 15K+ creator list for audit", unlock: "Audit all creators: active, declining, or inactive", status: "available" as const },
    ],
  },
  {
    category: "Data Enrichment",
    items: [
      { name: "Phyllo", description: "Instagram & TikTok audience demographics", unlock: "Real audience age, gender, location per creator", status: "available" as const },
      { name: "Modash", description: "350M+ creator database enrichment", unlock: "Expand beyond YouTube to Instagram, TikTok", status: "available" as const },
      { name: "HypeAuditor", description: "Fake follower detection (87% accuracy)", unlock: "Fraud detection on follower authenticity", status: "available" as const },
    ],
  },
  {
    category: "Workflow",
    items: [
      { name: "Google Workspace", description: "Export to Sheets, auto-generate Slides", unlock: "One-click campaign export", status: "functional" as const },
      { name: "Slack", description: "Real-time alerts for competitive moves", unlock: "Get notified when competitors activate creators", status: "available" as const },
      { name: "Google BigQuery", description: "Push scoring data to your warehouse", unlock: "Custom models on creator intelligence", status: "available" as const },
    ],
  },
  {
    category: "Coming Soon",
    items: [
      { name: "Salesforce CRM", description: "Track creator relationships", unlock: "", status: "soon" as const },
      { name: "Sprinklr Social", description: "Unified social + creator reporting", unlock: "", status: "soon" as const },
      { name: "Amazon Advertising", description: "Amazon creator attribution", unlock: "", status: "soon" as const },
    ],
  },
];

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 glass" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-[1100px] mx-auto px-6 h-12 flex items-center gap-4">
          <a href="/" style={{ color: "var(--text-muted)" }}><ArrowLeft size={14} /></a>
          <a href="/"><CreatoeLogoInline /></a>
        </div>
      </header>

      <div className="max-w-[1100px] mx-auto px-6 py-16 hero-glow">
        <div className="relative z-10 text-center mb-14">
          <h1 className="text-2xl font-light tracking-tight mb-3" style={{ color: "var(--text)" }}>Integrations</h1>
          <p className="text-[13px] font-light max-w-lg mx-auto" style={{ color: "var(--text-muted)" }}>
            Connect your tools to unlock deeper intelligence.
          </p>
        </div>

        <div className="relative z-10">
          {INTEGRATIONS.map((cat) => (
            <div key={cat.category} className="mb-10">
              <h2 className="text-[9px] tracking-[0.25em] uppercase mb-4 font-normal" style={{ color: "var(--text-dim)" }}>{cat.category}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {cat.items.map((item) => (
                  <div key={item.name} className="rounded-2xl p-5 transition-all duration-300"
                    style={{
                      backgroundColor: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      opacity: item.status === "soon" ? 0.5 : 1,
                    }}>
                    <div className="mb-3">
                      <div className="text-[13px] font-normal mb-1" style={{ color: "var(--text)" }}>{item.name}</div>
                      <div className="text-[10px] font-light leading-relaxed" style={{ color: "var(--text-dim)" }}>{item.description}</div>
                    </div>

                    {item.unlock && (
                      <div className="rounded-lg px-3 py-2 mb-3" style={{ backgroundColor: "var(--accent-dim)", border: "1px solid rgba(129,140,248,0.08)" }}>
                        <div className="text-[9px] font-light" style={{ color: "var(--accent)" }}>{item.unlock}</div>
                      </div>
                    )}

                    <button
                      disabled={item.status === "soon"}
                      className="w-full py-1.5 rounded-lg text-[10px] font-normal flex items-center justify-center gap-1.5 transition-all duration-300"
                      style={{
                        color: item.status === "functional" ? "var(--success)" : item.status === "soon" ? "var(--text-dim)" : "var(--text-muted)",
                        border: `1px solid ${item.status === "functional" ? "rgba(52,211,153,0.15)" : "var(--border)"}`,
                        backgroundColor: item.status === "functional" ? "rgba(52,211,153,0.06)" : "transparent",
                        cursor: item.status === "soon" ? "not-allowed" : "pointer",
                      }}
                    >
                      {item.status === "functional" ? <><Check size={10} /> Active</> : item.status === "soon" ? <><Clock size={10} /> Coming Soon</> : <><Plug size={10} /> Connect</>}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-12 rounded-2xl p-8 text-center" style={{ backgroundColor: "var(--accent-dim)", border: "1px solid rgba(129,140,248,0.1)" }}>
            <h3 className="text-base font-light mb-2" style={{ color: "var(--text)" }}>Need a custom integration?</h3>
            <p className="text-[12px] font-light mb-4 max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
              We build custom connectors for enterprise platforms.
            </p>
            <button className="px-5 py-2 text-[11px] font-normal rounded-xl transition-colors duration-300" style={{ color: "var(--accent)", border: "1px solid var(--accent)" }}>
              Contact Enterprise Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
