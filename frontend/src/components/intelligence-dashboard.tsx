"use client";

import type { StatsResponse } from "@/lib/api";
import { formatNumber } from "@/lib/api";

const TIER_COLORS: Record<string, string> = {
  mega: "#a78bfa", macro: "#60a5fa", mid: "#34d399", micro: "#fbbf24", nano: "#888",
};

const LANG_LABELS: Record<string, string> = {
  english: "English", hindi: "Hindi", tamil: "Tamil",
  bengali: "Bengali", telugu: "Telugu", kannada: "Kannada",
};

export function IntelligenceDashboard({ stats }: { stats: StatsResponse | null }) {
  if (!stats) {
    return <div className="min-h-[60vh] flex items-center justify-center text-[13px] font-light" style={{ color: "var(--text-dim)" }}>Loading intelligence...</div>;
  }

  const tierTotal = Object.values(stats.tiers).reduce((a, b) => a + b, 0) || 1;
  const langTotal = Object.values(stats.languages).reduce((a, b) => a + b, 0) || 1;

  const heroStats = [
    { label: "total creators", value: stats.total_creators.toLocaleString() },
    { label: "phone creators", value: stats.phone_creators.toLocaleString() },
    { label: "videos analyzed", value: formatNumber(stats.analyzed_videos) },
    { label: "languages", value: Object.keys(stats.languages).length.toString() },
  ];

  return (
    <div className="max-w-[1100px] mx-auto px-8 pt-16 pb-32 hero-glow">
      <div className="relative z-10">
        <div className="text-center mb-16 animate-slide-up">
          <h1 className="text-3xl font-light tracking-tight text-gradient mb-3">Creator Intelligence</h1>
          <p className="text-[13px] font-light" style={{ color: "var(--text-muted)" }}>
            Real-time landscape across {stats.total_creators.toLocaleString()} creators
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {heroStats.map((s, i) => (
            <div key={s.label} className="text-center animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="text-4xl md:text-5xl font-light" style={{ color: "var(--text)", fontFamily: "var(--font-mono)" }}>
                {s.value}
              </div>
              <div className="text-[8px] tracking-[0.3em] mt-3 font-normal lowercase" style={{ color: "var(--text-dim)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="mb-16 animate-fade-in" style={{ animationDelay: "400ms" }}>
          <div className="text-[9px] tracking-[0.25em] uppercase mb-4 font-normal" style={{ color: "var(--text-dim)" }}>Tier Distribution</div>
          <div className="flex h-3 rounded-full overflow-hidden mb-4" style={{ backgroundColor: "var(--bg-elevated)" }}>
            {Object.entries(stats.tiers).filter(([, v]) => v > 0).map(([tier, count]) => (
              <div
                key={tier}
                className="h-full transition-all duration-700"
                style={{
                  width: `${(count / tierTotal) * 100}%`,
                  backgroundColor: TIER_COLORS[tier] || "#888",
                  opacity: 0.7,
                }}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-5">
            {Object.entries(stats.tiers).filter(([, v]) => v > 0).map(([tier, count]) => (
              <div key={tier} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: TIER_COLORS[tier] || "#888", opacity: 0.7 }} />
                <span className="text-[10px] font-light capitalize" style={{ color: "var(--text-muted)" }}>
                  {tier} <span style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>{count}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="animate-fade-in" style={{ animationDelay: "500ms" }}>
          <div className="text-[9px] tracking-[0.25em] uppercase mb-4 font-normal" style={{ color: "var(--text-dim)" }}>Language Breakdown</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(stats.languages).sort(([, a], [, b]) => b - a).map(([lang, count], i) => (
              <div key={lang} className="rounded-xl p-4 animate-fade-in" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", animationDelay: `${600 + i * 80}ms` }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-normal capitalize" style={{ color: "var(--text)" }}>
                    {LANG_LABELS[lang] || lang}
                  </span>
                  <span className="text-[11px] font-light" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{count}</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-elevated)" }}>
                  <div className="h-full rounded-full animate-bar" style={{ width: `${(count / langTotal) * 100}%`, backgroundColor: "var(--accent)", opacity: 0.5 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
