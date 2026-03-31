"use client";

import type { CreatorMatch } from "@/lib/api";
import { formatNumber, formatINR } from "@/lib/api";

const TIER_COLORS: Record<string, string> = {
  mega: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  macro: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  mid: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  micro: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  nano: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20",
};

const MIX_BADGES: Record<string, { label: string; color: string }> = {
  hybrid: { label: "Hybrid", color: "text-emerald-400 bg-emerald-400/10" },
  longform: { label: "Long-form", color: "text-blue-400 bg-blue-400/10" },
  shorts_only: { label: "Shorts Only", color: "text-amber-400 bg-amber-400/10" },
  balanced: { label: "Balanced", color: "text-zinc-400 bg-zinc-800" },
};

function ScorePill({ score }: { score: number }) {
  const color = score >= 65 ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
    : score >= 45 ? "text-amber-400 bg-amber-400/10 border-amber-400/20"
    : "text-zinc-400 bg-zinc-800 border-zinc-700";

  return (
    <div className={`px-2 py-0.5 rounded-md text-xs font-bold font-mono border ${color}`}>
      {score.toFixed(0)}
    </div>
  );
}

function CreatorCard({ creator, onSelect, isInCampaign, onToggleCampaign, productBrand }: {
  creator: CreatorMatch;
  onSelect: (id: number) => void;
  isInCampaign: boolean;
  onToggleCampaign: (id: number) => void;
  productBrand: string;
}) {
  const c = creator.creator;
  const mix = MIX_BADGES[creator.format_mix] || MIX_BADGES.balanced;
  const hasEvidence = creator.brand_evidence.length > 0;

  return (
    <div
      className={`group bg-zinc-900/60 border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:bg-zinc-900 ${
        creator.rank <= 3
          ? "border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.08)]"
          : isInCampaign
            ? "border-indigo-500/50 ring-1 ring-indigo-500/20"
            : "border-zinc-800 hover:border-zinc-700"
      }`}
      onClick={() => onSelect(c.id)}
    >
      {/* Rank + Score row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
            creator.rank <= 3 ? "bg-indigo-500 text-white" : "bg-zinc-800 text-zinc-400"
          }`}>
            {creator.rank}
          </div>
          <ScorePill score={creator.match_score} />
        </div>
        <button
          onClick={e => { e.stopPropagation(); onToggleCampaign(c.id); }}
          className={`text-[10px] px-2.5 py-1 rounded-lg font-medium transition-all ${
            isInCampaign
              ? "bg-indigo-500 text-white"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
          }`}
        >
          {isInCampaign ? "✓ Added" : "+ Campaign"}
        </button>
      </div>

      {/* Creator info */}
      <div className="flex items-center gap-3 mb-3">
        <img
          src={c.thumbnail_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=6366f1&color=fff&size=40`}
          alt={c.name}
          className="w-10 h-10 rounded-full object-cover bg-zinc-800"
          onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=6366f1&color=fff&size=40`; }}
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
            {c.name}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] text-zinc-500">{formatNumber(c.subscriber_count)}</span>
            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${TIER_COLORS[c.tier] || TIER_COLORS.nano}`}>
              {c.tier}
            </span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded ${mix.color}`}>{mix.label}</span>
          </div>
        </div>
      </div>

      {/* Score dimensions mini */}
      <div className="flex gap-1 mb-3">
        {Object.entries(creator.dimensions).map(([key, dim]) => {
          const label = key === "brand_price_fit" ? "Brand" : key === "feature_relevance" ? "Feature" : "Quality";
          const w = (dim.score / 100) * 100;
          return (
            <div key={key} className="flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[8px] text-zinc-600 uppercase">{label}</span>
                <span className="text-[9px] font-mono text-zinc-500">{dim.score.toFixed(0)}</span>
              </div>
              <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${dim.score >= 60 ? "bg-emerald-500" : dim.score >= 35 ? "bg-amber-500" : "bg-zinc-600"}`}
                  style={{ width: `${w}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Brand evidence */}
      {hasEvidence && (
        <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-lg px-2.5 py-1.5 mb-3">
          <div className="text-[10px] text-indigo-300">
            ✓ {creator.brand_evidence.length} {productBrand} video{creator.brand_evidence.length > 1 ? "s" : ""} — top: {formatNumber(creator.brand_evidence[0].views)} views
          </div>
        </div>
      )}

      {/* Why statement */}
      <div className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2 mb-3">
        {creator.match_reasons.slice(0, 2).join(" · ")}
      </div>

      {/* Concerns */}
      {creator.concerns.length > 0 && (
        <div className="text-[10px] text-amber-400/70 mb-3">
          ⚠ {creator.concerns[0]}
        </div>
      )}

      {/* Fraud flags */}
      {creator.fraud_flags.length > 0 && (
        <div className="text-[10px] text-red-400/70 mb-3">
          🚩 {creator.fraud_flags[0]}
        </div>
      )}

      {/* Bottom stats */}
      <div className="flex items-center gap-3 pt-3 border-t border-zinc-800/50">
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-zinc-600">Views:</span>
          <span className="text-[11px] font-mono text-zinc-400">{formatNumber(creator.predicted_views)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-zinc-600">CPV:</span>
          <span className="text-[11px] font-mono text-zinc-400">₹{creator.predicted_cpv.toFixed(2)}</span>
        </div>
        <div className="flex-1" />
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">
          {c.primary_language}
        </span>
      </div>
    </div>
  );
}

export function CreatorGrid({ creators, onSelect, campaignIds, onToggleCampaign, productBrand }: {
  creators: CreatorMatch[];
  onSelect: (id: number) => void;
  campaignIds: number[];
  onToggleCampaign: (id: number) => void;
  productBrand: string;
}) {
  if (creators.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-500 text-sm">
        No creators match these filters. Try adjusting your selection.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {creators.map(c => (
        <CreatorCard
          key={c.creator.id}
          creator={c}
          onSelect={onSelect}
          isInCampaign={campaignIds.includes(c.creator.id)}
          onToggleCampaign={onToggleCampaign}
          productBrand={productBrand}
        />
      ))}
    </div>
  );
}
