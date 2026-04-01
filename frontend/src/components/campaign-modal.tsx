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
      <div className="absolute inset-0 backdrop-blur-md" style={{ backgroundColor: "rgba(0,0,0,0.7)" }} onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl animate-scale-in" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}>
        <div className="sticky top-0 z-10 glass px-6 py-4 flex items-center justify-between rounded-t-2xl" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <div className="text-[14px] font-normal" style={{ color: "var(--text)" }}>Campaign Plan</div>
            <div className="text-[11px] font-light" style={{ color: "var(--text-dim)" }}>
              {s.creator_count} creators · {data.product?.brand} {data.product?.model}
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors" style={{ border: "1px solid var(--border)" }}>
            <X size={12} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: "creators", value: s.creator_count.toString(), color: "var(--text)" },
              { label: "budget", value: `${formatINR(s.budget_min)} - ${formatINR(s.budget_max)}`, color: "var(--success)" },
              { label: "reach", value: formatNumber(s.estimated_reach), color: "var(--accent)" },
              { label: "avg cpv", value: `₹${s.avg_cpv.toFixed(2)}`, color: "var(--gold)" },
            ].map(m => (
              <div key={m.label} className="rounded-xl p-3 text-center" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div className="text-lg font-light" style={{ color: m.color, fontFamily: "var(--font-mono)" }}>{m.value}</div>
                <div className="text-[7px] tracking-[0.2em] mt-1 lowercase" style={{ color: "var(--text-dim)" }}>{m.label}</div>
              </div>
            ))}
          </div>

          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th className="px-4 py-2.5 text-[8px] tracking-[0.2em] uppercase font-normal" style={{ color: "var(--text-dim)" }}>Creator</th>
                    <th className="px-3 py-2.5 text-right text-[8px] tracking-[0.2em] uppercase font-normal" style={{ color: "var(--text-dim)" }}>Score</th>
                    <th className="px-3 py-2.5 text-right text-[8px] tracking-[0.2em] uppercase font-normal" style={{ color: "var(--text-dim)" }}>Cost</th>
                    <th className="px-3 py-2.5 text-right text-[8px] tracking-[0.2em] uppercase font-normal" style={{ color: "var(--text-dim)" }}>Views</th>
                    <th className="px-3 py-2.5 text-right text-[8px] tracking-[0.2em] uppercase font-normal" style={{ color: "var(--text-dim)" }}>CPV</th>
                  </tr>
                </thead>
                <tbody>
                  {data.creators.map(c => (
                    <tr key={c.id} className="transition-colors" style={{ borderBottom: "1px solid rgba(26,26,26,0.5)" }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = "var(--bg-card-hover)"; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img src={c.thumbnail_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=111&color=e8e8e8&size=28`} className="w-6 h-6 rounded-full object-cover flex-shrink-0" style={{ backgroundColor: "var(--bg-elevated)" }} alt="" />
                          <div className="min-w-0">
                            <div className="text-[11px] font-normal truncate" style={{ color: "var(--text)" }}>{c.name}</div>
                            <div className="text-[9px] font-light" style={{ color: "var(--text-dim)" }}>{formatNumber(c.subscriber_count)} · {c.tier}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right text-[11px] font-normal" style={{ color: "var(--text)", fontFamily: "var(--font-mono)" }}>{c.match_score.toFixed(0)}</td>
                      <td className="px-3 py-3 text-right text-[11px] font-light" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{formatINR(c.cost_min)}</td>
                      <td className="px-3 py-3 text-right text-[11px] font-light" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{formatNumber(c.predicted_views)}</td>
                      <td className="px-3 py-3 text-right text-[11px] font-light" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>₹{c.cpv.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
