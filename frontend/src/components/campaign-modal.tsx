"use client";

import type { CampaignData } from "@/lib/api";
import { formatINR, formatNumber } from "@/lib/api";

export function CampaignModal({ data, onClose, productUrl }: {
  data: CampaignData;
  onClose: () => void;
  productUrl: string;
}) {
  const s = data.summary;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0a0f] border border-zinc-800 rounded-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0a0a0f]/95 backdrop-blur-sm border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-base font-bold text-white">Campaign Plan</div>
            <div className="text-xs text-zinc-500">
              {s.creator_count} creators · {data.product?.brand} {data.product?.model}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="p-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-white font-mono">{s.creator_count}</div>
              <div className="text-[9px] text-zinc-500 uppercase tracking-wider">Creators</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-emerald-400 font-mono">
                {formatINR(s.budget_min)} - {formatINR(s.budget_max)}
              </div>
              <div className="text-[9px] text-zinc-500 uppercase tracking-wider">Budget Range</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-indigo-400 font-mono">{formatNumber(s.estimated_reach)}</div>
              <div className="text-[9px] text-zinc-500 uppercase tracking-wider">Est. Reach</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-amber-400 font-mono">₹{s.avg_cpv.toFixed(2)}</div>
              <div className="text-[9px] text-zinc-500 uppercase tracking-wider">Avg CPV</div>
            </div>
          </div>

          {/* Language mix */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Language Coverage</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(s.language_mix).map(([lang, count]) => (
                <div key={lang} className="flex items-center gap-1.5 bg-zinc-800 rounded-lg px-3 py-1.5">
                  <span className="text-xs font-medium text-white capitalize">{lang}</span>
                  <span className="text-xs font-mono text-indigo-400">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Creator table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="grid grid-cols-[1fr_80px_80px_80px_80px_80px] gap-0 text-[10px] text-zinc-500 uppercase tracking-wider px-4 py-2 border-b border-zinc-800">
              <div>Creator</div>
              <div className="text-right">Score</div>
              <div className="text-right">Cost</div>
              <div className="text-right">Views</div>
              <div className="text-right">CPV</div>
              <div className="text-right">Lang</div>
            </div>
            {data.creators.map(c => (
              <div key={c.id} className="grid grid-cols-[1fr_80px_80px_80px_80px_80px] gap-0 px-4 py-3 border-b border-zinc-800/50 hover:bg-zinc-800/30">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={c.thumbnail_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=6366f1&color=fff&size=28`}
                    className="w-7 h-7 rounded-full object-cover bg-zinc-800 flex-shrink-0"
                    alt=""
                  />
                  <div className="min-w-0">
                    <div className="text-xs text-white truncate">{c.name}</div>
                    <div className="text-[10px] text-zinc-600">{formatNumber(c.subscriber_count)} · {c.tier}</div>
                  </div>
                </div>
                <div className="text-right text-xs font-mono text-white self-center">{c.match_score.toFixed(0)}</div>
                <div className="text-right text-xs font-mono text-zinc-300 self-center">{formatINR(c.cost_min)}</div>
                <div className="text-right text-xs font-mono text-zinc-300 self-center">{formatNumber(c.predicted_views)}</div>
                <div className="text-right text-xs font-mono text-zinc-300 self-center">₹{c.cpv.toFixed(2)}</div>
                <div className="text-right text-[11px] text-zinc-400 capitalize self-center">{c.primary_language}</div>
              </div>
            ))}
          </div>

          {/* Insight nudge */}
          <div className="mt-6 bg-indigo-500/5 border border-indigo-500/15 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-lg">⚡</span>
              <div>
                <div className="text-xs font-semibold text-indigo-300 mb-1">Unlock deeper campaign intelligence</div>
                <div className="text-[11px] text-zinc-400 leading-relaxed">
                  Connect Flipkart Affiliate to see actual sales per creator. Connect Phyllo for Instagram cross-platform reach.
                  Upgrade to Enterprise for real-time competitive alerts.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
