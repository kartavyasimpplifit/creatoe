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
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Demand Intelligence</div>
        <div className="text-[10px] text-zinc-600">Live data</div>
      </div>

      {/* Competitive bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-zinc-400">Creator Share of Voice</span>
        </div>
        <div className="space-y-1.5">
          {Object.entries(intel.brand_video_counts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([brand, count]) => {
              const max = Math.max(...Object.values(intel.brand_video_counts));
              const pct = (count / max) * 100;
              const isTarget = brand === product.brand;
              return (
                <div key={brand} className="flex items-center gap-2">
                  <span className={`text-[11px] w-16 ${isTarget ? "text-indigo-300 font-semibold" : "text-zinc-500"}`}>
                    {brand}
                  </span>
                  <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${isTarget ? "bg-indigo-500" : "bg-zinc-600"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-mono w-8 text-right ${isTarget ? "text-indigo-300" : "text-zinc-600"}`}>
                    {count}
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Marketplace comparison */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 bg-zinc-800/50 rounded-lg p-2.5 text-center">
          <div className="text-sm font-bold text-orange-400 font-mono">{intel.flipkart_associated}</div>
          <div className="text-[9px] text-zinc-500 uppercase">Flipkart</div>
        </div>
        <div className="flex-1 bg-zinc-800/50 rounded-lg p-2.5 text-center">
          <div className="text-sm font-bold text-yellow-400 font-mono">{intel.amazon_associated}</div>
          <div className="text-[9px] text-zinc-500 uppercase">Amazon</div>
        </div>
      </div>

      {/* Language gaps */}
      {intel.language_gaps.length > 0 && (
        <div className="mb-4">
          <div className="text-[10px] text-amber-400 uppercase tracking-wider mb-1.5 font-semibold">Coverage Gaps</div>
          {intel.language_gaps.slice(0, 2).map(g => (
            <div key={g.language} className="text-[11px] text-zinc-400 mb-1 leading-relaxed">
              <span className="text-amber-400 font-medium">{g.language.charAt(0).toUpperCase() + g.language.slice(1)}</span>: {g.opportunity}
            </div>
          ))}
        </div>
      )}

      {/* Competitive gap callout */}
      {gap && (
        <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-lg p-3 mb-3">
          <div className="text-[11px] text-indigo-300 leading-relaxed">{gap.message}</div>
          <div className="text-[10px] text-zinc-500 mt-1">
            Est. cost to close: {formatINR(gap.estimated_cost_to_close)}
          </div>
        </div>
      )}

      {/* Activation scenario */}
      <div className="bg-zinc-800/30 border border-zinc-800 rounded-lg p-3">
        <div className="text-[10px] text-zinc-400 uppercase tracking-wider mb-2 font-semibold">
          Activation Scenario: {scenario.creators_to_activate} creators
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xs font-bold text-white font-mono">{formatINR(scenario.estimated_budget_min)}</div>
            <div className="text-[9px] text-zinc-600">Budget (min)</div>
          </div>
          <div>
            <div className="text-xs font-bold text-white font-mono">{formatNumber(scenario.estimated_reach)}</div>
            <div className="text-[9px] text-zinc-600">Est. Reach</div>
          </div>
          <div>
            <div className="text-xs font-bold text-white font-mono">₹{scenario.estimated_cpv.toFixed(2)}</div>
            <div className="text-[9px] text-zinc-600">CPV</div>
          </div>
        </div>
      </div>
    </div>
  );
}
