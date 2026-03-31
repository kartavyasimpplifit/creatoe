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
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [creatorId, productUrl]);

  const d = data as Record<string, unknown> | null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[560px] bg-[#08080d] border-l border-zinc-800 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#08080d]/95 backdrop-blur-sm border-b border-zinc-800 px-5 py-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-white">Creator Deep Dive</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAddToCampaign(creatorId)}
              className={`text-[10px] px-3 py-1.5 rounded-lg font-medium transition-all ${
                isInCampaign ? "bg-indigo-500 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              {isInCampaign ? "✓ In Campaign" : "+ Add to Campaign"}
            </button>
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center hover:bg-zinc-700">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 bg-zinc-900 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : d ? (
          <div className="p-5 space-y-5">
            {/* Profile */}
            <div className="flex items-start gap-4">
              <img
                src={(d.thumbnail_url as string) || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.name as string)}&background=6366f1&color=fff&size=56`}
                className="w-14 h-14 rounded-full object-cover bg-zinc-800"
                alt=""
              />
              <div>
                <h2 className="text-lg font-bold text-white">{d.name as string}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-zinc-400">{formatNumber(d.subscriber_count as number)} subs</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-medium">{d.tier as string}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">{(d.primary_language as string) || "en"}</span>
                </div>
                {d.custom_url && (
                  <a href={`https://youtube.com/${d.custom_url}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-indigo-400 hover:underline mt-1 inline-block">
                    youtube.com/{d.custom_url as string}
                  </a>
                )}
              </div>
            </div>

            {/* Score breakdown (if product-matched) */}
            {d.score_data && (d.score_data as Record<string, unknown>).dimensions && (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Product Match Score</div>
                <div className="text-2xl font-bold text-white mb-3 font-mono">
                  {((d.score_data as Record<string, unknown>).match_score as number).toFixed(1)}
                  <span className="text-sm text-zinc-500 font-normal ml-1">/ 100</span>
                </div>
                {Object.entries(((d.score_data as Record<string, unknown>).dimensions as Record<string, { score: number; reasons: string[]; weight: string }>)).map(([key, dim]) => {
                  const label = key === "brand_price_fit" ? "Brand + Price Fit" : key === "feature_relevance" ? "Feature Relevance" : "Creator Quality";
                  return (
                    <div key={key} className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-zinc-400">{label} ({dim.weight})</span>
                        <span className="text-xs font-mono text-white">{dim.score.toFixed(0)}</span>
                      </div>
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-1.5">
                        <div
                          className={`h-full rounded-full ${dim.score >= 60 ? "bg-emerald-500" : dim.score >= 35 ? "bg-amber-500" : "bg-zinc-600"}`}
                          style={{ width: `${dim.score}%` }}
                        />
                      </div>
                      {dim.reasons.map((r, i) => (
                        <div key={i} className="text-[10px] text-zinc-500 ml-2">+ {r}</div>
                      ))}
                    </div>
                  );
                })}

                {/* Brand evidence */}
                {((d.score_data as Record<string, unknown>).brand_evidence as Array<Record<string, unknown>>)?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-zinc-800">
                    <div className="text-[10px] text-indigo-300 uppercase tracking-wider mb-2 font-semibold">Brand Evidence</div>
                    {((d.score_data as Record<string, unknown>).brand_evidence as Array<Record<string, unknown>>).map((ev, i) => (
                      <a
                        key={i}
                        href={`https://youtube.com/watch?v=${ev.video_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-800 transition-colors mb-1"
                      >
                        <img src={ev.thumbnail as string} className="w-16 h-9 rounded object-cover bg-zinc-800" alt="" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] text-white truncate">{ev.title as string}</div>
                          <div className="text-[10px] text-zinc-500">{formatNumber(ev.views as number)} views · {(ev.engagement as number).toFixed(1)}% eng</div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Content fingerprint */}
            {d.content_fingerprint && (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Content Fingerprint</div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-zinc-800/50 rounded-lg p-2.5">
                    <div className="text-[9px] text-zinc-600 uppercase">Strongest Format</div>
                    <div className="text-sm font-medium text-white capitalize mt-0.5">
                      {((d.content_fingerprint as Record<string, unknown>).strongest_format as string).replace("_", " ")}
                    </div>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-2.5">
                    <div className="text-[9px] text-zinc-600 uppercase">Phone Videos</div>
                    <div className="text-sm font-medium text-white mt-0.5">
                      {(d.content_fingerprint as Record<string, unknown>).phone_video_count as number} / {(d.content_fingerprint as Record<string, unknown>).total_video_count as number}
                    </div>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-2.5">
                    <div className="text-[9px] text-zinc-600 uppercase">Shorts</div>
                    <div className="text-sm font-medium text-white mt-0.5">{(d.content_fingerprint as Record<string, unknown>).shorts_count as number}</div>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-2.5">
                    <div className="text-[9px] text-zinc-600 uppercase">Long-form</div>
                    <div className="text-sm font-medium text-white mt-0.5">{(d.content_fingerprint as Record<string, unknown>).longform_count as number}</div>
                  </div>
                </div>
                {/* Brands reviewed */}
                {(d.content_fingerprint as Record<string, unknown>).brands_reviewed && (
                  <div>
                    <div className="text-[9px] text-zinc-600 uppercase mb-1.5">Brands Reviewed</div>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries((d.content_fingerprint as Record<string, unknown>).brands_reviewed as Record<string, number>).slice(0, 8).map(([brand, count]) => (
                        <span key={brand} className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                          {brand} <span className="text-zinc-600">({count})</span>
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
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">
                  Phone Videos ({(d.phone_videos as Array<Record<string, unknown>>).length})
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(d.phone_videos as Array<Record<string, unknown>>).slice(0, 12).map((v) => (
                    <a
                      key={v.video_id as string}
                      href={`https://youtube.com/watch?v=${v.video_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition-colors"
                    >
                      <div className="relative aspect-video bg-zinc-800">
                        <img src={v.thumbnail_url as string} className="w-full h-full object-cover" alt="" />
                        {(v.analysis as Record<string, unknown>)?.format && (
                          <span className="absolute top-1 left-1 text-[8px] font-semibold px-1.5 py-0.5 rounded bg-black/70 text-white uppercase">
                            {((v.analysis as Record<string, unknown>).format as string).replace("_", " ")}
                          </span>
                        )}
                      </div>
                      <div className="p-2">
                        <div className="text-[10px] text-white line-clamp-2 group-hover:text-indigo-300 transition-colors">{v.title as string}</div>
                        <div className="text-[9px] text-zinc-600 mt-1">
                          {formatNumber(v.view_count as number)} views · {(v.engagement_rate as number).toFixed(1)}%
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Insight nudge */}
            <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <span>⚡</span>
                <div className="text-[11px] text-zinc-400">
                  <span className="text-indigo-300 font-medium">Connect Instagram</span> to see this creator&apos;s cross-platform reach, Reel performance, and combined campaign pricing.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 text-center text-zinc-500 text-sm">Creator not found</div>
        )}
      </div>
    </div>
  );
}
