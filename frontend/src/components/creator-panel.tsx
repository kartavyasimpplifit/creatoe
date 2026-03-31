"use client";

import { useState, useEffect } from "react";
import { X, Plus, Check, ExternalLink } from "lucide-react";
import { fetchCreatorDetail, formatNumber, formatINR } from "@/lib/api";

export function CreatorPanel({ creatorId, productUrl, onClose, onAddToCampaign, isInCampaign }: {
  creatorId: number;
  productUrl: string;
  onClose: () => void;
  onAddToCampaign: (id: number) => void;
  isInCampaign: boolean;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchCreatorDetail(creatorId, productUrl)
      .then(setData).catch(console.error).finally(() => setLoading(false));
  }, [creatorId, productUrl]);

  const d = data;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[560px] bg-[var(--bg-surface)] border-l border-[var(--border)] overflow-y-auto animate-slide-in">
        {/* Header */}
        <div className="sticky top-0 z-10 glass border-b border-[var(--border)] px-5 py-3 flex items-center justify-between">
          <div className="text-sm font-bold text-[var(--text)]">Creator Deep Dive</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAddToCampaign(creatorId)}
              className={`text-[11px] px-3 py-1.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                isInCampaign
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]"
              }`}
            >
              {isInCampaign ? <><Check size={12} /> In Campaign</> : <><Plus size={12} /> Campaign</>}
            </button>
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--bg-elevated)] transition-colors">
              <X size={12} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-16 skeleton" />)}
          </div>
        ) : d ? (
          <div className="p-5 space-y-5">
            {/* Profile */}
            <div className="flex items-start gap-4">
              <img
                src={(d.thumbnail_url as string) || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.name as string)}&background=222&color=fff&size=56`}
                className="w-14 h-14 rounded-full object-cover bg-[var(--bg-elevated)]"
                alt=""
              />
              <div className="flex-1">
                <h2 className="text-lg font-bold text-[var(--text)]">{d.name as string}</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-sm text-[var(--text-secondary)]">{formatNumber(d.subscriber_count as number)} subs</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-dim)] text-[var(--accent)] font-semibold capitalize">{d.tier as string}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-card)] text-[var(--text-muted)] capitalize">{(d.primary_language as string) || "en"}</span>
                </div>
                {d.custom_url && (
                  <a href={`https://youtube.com/${d.custom_url}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-[var(--accent)] hover:underline mt-1.5 inline-flex items-center gap-1">
                    <ExternalLink size={10} />
                    youtube.com/{d.custom_url as string}
                  </a>
                )}
              </div>
            </div>

            {/* Score breakdown */}
            {d.score_data?.dimensions && (() => {
              const sd = d.score_data;
              const dims = sd.dimensions as Record<string, { score: number; reasons: string[]; weight: string }>;
              const evidence = (sd.brand_evidence || []) as Array<{ video_id: string; title: string; views: number; engagement: number; thumbnail: string }>;
              return (
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5">
                  <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em] mb-3">Product Match Score</div>
                  <div className="text-4xl font-extrabold text-[var(--text)] mb-5" style={{ fontFamily: "var(--font-mono)" }}>
                    {Number(sd.match_score).toFixed(1)}
                    <span className="text-sm text-[var(--text-muted)] font-normal ml-1">/ 100</span>
                  </div>
                  {Object.entries(dims).map(([key, dim]) => {
                    const label = key === "brand_price_fit" ? "Brand + Price Fit" : key === "feature_relevance" ? "Feature Relevance" : "Creator Quality";
                    const color = dim.score >= 60 ? "from-emerald-500 to-emerald-400" : dim.score >= 35 ? "from-amber-500 to-amber-400" : "from-stone-600 to-stone-500";
                    return (
                      <div key={key} className="mb-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-[var(--text-secondary)] font-medium">{label} ({dim.weight})</span>
                          <span className="text-xs text-[var(--text)] font-bold" style={{ fontFamily: "var(--font-mono)" }}>{dim.score.toFixed(0)}</span>
                        </div>
                        <div className="h-1.5 bg-[var(--bg)] rounded-full overflow-hidden mb-2">
                          <div className={`h-full rounded-full bg-gradient-to-r ${color} animate-bar`} style={{ width: `${dim.score}%` }} />
                        </div>
                        {dim.reasons.map((r: string, i: number) => (
                          <div key={i} className="text-[10px] text-[var(--text-muted)] ml-1 mb-0.5">+ {r}</div>
                        ))}
                      </div>
                    );
                  })}

                  {evidence.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[var(--border)]">
                      <div className="text-[10px] text-[var(--accent)] uppercase tracking-[0.15em] mb-2.5 font-bold">Brand Evidence</div>
                      {evidence.map((ev, i) => (
                        <a key={i} href={`https://youtube.com/watch?v=${ev.video_id}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[var(--bg-elevated)] transition-colors mb-1">
                          <img src={ev.thumbnail} className="w-20 h-11 rounded-lg object-cover bg-[var(--bg-elevated)]" alt="" />
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] text-[var(--text)] truncate font-medium">{ev.title}</div>
                            <div className="text-[10px] text-[var(--text-muted)]">{formatNumber(ev.views)} views · {ev.engagement.toFixed(1)}%</div>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Content fingerprint */}
            {d.content_fingerprint && (() => {
              const cf = d.content_fingerprint;
              const brands = (cf.brands_reviewed || {}) as Record<string, number>;
              return (
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5">
                  <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em] mb-3">Content Fingerprint</div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { label: "Strongest Format", value: String(cf.strongest_format || "").replace("_", " ") },
                      { label: "Phone Videos", value: `${cf.phone_video_count} / ${cf.total_video_count}` },
                      { label: "Shorts", value: String(cf.shorts_count) },
                      { label: "Long-form", value: String(cf.longform_count) },
                    ].map(item => (
                      <div key={item.label} className="bg-[var(--bg)] rounded-xl p-3 border border-[var(--border)]">
                        <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider font-medium">{item.label}</div>
                        <div className="text-sm font-semibold text-[var(--text)] capitalize mt-0.5">{item.value}</div>
                      </div>
                    ))}
                  </div>
                  {Object.keys(brands).length > 0 && (
                    <div>
                      <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider font-medium mb-2">Brands Reviewed</div>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(brands).slice(0, 8).map(([brand, count]) => (
                          <span key={brand} className="text-[10px] px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border)]">
                            {brand} <span className="text-[var(--text-dim)]">({count})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Phone Videos */}
            {d.phone_videos?.length > 0 && (() => {
              const videos = d.phone_videos as Array<{ video_id: string; title: string; thumbnail_url: string; view_count: number; engagement_rate: number }>;
              return (
                <div>
                  <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em] mb-3">
                    Phone Videos ({videos.length})
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {videos.slice(0, 12).map((v) => (
                      <a key={v.video_id} href={`https://youtube.com/watch?v=${v.video_id}`} target="_blank" rel="noopener noreferrer"
                        className="group block bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden card-hover">
                        <div className="relative aspect-video bg-[var(--bg-elevated)]">
                          <img src={v.thumbnail_url} className="w-full h-full object-cover" alt="" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                            <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="#000"><path d="M8 5v14l11-7z"/></svg>
                            </div>
                          </div>
                        </div>
                        <div className="p-2.5">
                          <div className="text-[10px] text-[var(--text)] line-clamp-2 font-medium leading-snug group-hover:text-[var(--accent)] transition-colors">{v.title}</div>
                          <div className="text-[9px] text-[var(--text-muted)] mt-1">
                            {formatNumber(v.view_count)} views · {v.engagement_rate.toFixed(1)}%
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Upsell nudge */}
            <div className="bg-[var(--accent-dim)] border border-[var(--accent)]/15 rounded-xl p-4">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </div>
                <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  <span className="text-[var(--accent)] font-semibold">Connect Instagram</span> to see cross-platform reach, Reel performance, and combined campaign pricing.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 text-center text-[var(--text-muted)] text-sm">Creator not found</div>
        )}
      </div>
    </div>
  );
}
