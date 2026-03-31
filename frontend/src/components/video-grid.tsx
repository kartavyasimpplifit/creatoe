"use client";

import { Lock, Play } from "lucide-react";
import { formatNumber } from "@/lib/api";

function VideoCard({ video, locked = false }: { video: Record<string, unknown>; locked?: boolean }) {
  const analysis = (video.analysis as Record<string, unknown>) || {};
  const format = (analysis.format as string) || "";

  return (
    <div className={`relative group ${locked ? "" : "cursor-pointer"}`}>
      {locked ? (
        <div className="relative overflow-hidden rounded-xl">
          <div className="aspect-[9/16] sm:aspect-video bg-[var(--bg-elevated)] rounded-xl overflow-hidden blur-[8px]">
            <img
              src={video.thumbnail_url as string}
              alt=""
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center">
              <Lock size={16} className="text-[var(--text-muted)]" />
            </div>
          </div>
        </div>
      ) : (
        <a href={`https://youtube.com/watch?v=${video.video_id}`} target="_blank" rel="noopener noreferrer">
          <div className="relative aspect-[9/16] sm:aspect-video bg-[var(--bg-elevated)] rounded-xl overflow-hidden group-hover:ring-2 ring-[var(--accent)]/20 transition-all duration-200">
            <img
              src={video.thumbnail_url as string}
              alt={video.title as string}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/20">
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                <Play size={18} fill="#000" stroke="none" />
              </div>
            </div>
            <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
              <Play size={10} fill="white" stroke="none" />
              <span className="text-[11px] font-semibold text-white" style={{ fontFamily: "var(--font-mono)" }}>
                {formatNumber(video.view_count as number)}
              </span>
            </div>
            {format && (
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-0.5">
                <span className="text-[9px] font-semibold text-white uppercase tracking-wider">{format.replace("_", " ")}</span>
              </div>
            )}
          </div>
        </a>
      )}

      <div className="mt-3 flex items-start gap-2.5">
        {video.creator_thumbnail && !locked ? (
          <img src={video.creator_thumbnail as string} className="w-8 h-8 rounded-full object-cover bg-[var(--bg-elevated)] mt-0.5 flex-shrink-0" alt="" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] mt-0.5 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          {locked ? (
            <>
              <div className="h-3 bg-[var(--bg-elevated)] rounded w-3/4 mb-1.5" />
              <div className="h-2.5 bg-[var(--bg-elevated)] rounded w-1/2" />
            </>
          ) : (
            <>
              <div className="text-[13px] font-medium text-[var(--text)] line-clamp-2 leading-snug group-hover:text-[var(--accent)] transition-colors duration-200">
                {video.title as string}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">
                {video.creator_name as string}
              </div>
              <div className="text-[10px] text-[var(--text-dim)] mt-0.5">
                {video.published_at ? (video.published_at as string).split("T")[0] : ""}
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
      <div className="text-sm text-[var(--text-muted)] mb-6">
        <span className="font-semibold text-[var(--text)]" style={{ fontFamily: "var(--font-mono)" }}>
          {totalResults.toLocaleString()}
        </span>{" "}
        relevant videos found
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
          <div className="inline-flex flex-col items-center gap-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl px-8 py-6">
            <div className="w-10 h-10 rounded-full bg-[var(--accent-dim)] flex items-center justify-center">
              <Lock size={18} className="text-[var(--accent)]" />
            </div>
            <div className="text-sm text-[var(--text)]">{upgradeMessage}</div>
            <button className="px-5 py-2 bg-[var(--accent)] text-white text-xs font-semibold rounded-xl hover:bg-[var(--accent-hover)] transition-colors duration-200">
              Unlock Full Access
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
