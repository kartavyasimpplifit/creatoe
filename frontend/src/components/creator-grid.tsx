"use client";

import type { CreatorMatch } from "@/lib/api";
import { formatNumber } from "@/lib/api";
import { Plus, Check } from "lucide-react";

const TIER_COLORS: Record<string, string> = {
  mega: "#a78bfa",
  macro: "#60a5fa",
  mid: "#34d399",
  micro: "#fbbf24",
  nano: "#888",
};

interface Flag {
  label: string;
  type: "green" | "amber" | "blue";
}

function FlagPill({ flag }: { flag: Flag }) {
  const cls = flag.type === "green" ? "flag-green" : flag.type === "amber" ? "flag-amber" : "flag-blue";
  return (
    <span className={`${cls} text-[9px] font-normal px-2 py-0.5 rounded-full`}>
      {flag.label}
    </span>
  );
}

function CreatorCard({ creator, onSelect, isInCampaign, onToggleCampaign, index }: {
  creator: CreatorMatch;
  onSelect: (id: number) => void;
  isInCampaign: boolean;
  onToggleCampaign: (id: number) => void;
  index: number;
}) {
  const c = creator.creator;
  const isTop3 = creator.rank <= 3;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flags: Flag[] = (creator as any).flags || [];
  const visibleFlags = flags.slice(0, 2);

  return (
    <div
      className={`rounded-2xl cursor-pointer card-hover animate-fade-in overflow-hidden ${isTop3 ? "glow-border" : ""}`}
      style={{
        backgroundColor: "var(--bg-card)",
        border: `1px solid ${isInCampaign ? "rgba(129,140,248,0.3)" : "var(--border)"}`,
        animationDelay: `${Math.min(index * 60, 600)}ms`,
        borderTop: isTop3 ? "2px solid" : undefined,
        borderImage: isTop3 ? "linear-gradient(90deg, var(--accent), #a78bfa) 1" : undefined,
      }}
      onClick={() => onSelect(c.id)}
    >
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <img
              src={c.thumbnail_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=111&color=e8e8e8&size=56`}
              alt={c.name}
              className="w-12 h-12 rounded-full object-cover"
              style={{ border: `2px solid ${TIER_COLORS[c.tier] || "#333"}22` }}
              onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=111&color=e8e8e8&size=56`; }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-normal truncate" style={{ color: "var(--text)" }}>{c.name}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{formatNumber(c.subscriber_count)}</span>
              <span className="text-[9px] font-medium uppercase" style={{ color: TIER_COLORS[c.tier] || "#888" }}>
                {c.tier}
              </span>
            </div>
          </div>
          <div
            className="text-lg font-light tabular-nums"
            style={{
              color: creator.match_score >= 65 ? "var(--success)" : creator.match_score >= 45 ? "var(--warning)" : "var(--text-muted)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {creator.match_score.toFixed(0)}
          </div>
        </div>

        {visibleFlags.length > 0 && (
          <div className="flex gap-1.5 mb-3">
            {visibleFlags.map((f, i) => <FlagPill key={i} flag={f} />)}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="flex items-center gap-4 text-[10px]" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          <span>{formatNumber(creator.predicted_views)} views</span>
          <span>₹{creator.predicted_cpv.toFixed(2)} cpv</span>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onToggleCampaign(c.id); }}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300"
          style={{
            backgroundColor: isInCampaign ? "var(--accent)" : "transparent",
            border: isInCampaign ? "none" : "1px solid var(--border)",
            color: isInCampaign ? "white" : "var(--text-dim)",
          }}
        >
          {isInCampaign ? <Check size={12} /> : <Plus size={12} />}
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
      <div className="text-center py-24 text-[13px] font-light" style={{ color: "var(--text-muted)" }}>
        No creators match your filters.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
