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
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 h-full animate-fade-in" style={{ animationDelay: "100ms" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-[0.15em]">Demand Intelligence</div>
        <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-dim)]">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse-glow" />
          Live
        </div>
      </div>

      {/* Competitive bars */}
      <div className="mb-5">
        <div className="text-[10px] text-[var(--text-dim)] uppercase tracking-[0.12em] mb-2.5 font-medium">Creator Share of Voice</div>
        <div className="space-y-2">
          {Object.entries(intel.brand_video_counts)
            .sort(([, a], [, b]) => b - a).slice(0, 5)
            .map(([brand, count]) => {
              const max = Math.max(...Object.values(intel.brand_video_counts));
              const pct = (count / max) * 100;
              const isTarget = brand === product.brand;
              return (
                <div key={brand} className="flex items-center gap-2.5">
                  <span className={`text-[11px] w-[4.5rem] font-medium ${isTarget ? "text-[var(--accent)]" : "text-[var(--text-dim)]"}`}>{brand}</span>
                  <div className="flex-1 h-2 bg-[var(--bg)] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full animate-bar ${isTarget ? "bg-gradient-to-r from-[var(--accent)] to-purple-400" : "bg-[var(--bg-elevated)]"}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className={`text-[10px] font-[family-name:var(--font-mono)] w-8 text-right ${isTarget ? "text-[var(--accent)]" : "text-[var(--text-dim)]"}`}>{count}</span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Marketplace split */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1 bg-[var(--bg)] rounded-xl p-3 text-center border border-[var(--border)]">
          <div className="text-base font-bold text-orange-400 font-[family-name:var(--font-mono)]">{intel.flipkart_associated}</div>
          <div className="text-[9px] text-[var(--text-dim)] uppercase tracking-[0.12em] mt-0.5 font-medium">Flipkart</div>
        </div>
        <div className="flex-1 bg-[var(--bg)] rounded-xl p-3 text-center border border-[var(--border)]">
          <div className="text-base font-bold text-yellow-400 font-[family-name:var(--font-mono)]">{intel.amazon_associated}</div>
          <div className="text-[9px] text-[var(--text-dim)] uppercase tracking-[0.12em] mt-0.5 font-medium">Amazon</div>
        </div>
      </div>

      {/* Language gaps */}
      {intel.language_gaps.length > 0 && (
        <div className="mb-5">
          <div className="text-[10px] text-[var(--warning)] uppercase tracking-[0.12em] mb-2 font-bold">Coverage Gaps</div>
          {intel.language_gaps.slice(0, 2).map(g => (
            <div key={g.language} className="text-[11px] text-[var(--text-muted)] mb-1.5 leading-relaxed">
              <span className="text-[var(--warning)] font-semibold">{g.language.charAt(0).toUpperCase() + g.language.slice(1)}</span>: {g.opportunity}
            </div>
          ))}
        </div>
      )}

      {/* Competitive gap */}
      {gap && (
        <div className="bg-[var(--accent-dim)] border border-[var(--accent)]/15 rounded-xl p-3.5 mb-4">
          <div className="text-[11px] text-[var(--accent)] leading-relaxed font-medium">{gap.message}</div>
          <div className="text-[10px] text-[var(--text-dim)] mt-1.5">Est. cost to close: {formatINR(gap.estimated_cost_to_close)}</div>
        </div>
      )}

      {/* Activation scenario */}
      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-3.5">
        <div className="text-[10px] text-[var(--text-dim)] uppercase tracking-[0.12em] mb-2.5 font-bold">
          Scenario: Activate {scenario.creators_to_activate} Creators
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Budget", value: formatINR(scenario.estimated_budget_min), color: "text-[var(--text)]" },
            { label: "Reach", value: formatNumber(scenario.estimated_reach), color: "text-[var(--accent)]" },
            { label: "CPV", value: `₹${scenario.estimated_cpv.toFixed(2)}`, color: "text-[var(--gold)]" },
          ].map(s => (
            <div key={s.label}>
              <div className={`text-sm font-bold font-[family-name:var(--font-mono)] ${s.color}`}>{s.value}</div>
              <div className="text-[8px] text-[var(--text-dim)] uppercase tracking-wider mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
