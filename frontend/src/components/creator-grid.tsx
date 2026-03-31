"use client";

import type { CreatorMatch } from "@/lib/api";
import { formatNumber } from "@/lib/api";
import { Plus, Check } from "lucide-react";

const TIER_COLORS: Record<string, string> = {
  mega: "text-purple-400",
  macro: "text-blue-400",
  mid: "text-emerald-400",
  micro: "text-amber-400",
  nano: "text-stone-400",
};

function CreatorCard({ creator, onSelect, isInCampaign, onToggleCampaign, index }: {
  creator: CreatorMatch;
  onSelect: (id: number) => void;
  isInCampaign: boolean;
  onToggleCampaign: (id: number) => void;
  index: number;
}) {
  const c = creator.creator;
  const isTop3 = creator.rank <= 3;

  return (
    <div
      className={`bg-[var(--bg-card)] border rounded-2xl overflow-hidden cursor-pointer card-hover animate-fade-in ${
        isTop3 ? "glow-border" : isInCampaign ? "border-[var(--accent)]/40" : "border-[var(--border)]"
      }`}
      style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
      onClick={() => onSelect(c.id)}
    >
      {/* Header with rank badge */}
      <div className="relative px-5 pt-5 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <img
            src={c.thumbnail_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=222&color=fff&size=48`}
            alt={c.name}
            className="w-12 h-12 rounded-full object-cover bg-[var(--bg-elevated)]"
            onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=222&color=fff&size=48`; }}
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-[var(--text)] truncate">{c.name}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] text-[var(--text-secondary)]">{formatNumber(c.subscriber_count)}</span>
              <span className={`text-[10px] font-semibold uppercase ${TIER_COLORS[c.tier] || "text-stone-400"}`}>
                {c.tier}
              </span>
            </div>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
            creator.match_score >= 65 ? "bg-emerald-500/10 text-emerald-400"
            : creator.match_score >= 45 ? "bg-amber-500/10 text-amber-400"
            : "bg-[var(--bg-elevated)] text-[var(--text-muted)]"
          }`} style={{ fontFamily: "var(--font-mono)" }}>
            {creator.match_score.toFixed(0)}
          </div>
        </div>

        {/* Match reason */}
        {creator.match_reasons.length > 0 && (
          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed line-clamp-2 mb-3">
            {creator.match_reasons[0]}
          </p>
        )}

        {/* Brand evidence */}
        {creator.brand_evidence.length > 0 && (
          <div className="bg-[var(--accent-dim)] rounded-lg px-3 py-2 mb-3">
            <span className="text-[10px] text-[var(--accent)] font-medium">
              {creator.brand_evidence.length} brand video{creator.brand_evidence.length > 1 ? "s" : ""} · {formatNumber(creator.brand_evidence[0].views)} views
            </span>
          </div>
        )}

        {/* Fraud / concern flags */}
        {creator.fraud_flags.length > 0 && (
          <div className="text-[10px] text-[var(--danger)] mb-1">{creator.fraud_flags[0]}</div>
        )}
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--border)] bg-[var(--bg-surface)]">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Views</div>
            <div className="text-xs font-semibold text-[var(--text-secondary)]" style={{ fontFamily: "var(--font-mono)" }}>
              {formatNumber(creator.predicted_views)}
            </div>
          </div>
          <div>
            <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">CPV</div>
            <div className="text-xs font-semibold text-[var(--text-secondary)]" style={{ fontFamily: "var(--font-mono)" }}>
              ₹{creator.predicted_cpv.toFixed(2)}
            </div>
          </div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onToggleCampaign(c.id); }}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
            isInCampaign
              ? "bg-[var(--accent)] text-white"
              : "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]"
          }`}
        >
          {isInCampaign ? <Check size={14} /> : <Plus size={14} />}
        </button>
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
    return (
      <div className="text-center py-24 text-[var(--text-muted)] text-sm">
        No creators match your filters. Try broadening your criteria.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {creators.map((c, i) => (
        <CreatorCard
          key={c.creator.id}
          creator={c}
          onSelect={onSelect}
          index={i}
          isInCampaign={campaignIds.includes(c.creator.id)}
          onToggleCampaign={onToggleCampaign}
        />
      ))}
    </div>
  );
}
