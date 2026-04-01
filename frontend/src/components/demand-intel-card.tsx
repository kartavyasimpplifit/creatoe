"use client";

import type { DemandIntelligence, ProductData } from "@/lib/api";
import { formatINR, formatNumber } from "@/lib/api";

export function DemandIntelCard({ intel, product }: {
  intel: DemandIntelligence;
  product: ProductData;
}) {
  const gap = intel.competitive_gap;
  const scenario = intel.activation_scenario;

  return (
    <div className="h-full rounded-2xl p-6 animate-fade-in" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", animationDelay: "100ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div className="text-[9px] tracking-[0.25em] uppercase font-normal" style={{ color: "var(--text-muted)" }}>Demand Intelligence</div>
        <div className="flex items-center gap-1.5 text-[9px]" style={{ color: "var(--text-dim)" }}>
          <div className="w-1.5 h-1.5 rounded-full pulse-ring" style={{ backgroundColor: "var(--success)" }} />
          Live
        </div>
      </div>

      <div className="mb-6">
        <div className="text-[9px] tracking-[0.2em] uppercase mb-3 font-normal" style={{ color: "var(--text-dim)" }}>Share of Voice</div>
        <div className="space-y-2.5">
          {Object.entries(intel.brand_video_counts)
            .sort(([, a], [, b]) => b - a).slice(0, 5)
            .map(([brand, count]) => {
              const max = Math.max(...Object.values(intel.brand_video_counts));
              const pct = (count / max) * 100;
              const isTarget = brand === product.brand;
              return (
                <div key={brand} className="flex items-center gap-3">
                  <span className="text-[11px] w-14 truncate font-light" style={{ color: isTarget ? "var(--text)" : "var(--text-dim)" }}>{brand}</span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg)" }}>
                    <div className="h-full rounded-full animate-bar" style={{ width: `${pct}%`, backgroundColor: isTarget ? "rgba(255,255,255,0.5)" : "var(--bg-elevated)" }} />
                  </div>
                  <span className="text-[10px] w-7 text-right" style={{ color: isTarget ? "var(--text)" : "var(--text-dim)", fontFamily: "var(--font-mono)" }}>{count}</span>
                </div>
              );
            })}
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="flex-1 rounded-xl p-3 text-center" style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)" }}>
          <div className="text-2xl font-light" style={{ color: "#f97316", fontFamily: "var(--font-mono)" }}>{intel.flipkart_associated}</div>
          <div className="text-[8px] tracking-[0.2em] mt-1 font-normal lowercase" style={{ color: "var(--text-dim)" }}>flipkart</div>
        </div>
        <div className="flex-1 rounded-xl p-3 text-center" style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)" }}>
          <div className="text-2xl font-light" style={{ color: "#facc15", fontFamily: "var(--font-mono)" }}>{intel.amazon_associated}</div>
          <div className="text-[8px] tracking-[0.2em] mt-1 font-normal lowercase" style={{ color: "var(--text-dim)" }}>amazon</div>
        </div>
      </div>

      {intel.language_gaps.length > 0 && (
        <div className="mb-6">
          <div className="text-[9px] tracking-[0.2em] uppercase mb-2 font-normal" style={{ color: "var(--warning)" }}>Coverage Gaps</div>
          {intel.language_gaps.slice(0, 2).map(g => (
            <div key={g.language} className="text-[11px] font-light mb-1.5 leading-relaxed" style={{ color: "var(--text-muted)" }}>
              <span style={{ color: "var(--warning)" }}>{g.language.charAt(0).toUpperCase() + g.language.slice(1)}</span>: {g.opportunity}
            </div>
          ))}
        </div>
      )}

      {gap && (
        <div className="rounded-xl p-3.5 mb-5" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
          <div className="text-[11px] font-light leading-relaxed" style={{ color: "var(--text-secondary)" }}>{gap.message}</div>
          <div className="text-[10px] mt-1.5 font-light" style={{ color: "var(--text-muted)" }}>Est. cost: {formatINR(gap.estimated_cost_to_close)}</div>
        </div>
      )}

      <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)" }}>
        <div className="text-[9px] tracking-[0.2em] uppercase mb-3 font-normal" style={{ color: "var(--text-dim)" }}>
          Activate {scenario.creators_to_activate} creators
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { label: "budget", value: formatINR(scenario.estimated_budget_min), color: "var(--text)" },
            { label: "reach", value: formatNumber(scenario.estimated_reach), color: "var(--text)" },
            { label: "cpv", value: `₹${scenario.estimated_cpv.toFixed(2)}`, color: "var(--gold)" },
          ].map(s => (
            <div key={s.label}>
              <div className="text-xl font-light" style={{ color: s.color, fontFamily: "var(--font-mono)" }}>{s.value}</div>
              <div className="text-[7px] tracking-[0.2em] mt-0.5 lowercase" style={{ color: "var(--text-dim)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
