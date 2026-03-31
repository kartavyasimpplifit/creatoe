"use client";

import { useState, useEffect } from "react";
import { fetchCreatorDetail, formatNumber, formatINR } from "@/lib/api";

export function CreatorPanel({ creatorId, productUrl, onClose, onAddToCampaign, isInCampaign }: {
  creatorId: number;
  productUrl: string;
  onClose: () => void;
  onAddToCampaign: (id: number) => void;
  isInCampaign: boolean;
}) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
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
      <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[580px] bg-[var(--bg)] border-l border-[var(--border)] overflow-y-auto animate-slide-in">
        <div className="sticky top-0 z-10 glass border-b border-[var(--border)]/50 px-5 py-3 flex items-center justify-between">
          <div className="text-sm font-bold text-[var(--text)]">Creator Deep Dive</div>
          <div className="flex items-center gap-2">
            <button onClick={() => onAddToCampaign(creatorId)}
              className={`text-[10px] px-3 py-1.5 rounded-lg font-semibold transition-all ${
                isInCampaign ? "bg-[var(--accent)] text-white" : "bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]"
              }`}>
              {isInCampaign ? "✓ In Campaign" : "+ Campaign"}
            </button>
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--bg-elevated)]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
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
              <img src={(d.thumbnail_url as string) || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.name as string)}&background=44403c&color=e7e5e4&size=56`}
                className="w-14 h-14 rounded-full object-cover bg-[var(--bg-elevated)] ring-2 ring-[var(--border)]" alt="" />
              <div>
                <h2 className="text-lg font-bold text-[var(--text)]">{d.name as string}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-[var(--text-muted)]">{formatNumber(d.subscriber_count as number)} subs</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-dim)] text-[var(--accent)] font-semibold">{d.tier as string}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-dim)] capitalize">{(d.primary_language as string) || "en"}</span>
                </div>
                {d.custom_url && (
                  <a href={`https://youtube.com/${d.custom_url}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-[var(--accent)] hover:underline mt-1 inline-block">youtube.com/{d.custom_url as string}</a>
                )}
              </div>
            </div>

            {/* Score breakdown */}
            {d.score_data && (d.score_data as Record<string, unknown>).dimensions && (
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5">
                <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-[0.12em] mb-3">Product Match Score</div>
                <div className="text-3xl font-extrabold text-[var(--text)] mb-4 font-[family-name:var(--font-mono)]">
                  {((d.score_data as Record<string, unknown>).match_score as number).toFixed(1)}
                  <span className="text-sm text-[var(--text-dim)] font-normal ml-1">/ 100</span>
                </div>
                {Object.entries(((d.score_data as Record<string, unknown>).dimensions as Record<string, { score: number; reasons: string[]; weight: string }>)).map(([key, dim]) => {
                  const label = key === "brand_price_fit" ? "Brand + Price Fit" : key === "feature_relevance" ? "Feature Relevance" : "Creator Quality";
                  const color = dim.score >= 60 ? "from-emerald-500 to-emerald-400" : dim.score >= 35 ? "from-amber-500 to-amber-400" : "from-stone-600 to-stone-500";
                  return (
                    <div key={key} className="mb-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-[var(--text-muted)] font-medium">{label} ({dim.weight})</span>
                        <span className="text-xs font-[family-name:var(--font-mono)] text-[var(--text)] font-bold">{dim.score.toFixed(0)}</span>
                      </div>
                      <div className="h-2 bg-[var(--bg)] rounded-full overflow-hidden mb-2">
                        <div className={`h-full rounded-full bg-gradient-to-r ${color} animate-bar`} style={{ width: `${dim.score}%` }} />
                      </div>
                      {dim.reasons.map((r, i) => (
                        <div key={i} className="text-[10px] text-[var(--text-dim)] ml-1 mb-0.5">+ {r}</div>
                      ))}
                    </div>
                  );
                })}

                {((d.score_data as Record<string, unknown>).brand_evidence as Array<Record<string, unknown>>)?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[var(--border)]">
                    <div className="text-[10px] text-[var(--accent)] uppercase tracking-[0.12em] mb-2.5 font-bold">Brand Evidence</div>
                    {((d.score_data as Record<string, unknown>).brand_evidence as Array<Record<string, unknown>>).map((ev, i) => (
                      <a key={i} href={`https://youtube.com/watch?v=${ev.video_id}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[var(--bg-elevated)] transition-colors mb-1">
                        <img src={ev.thumbnail as string} className="w-20 h-11 rounded-lg object-cover bg-[var(--bg-elevated)]" alt="" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] text-[var(--text)] truncate font-medium">{ev.title as string}</div>
                          <div className="text-[10px] text-[var(--text-dim)]">{formatNumber(ev.views as number)} views · {(ev.engagement as number).toFixed(1)}%</div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Content fingerprint */}
            {d.content_fingerprint && (
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5">
                <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-[0.12em] mb-3">Content Fingerprint</div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: "Strongest Format", value: ((d.content_fingerprint as Record<string, unknown>).strongest_format as string).replace("_", " ") },
                    { label: "Phone Videos", value: `${(d.content_fingerprint as Record<string, unknown>).phone_video_count} / ${(d.content_fingerprint as Record<string, unknown>).total_video_count}` },
                    { label: "Shorts", value: String((d.content_fingerprint as Record<string, unknown>).shorts_count) },
                    { label: "Long-form", value: String((d.content_fingerprint as Record<string, unknown>).longform_count) },
                  ].map(item => (
                    <div key={item.label} className="bg-[var(--bg)] rounded-xl p-3 border border-[var(--border)]">
                      <div className="text-[9px] text-[var(--text-dim)] uppercase tracking-wider font-medium">{item.label}</div>
                      <div className="text-sm font-semibold text-[var(--text)] capitalize mt-0.5">{item.value}</div>
                    </div>
                  ))}
                </div>
                {(d.content_fingerprint as Record<string, unknown>).brands_reviewed && (
                  <div>
                    <div className="text-[9px] text-[var(--text-dim)] uppercase tracking-wider font-medium mb-2">Brands Reviewed</div>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries((d.content_fingerprint as Record<string, unknown>).brands_reviewed as Record<string, number>).slice(0, 8).map(([brand, count]) => (
                        <span key={brand} className="text-[10px] px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border)]">
                          {brand} <span className="text-[var(--text-dim)]">({count})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Phone Videos */}
            {(d.phone_videos as Array<Record<string, unknown>>)?.length > 0 && (
              <div>
                <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-[0.12em] mb-3">
                  Phone Videos ({(d.phone_videos as Array<Record<string, unknown>>).length})
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {(d.phone_videos as Array<Record<string, unknown>>).slice(0, 12).map((v) => (
                    <a key={v.video_id as string} href={`https://youtube.com/watch?v=${v.video_id}`} target="_blank" rel="noopener noreferrer"
                      className="group block bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden card-hover">
                      <div className="relative aspect-video bg-[var(--bg-elevated)]">
                        <img src={v.thumbnail_url as string} className="w-full h-full object-cover" alt="" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                          <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#0c0a09"><path d="M8 5v14l11-7z"/></svg>
                          </div>
                        </div>
                        {(v.analysis as Record<string, unknown>)?.format && (
                          <span className="absolute top-1.5 left-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-black/60 text-white uppercase tracking-wider backdrop-blur-sm">
                            {((v.analysis as Record<string, unknown>).format as string).replace("_", " ")}
                          </span>
                        )}
                      </div>
                      <div className="p-2.5">
                        <div className="text-[10px] text-[var(--text)] line-clamp-2 font-medium leading-snug group-hover:text-[var(--accent)] transition-colors">{v.title as string}</div>
                        <div className="text-[9px] text-[var(--text-dim)] mt-1">
                          {formatNumber(v.view_count as number)} views · {(v.engagement_rate as number).toFixed(1)}%
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Insight nudge */}
            <div className="bg-[var(--accent-dim)] border border-[var(--accent)]/15 rounded-xl p-4">
              <div className="flex items-start gap-2.5">
                <span className="text-base">⚡</span>
                <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  <span className="text-[var(--accent)] font-semibold">Connect Instagram</span> to see cross-platform reach, Reel performance, and combined campaign pricing for this creator.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 text-center text-[var(--text-dim)] text-sm">Creator not found</div>
        )}
      </div>
    </div>
  );
}
