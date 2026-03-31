"use client";

import { X } from "lucide-react";
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
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 z-10 glass border-b border-[var(--border)] px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <div className="text-base font-bold text-[var(--text)]">Campaign Plan</div>
            <div className="text-xs text-[var(--text-muted)]">
              {s.creator_count} creators · {data.product?.brand} {data.product?.model}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--bg-elevated)] transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="p-6">
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Creators", value: s.creator_count.toString(), color: "text-[var(--text)]" },
              { label: "Budget Range", value: `${formatINR(s.budget_min)} - ${formatINR(s.budget_max)}`, color: "text-emerald-400" },
              { label: "Est. Reach", value: formatNumber(s.estimated_reach), color: "text-[var(--accent)]" },
              { label: "Avg CPV", value: `₹${s.avg_cpv.toFixed(2)}`, color: "text-[var(--gold)]" },
            ].map(m => (
              <div key={m.label} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-3.5 text-center">
                <div className={`text-lg font-bold ${m.color}`} style={{ fontFamily: "var(--font-mono)" }}>{m.value}</div>
                <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-[0.15em] mt-0.5 font-medium">{m.label}</div>
              </div>
            ))}
          </div>

          {/* Language mix */}
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 mb-6">
            <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em] mb-3">Language Coverage</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(s.language_mix).map(([lang, count]) => (
                <div key={lang} className="flex items-center gap-1.5 bg-[var(--bg-elevated)] rounded-lg px-3 py-1.5 border border-[var(--border)]">
                  <span className="text-xs font-medium text-[var(--text)] capitalize">{lang}</span>
                  <span className="text-xs text-[var(--accent)]" style={{ fontFamily: "var(--font-mono)" }}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Creator table */}
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] text-[var(--text-muted)] uppercase tracking-[0.15em] font-bold border-b border-[var(--border)]">
                    <th className="px-4 py-2.5">Creator</th>
                    <th className="px-3 py-2.5 text-right">Score</th>
                    <th className="px-3 py-2.5 text-right">Cost</th>
                    <th className="px-3 py-2.5 text-right">Views</th>
                    <th className="px-3 py-2.5 text-right">CPV</th>
                    <th className="px-3 py-2.5 text-right">Lang</th>
                  </tr>
                </thead>
                <tbody>
                  {data.creators.map(c => (
                    <tr key={c.id} className="border-b border-[var(--border)]/30 hover:bg-[var(--bg-card-hover)] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img src={c.thumbnail_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=222&color=fff&size=28`} className="w-7 h-7 rounded-full object-cover bg-[var(--bg-elevated)] flex-shrink-0" alt="" />
                          <div className="min-w-0">
                            <div className="text-xs text-[var(--text)] truncate font-medium">{c.name}</div>
                            <div className="text-[10px] text-[var(--text-muted)]">{formatNumber(c.subscriber_count)} · {c.tier}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right text-xs font-semibold text-[var(--text)]" style={{ fontFamily: "var(--font-mono)" }}>{c.match_score.toFixed(0)}</td>
                      <td className="px-3 py-3 text-right text-xs text-[var(--text-secondary)]" style={{ fontFamily: "var(--font-mono)" }}>{formatINR(c.cost_min)}</td>
                      <td className="px-3 py-3 text-right text-xs text-[var(--text-secondary)]" style={{ fontFamily: "var(--font-mono)" }}>{formatNumber(c.predicted_views)}</td>
                      <td className="px-3 py-3 text-right text-xs text-[var(--text-secondary)]" style={{ fontFamily: "var(--font-mono)" }}>₹{c.cpv.toFixed(1)}</td>
                      <td className="px-3 py-3 text-right text-[11px] text-[var(--text-muted)] capitalize">{c.primary_language}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upsell */}
          <div className="mt-6 bg-[var(--accent-dim)] border border-[var(--accent)]/15 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
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
