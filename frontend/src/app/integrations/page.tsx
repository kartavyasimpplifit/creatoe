"use client";

const INTEGRATIONS = [
  {
    category: "Your Platforms",
    items: [
      {
        name: "Flipkart Commerce Cloud",
        description: "Product catalog, real-time pricing, ad performance comparison",
        unlock: "Real product prices, bestseller data, FCC Ads CPV comparison",
        logo: "🛒",
        status: "available",
      },
      {
        name: "Flipkart Affiliate",
        description: "Conversion tracking, actual sales attribution per creator",
        unlock: "True ROAS: actual orders and GMV per creator",
        logo: "📊",
        status: "available",
      },
      {
        name: "Qoruz Creator Database",
        description: "Import your existing 15K+ creator list for health audit",
        unlock: "Audit all creators: active, declining, or inactive",
        logo: "👥",
        status: "available",
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
        logo: "📸",
        status: "available",
      },
      {
        name: "Modash",
        description: "350M+ creator database enrichment across platforms",
        unlock: "Expand beyond YouTube to Instagram, TikTok globally",
        logo: "🌐",
        status: "available",
      },
      {
        name: "HypeAuditor",
        description: "Fake follower detection, audience quality scoring (87% accuracy)",
        unlock: "Fraud detection with 87% accuracy on follower authenticity",
        logo: "🛡️",
        status: "available",
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
        logo: "📋",
        status: "functional",
      },
      {
        name: "Slack",
        description: "Real-time alerts for competitive moves, creator health changes",
        unlock: "Get notified when competitors activate creators",
        logo: "💬",
        status: "available",
      },
      {
        name: "Google BigQuery",
        description: "Push scoring data to your data warehouse for custom analysis",
        unlock: "Your data team builds custom models on creator intelligence",
        logo: "🗄️",
        status: "available",
      },
    ],
  },
  {
    category: "Coming Soon",
    items: [
      { name: "Salesforce CRM", description: "Track creator relationships in your CRM", unlock: "", logo: "☁️", status: "soon" },
      { name: "Sprinklr Social", description: "Unified social + creator reporting", unlock: "", logo: "📡", status: "soon" },
      { name: "Amazon Advertising", description: "Amazon creator attribution and comparison", unlock: "", logo: "📦", status: "soon" },
    ],
  },
];

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-[#06060a]">
      {/* Header */}
      <header className="border-b border-zinc-800/50">
        <div className="max-w-[1200px] mx-auto px-6 h-12 flex items-center">
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-6 h-6 rounded-md bg-indigo-500/20 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
            </div>
            <span className="text-sm font-bold">
              <span className="text-white">Creator</span>
              <span className="text-indigo-400">Lens</span>
            </span>
          </a>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-3">Integrations</h1>
          <p className="text-sm text-zinc-500 max-w-lg mx-auto">
            Connect your existing tools to unlock deeper intelligence. Each integration adds a new dimension to your creator matching.
          </p>
        </div>

        {INTEGRATIONS.map((cat) => (
          <div key={cat.category} className="mb-10">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">{cat.category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cat.items.map((item) => (
                <div
                  key={item.name}
                  className={`bg-zinc-900/60 border rounded-xl p-5 transition-all ${
                    item.status === "soon"
                      ? "border-zinc-800/50 opacity-50"
                      : "border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-xl flex-shrink-0">
                      {item.logo}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white">{item.name}</div>
                      <div className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{item.description}</div>
                    </div>
                  </div>

                  {item.unlock && (
                    <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-lg px-3 py-2 mb-3">
                      <div className="text-[10px] text-indigo-300">
                        <span className="font-semibold">Unlocks:</span> {item.unlock}
                      </div>
                    </div>
                  )}

                  <button
                    className={`w-full py-2 rounded-lg text-xs font-semibold transition-all ${
                      item.status === "functional"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                        : item.status === "soon"
                          ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                          : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700"
                    }`}
                    disabled={item.status === "soon"}
                  >
                    {item.status === "functional" ? "✓ Active" : item.status === "soon" ? "Coming Soon" : "Connect"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Enterprise CTA */}
        <div className="mt-12 bg-indigo-500/5 border border-indigo-500/15 rounded-2xl p-8 text-center">
          <h3 className="text-lg font-bold text-white mb-2">Need a custom integration?</h3>
          <p className="text-sm text-zinc-400 mb-4 max-w-md mx-auto">
            We build custom connectors for enterprise platforms. Contact us to discuss your tech stack.
          </p>
          <button className="px-6 py-2.5 bg-indigo-500 text-white text-sm font-semibold rounded-xl hover:bg-indigo-400 transition-colors">
            Contact Enterprise Sales
          </button>
        </div>
      </div>
    </div>
  );
}
