"use client";

import type { CreatorMatch } from "@/lib/api";
import { formatNumber, formatINR } from "@/lib/api";

const TIER_STYLES: Record<string, string> = {
  mega: "text-purple-300 bg-purple-500/10 border-purple-500/20",
  macro: "text-blue-300 bg-blue-500/10 border-blue-500/20",
  mid: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
  micro: "text-amber-300 bg-amber-500/10 border-amber-500/20",
  nano: "text-stone-400 bg-stone-500/10 border-stone-500/20",
};

const MIX_LABELS: Record<string, { label: string; color: string }> = {
  hybrid: { label: "Hybrid", color: "text-emerald-300 bg-emerald-500/8" },
  longform: { label: "Long-form", color: "text-blue-300 bg-blue-500/8" },
  shorts_only: { label: "Shorts", color: "text-amber-300 bg-amber-500/8" },
  balanced: { label: "Mixed", color: "text-stone-400 bg-stone-500/8" },
};

function DimensionBar({ label, score }: { label: string; score: number }) {
  const color = score >= 60 ? "from-emerald-500 to-emerald-400" : score >= 35 ? "from-amber-500 to-amber-400" : "from-stone-600 to-stone-500";
  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[8px] text-[var(--text-dim)] uppercase tracking-wider font-medium">{label}</span>
        <span className="text-[9px] font-[family-name:var(--font-mono)] text-[var(--text-muted)] font-semibold">{score.toFixed(0)}</span>
      </div>
      <div className="h-1.5 bg-[var(--bg)] rounded-full overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${color} animate-bar`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function CreatorCard({ creator, onSelect, isInCampaign, onToggleCampaign, productBrand, index }: {
  creator: CreatorMatch;
  onSelect: (id: number) => void;
  isInCampaign: boolean;
  onToggleCampaign: (id: number) => void;
  productBrand: string;
  index: number;
}) {
  const c = creator.creator;
  const mix = MIX_LABELS[creator.format_mix] || MIX_LABELS.balanced;
  const isTop3 = creator.rank <= 3;

  return (
    <div
      className={`bg-[var(--bg-card)] border rounded-2xl p-5 cursor-pointer card-hover animate-fade-in ${
        isTop3 ? "glow-border" : isInCampaign ? "border-[var(--accent)]/50" : "border-[var(--border)]"
      }`}
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
      onClick={() => onSelect(c.id)}
    >
      {/* Rank + Score + Campaign */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-extrabold ${
            isTop3 ? "bg-gradient-to-br from-[var(--accent)] to-purple-500 text-white shadow-[0_0_12px_rgba(129,140,248,0.25)]" : "bg-[var(--bg-elevated)] text-[var(--text-dim)] border border-[var(--border)]"
          }`}>
            {creator.rank}
          </div>
          <div className={`px-2.5 py-1 rounded-lg text-xs font-bold font-[family-name:var(--font-mono)] border ${
            creator.match_score >= 65 ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/20"
            : creator.match_score >= 45 ? "text-amber-300 bg-amber-500/10 border-amber-500/20"
            : "text-stone-400 bg-stone-500/10 border-stone-500/20"
          }`}>
            {creator.match_score.toFixed(0)}
          </div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onToggleCampaign(c.id); }}
          className={`text-[10px] px-3 py-1.5 rounded-lg font-semibold transition-all ${
            isInCampaign ? "bg-[var(--accent)] text-white shadow-[0_0_8px_rgba(129,140,248,0.3)]" : "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]"
          }`}>
          {isInCampaign ? "✓ Added" : "+ Campaign"}
        </button>
      </div>

      {/* Creator info */}
      <div className="flex items-center gap-3 mb-4">
        <img
          src={c.thumbnail_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=44403c&color=e7e5e4&size=44`}
          alt={c.name}
          className="w-11 h-11 rounded-full object-cover bg-[var(--bg-elevated)] ring-2 ring-[var(--border)]"
          onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=44403c&color=e7e5e4&size=44`; }}
        />
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-[var(--text)] truncate">{c.name}</div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[11px] text-[var(--text-muted)]">{formatNumber(c.subscriber_count)}</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${TIER_STYLES[c.tier] || TIER_STYLES.nano}`}>{c.tier}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium ${mix.color}`}>{mix.label}</span>
          </div>
        </div>
      </div>

      {/* Score dimensions */}
      <div className="flex gap-2 mb-4">
        {Object.entries(creator.dimensions).map(([key, dim]) => {
          const label = key === "brand_price_fit" ? "Brand" : key === "feature_relevance" ? "Feature" : "Quality";
          return <DimensionBar key={key} label={label} score={dim.score} />;
        })}
      </div>

      {/* Brand evidence */}
      {creator.brand_evidence.length > 0 && (
        <div className="bg-[var(--accent-dim)] border border-[var(--accent)]/10 rounded-xl px-3 py-2 mb-3">
          <div className="text-[10px] text-[var(--accent)] font-medium">
            ✓ {creator.brand_evidence.length} {productBrand} video{creator.brand_evidence.length > 1 ? "s" : ""} — top: {formatNumber(creator.brand_evidence[0].views)} views
          </div>
        </div>
      )}

      {/* Why + concerns */}
      <div className="text-[11px] text-[var(--text-muted)] leading-relaxed line-clamp-2 mb-3">
        {creator.match_reasons.slice(0, 2).join(" · ")}
      </div>
      {creator.fraud_flags.length > 0 && (
        <div className="text-[10px] text-[var(--danger)]/80 mb-2">🚩 {creator.fraud_flags[0]}</div>
      )}
      {creator.concerns.length > 0 && (
        <div className="text-[10px] text-[var(--warning)]/80 mb-2">⚠ {creator.concerns[0]}</div>
      )}

      {/* Bottom stats */}
      <div className="flex items-center gap-3 pt-3 border-t border-[var(--border)]/50 text-[var(--text-dim)]">
        <div className="flex items-center gap-1">
          <span className="text-[9px]">Views:</span>
          <span className="text-[11px] font-[family-name:var(--font-mono)] text-[var(--text-muted)]">{formatNumber(creator.predicted_views)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[9px]">CPV:</span>
          <span className="text-[11px] font-[family-name:var(--font-mono)] text-[var(--text-muted)]">₹{creator.predicted_cpv.toFixed(2)}</span>
        </div>
        <div className="flex-1" />
        <span className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] text-[var(--text-dim)] capitalize">{c.primary_language}</span>
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
  if (!creators.length) {
    return <div className="text-center py-20 text-[var(--text-dim)] text-sm">No creators match. Try adjusting filters.</div>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {creators.map((c, i) => (
        <CreatorCard key={c.creator.id} creator={c} onSelect={onSelect} index={i}
          isInCampaign={campaignIds.includes(c.creator.id)} onToggleCampaign={onToggleCampaign} productBrand={productBrand} />
      ))}
    </div>
  );
}
