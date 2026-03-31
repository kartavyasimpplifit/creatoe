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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[var(--bg)] border border-[var(--border)] rounded-2xl animate-scale-in">
        <div className="sticky top-0 z-10 glass border-b border-[var(--border)]/50 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <div className="text-base font-bold text-[var(--text)]">Campaign Plan</div>
            <div className="text-xs text-[var(--text-dim)]">
              {s.creator_count} creators · {data.product?.brand} {data.product?.model}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--bg-elevated)] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Creators", value: s.creator_count.toString(), color: "text-[var(--text)]" },
              { label: "Budget Range", value: `${formatINR(s.budget_min)} - ${formatINR(s.budget_max)}`, color: "text-emerald-400" },
              { label: "Est. Reach", value: formatNumber(s.estimated_reach), color: "text-[var(--accent)]" },
              { label: "Avg CPV", value: `₹${s.avg_cpv.toFixed(2)}`, color: "text-[var(--gold)]" },
            ].map(m => (
              <div key={m.label} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-3.5 text-center">
                <div className={`text-lg font-bold font-[family-name:var(--font-mono)] ${m.color}`}>{m.value}</div>
                <div className="text-[9px] text-[var(--text-dim)] uppercase tracking-[0.12em] mt-0.5 font-medium">{m.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 mb-6">
            <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-[0.12em] mb-3">Language Coverage</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(s.language_mix).map(([lang, count]) => (
                <div key={lang} className="flex items-center gap-1.5 bg-[var(--bg-elevated)] rounded-lg px-3 py-1.5 border border-[var(--border)]">
                  <span className="text-xs font-medium text-[var(--text)] capitalize">{lang}</span>
                  <span className="text-xs font-[family-name:var(--font-mono)] text-[var(--accent)]">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="grid grid-cols-[1fr_70px_80px_70px_60px_70px] gap-0 text-[9px] text-[var(--text-dim)] uppercase tracking-[0.12em] font-bold px-4 py-2.5 border-b border-[var(--border)]">
              <div>Creator</div><div className="text-right">Score</div><div className="text-right">Cost</div><div className="text-right">Views</div><div className="text-right">CPV</div><div className="text-right">Lang</div>
            </div>
            {data.creators.map(c => (
              <div key={c.id} className="grid grid-cols-[1fr_70px_80px_70px_60px_70px] gap-0 px-4 py-3 border-b border-[var(--border)]/30 hover:bg-[var(--bg-card-hover)] transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img src={c.thumbnail_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=44403c&color=e7e5e4&size=28`} className="w-7 h-7 rounded-full object-cover bg-[var(--bg-elevated)] flex-shrink-0" alt="" />
                  <div className="min-w-0">
                    <div className="text-xs text-[var(--text)] truncate font-medium">{c.name}</div>
                    <div className="text-[10px] text-[var(--text-dim)]">{formatNumber(c.subscriber_count)} · {c.tier}</div>
                  </div>
                </div>
                <div className="text-right text-xs font-[family-name:var(--font-mono)] text-[var(--text)] self-center font-semibold">{c.match_score.toFixed(0)}</div>
                <div className="text-right text-xs font-[family-name:var(--font-mono)] text-[var(--text-muted)] self-center">{formatINR(c.cost_min)}</div>
                <div className="text-right text-xs font-[family-name:var(--font-mono)] text-[var(--text-muted)] self-center">{formatNumber(c.predicted_views)}</div>
                <div className="text-right text-xs font-[family-name:var(--font-mono)] text-[var(--text-muted)] self-center">₹{c.cpv.toFixed(1)}</div>
                <div className="text-right text-[11px] text-[var(--text-dim)] capitalize self-center">{c.primary_language}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-[var(--accent-dim)] border border-[var(--accent)]/15 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-lg">⚡</span>
              <div>
                <div className="text-xs font-bold text-[var(--accent)] mb-1">Unlock deeper campaign intelligence</div>
                <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Connect Flipkart Affiliate for actual sales per creator. Connect Phyllo for Instagram cross-platform reach. Upgrade to Enterprise for competitive alerts.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
