"use client";

import { ArrowLeft, Check, Clock, Plug } from "lucide-react";
import { CreatoeLogoInline } from "@/components/creatoe-logo";

const INTEGRATIONS = [
  {
    category: "Your Platforms",
    items: [
      {
        name: "Flipkart Commerce Cloud",
        description: "Product catalog, real-time pricing, ad performance comparison",
        unlock: "Real product prices, bestseller data, FCC Ads CPV comparison",
        status: "available" as const,
      },
      {
        name: "Flipkart Affiliate",
        description: "Conversion tracking, actual sales attribution per creator",
        unlock: "True ROAS: actual orders and GMV per creator",
        status: "available" as const,
      },
      {
        name: "Qoruz Creator Database",
        description: "Import your existing 15K+ creator list for health audit",
        unlock: "Audit all creators: active, declining, or inactive",
        status: "available" as const,
      },
    ],
  },
  {
    category: "Data Enrichment",
    items: [
      {
        name: "Phyllo",
        description: "Instagram & TikTok audience demographics, cross-platform data",
        unlock: "Real audience age, gender, location per creator + Instagram reach",
        status: "available" as const,
      },
      {
        name: "Modash",
        description: "350M+ creator database enrichment across platforms",
        unlock: "Expand beyond YouTube to Instagram, TikTok globally",
        status: "available" as const,
      },
      {
        name: "HypeAuditor",
        description: "Fake follower detection, audience quality scoring (87% accuracy)",
        unlock: "Fraud detection with 87% accuracy on follower authenticity",
        status: "available" as const,
      },
    ],
  },
  {
    category: "Workflow",
    items: [
      {
        name: "Google Workspace",
        description: "Export campaign plans to Google Sheets, auto-generate Slides",
        unlock: "One-click campaign export as formatted Google Sheet",
        status: "functional" as const,
      },
      {
        name: "Slack",
        description: "Real-time alerts for competitive moves, creator health changes",
        unlock: "Get notified when competitors activate creators",
        status: "available" as const,
      },
      {
        name: "Google BigQuery",
        description: "Push scoring data to your data warehouse for custom analysis",
        unlock: "Your data team builds custom models on creator intelligence",
        status: "available" as const,
      },
    ],
  },
  {
    category: "Coming Soon",
    items: [
      { name: "Salesforce CRM", description: "Track creator relationships in your CRM", unlock: "", status: "soon" as const },
      { name: "Sprinklr Social", description: "Unified social + creator reporting", unlock: "", status: "soon" as const },
      { name: "Amazon Advertising", description: "Amazon creator attribution and comparison", unlock: "", status: "soon" as const },
    ],
  },
];

function StatusButton({ status }: { status: "available" | "functional" | "soon" }) {
  if (status === "functional") {
    return (
      <button className="w-full py-2 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center gap-1.5">
        <Check size={12} /> Active
      </button>
    );
  }
  if (status === "soon") {
    return (
      <button disabled className="w-full py-2 rounded-lg text-xs font-semibold bg-[var(--bg-elevated)] text-[var(--text-muted)] cursor-not-allowed flex items-center justify-center gap-1.5">
        <Clock size={12} /> Coming Soon
      </button>
    );
  }
  return (
    <button className="w-full py-2 rounded-lg text-xs font-semibold bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)] border border-[var(--border)] transition-all duration-200 flex items-center justify-center gap-1.5">
      <Plug size={12} /> Connect
    </button>
  );
}

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="border-b border-[var(--border)] glass sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-6 h-12 flex items-center gap-4">
          <a href="/" className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
            <ArrowLeft size={14} />
          </a>
          <a href="/"><CreatoeLogoInline /></a>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[var(--text)] mb-3">Integrations</h1>
          <p className="text-sm text-[var(--text-muted)] max-w-lg mx-auto leading-relaxed">
            Connect your existing tools to unlock deeper intelligence. Each integration adds a new dimension to your creator matching.
          </p>
        </div>

        {INTEGRATIONS.map((cat) => (
          <div key={cat.category} className="mb-10">
            <h2 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4">{cat.category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cat.items.map((item) => (
                <div
                  key={item.name}
                  className={`bg-[var(--bg-card)] border rounded-xl p-5 transition-all duration-200 ${
                    item.status === "soon"
                      ? "border-[var(--border)] opacity-50"
                      : "border-[var(--border)] hover:border-[var(--border-light)]"
                  }`}
                >
                  <div className="mb-3">
                    <div className="text-sm font-semibold text-[var(--text)] mb-1">{item.name}</div>
                    <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">{item.description}</div>
                  </div>

                  {item.unlock && (
                    <div className="bg-[var(--accent-dim)] border border-[var(--accent)]/10 rounded-lg px-3 py-2 mb-3">
                      <div className="text-[10px] text-[var(--accent)]">
                        <span className="font-semibold">Unlocks:</span> {item.unlock}
                      </div>
                    </div>
                  )}

                  <StatusButton status={item.status} />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-12 bg-[var(--accent-dim)] border border-[var(--accent)]/15 rounded-2xl p-8 text-center">
          <h3 className="text-lg font-bold text-[var(--text)] mb-2">Need a custom integration?</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4 max-w-md mx-auto leading-relaxed">
            We build custom connectors for enterprise platforms. Contact us to discuss your tech stack.
          </p>
          <button className="px-6 py-2.5 bg-[var(--accent)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--accent-hover)] transition-colors duration-200">
            Contact Enterprise Sales
          </button>
        </div>
      </div>
    </div>
  );
}
