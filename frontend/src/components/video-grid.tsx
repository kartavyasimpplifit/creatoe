"use client";

import { Lock, Play } from "lucide-react";
import { formatNumber } from "@/lib/api";

function VideoCard({ video, locked = false }: { video: Record<string, unknown>; locked?: boolean }) {
  const analysis = (video.analysis as Record<string, unknown>) || {};
  const format = (analysis.format as string) || "";

  return (
    <div className={`relative group ${locked ? "" : "cursor-pointer"}`}>
      {locked ? (
        <div className="relative overflow-hidden rounded-2xl">
          <div className="aspect-video rounded-2xl overflow-hidden blur-[10px]" style={{ backgroundColor: "var(--bg-elevated)" }}>
            <img src={video.thumbnail_url as string} alt="" className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <Lock size={18} style={{ color: "var(--text-muted)" }} />
            <span className="text-[10px] font-light" style={{ color: "var(--text-muted)" }}>Upgrade to unlock</span>
          </div>
        </div>
      ) : (
        <a href={`https://youtube.com/watch?v=${video.video_id}`} target="_blank" rel="noopener noreferrer">
          <div className="relative aspect-video rounded-2xl overflow-hidden transition-all duration-300 group-hover:ring-1 ring-[rgba(255,255,255,0.06)]" style={{ backgroundColor: "var(--bg-elevated)" }}>
            <img src={video.thumbnail_url as string} alt={video.title as string}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ backgroundColor: "rgba(0,0,0,0.2)" }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.9)" }}>
                <Play size={20} fill="#000" stroke="none" />
              </div>
            </div>
            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md px-1.5 py-0.5" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
              <span className="text-[10px] font-medium text-white" style={{ fontFamily: "var(--font-mono)" }}>
                {formatNumber(video.view_count as number)}
              </span>
            </div>
            {format && (
              <div className="absolute top-2 left-2 rounded-md px-1.5 py-0.5" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
                <span className="text-[8px] font-medium text-white uppercase tracking-wider">{format.replace("_", " ")}</span>
              </div>
            )}
          </div>
        </a>
      )}

      <div className="mt-2.5 flex items-start gap-2">
        {video.creator_thumbnail && !locked ? (
          <img src={video.creator_thumbnail as string} className="w-7 h-7 rounded-full object-cover mt-0.5 flex-shrink-0" style={{ backgroundColor: "var(--bg-elevated)" }} alt="" />
        ) : (
          <div className="w-7 h-7 rounded-full mt-0.5 flex-shrink-0" style={{ backgroundColor: "var(--bg-elevated)" }} />
        )}
        <div className="flex-1 min-w-0">
          {locked ? (
            <>
              <div className="h-3 rounded w-3/4 mb-1" style={{ backgroundColor: "var(--bg-elevated)" }} />
              <div className="h-2.5 rounded w-1/2" style={{ backgroundColor: "var(--bg-elevated)" }} />
            </>
          ) : (
            <>
              <div className="text-[12px] font-normal line-clamp-2 leading-snug transition-colors duration-300" style={{ color: "var(--text)" }}>
                {video.title as string}
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: "var(--text-dim)" }}>
                {video.creator_name as string}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function VideoGrid({ freeVideos, lockedVideos, totalResults, upgradeMessage }: {
  freeVideos: Record<string, unknown>[];
  lockedVideos: Record<string, unknown>[];
  totalResults: number;
  upgradeMessage: string;
}) {
  return (
    <div>
      <div className="text-[13px] font-light mb-6" style={{ color: "var(--text-muted)" }}>
        <span style={{ color: "var(--text)", fontFamily: "var(--font-mono)" }}>{totalResults.toLocaleString()}</span> videos found
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {freeVideos.map((v, i) => (
          <div key={(v.video_id as string) || i} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
            <VideoCard video={v} />
          </div>
        ))}
        {lockedVideos.map((v, i) => (
          <div key={`locked-${i}`} className="animate-fade-in" style={{ animationDelay: `${(freeVideos.length + i) * 80}ms` }}>
            <VideoCard video={v} locked />
          </div>
        ))}
      </div>

      {upgradeMessage && (
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col items-center gap-3 rounded-2xl px-8 py-6" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <Lock size={16} style={{ color: "var(--text-muted)" }} />
            <div className="text-[12px] font-light" style={{ color: "var(--text-secondary)" }}>{upgradeMessage}</div>
            <button className="px-4 py-1.5 text-[11px] font-medium rounded-lg transition-colors duration-300" style={{ color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
              Unlock Full Access
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
