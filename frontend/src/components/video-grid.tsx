"use client";

import { formatNumber } from "@/lib/api";

function VideoCard({ video, locked = false }: { video: Record<string, unknown>; locked?: boolean }) {
  const analysis = (video.analysis as Record<string, unknown>) || {};
  const format = (analysis.format as string) || "";

  return (
    <div className={`relative group ${locked ? "" : "cursor-pointer"}`}>
      {locked ? (
        <div className="relative overflow-hidden rounded-2xl">
          <div className="aspect-video bg-[var(--bg-elevated)] rounded-2xl overflow-hidden blur-[8px]">
            <img src={video.thumbnail_url as string} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg)]/50 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-dim)]">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
          </div>
        </div>
      ) : (
        <a href={`https://youtube.com/watch?v=${video.video_id}`} target="_blank" rel="noopener noreferrer">
          <div className="relative aspect-video bg-[var(--bg-elevated)] rounded-2xl overflow-hidden group-hover:ring-2 ring-[var(--accent)]/30 transition-all">
            <img src={video.thumbnail_url as string} alt={video.title as string} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            {/* Play overlay on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#0c0a09"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
            {/* View count */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
              <span className="text-[11px] font-semibold text-white font-[family-name:var(--font-mono)]">
                {formatNumber(video.view_count as number)}
              </span>
            </div>
            {/* Format badge */}
            {format && (
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-0.5">
                <span className="text-[9px] font-semibold text-white uppercase tracking-wider">{format.replace("_", " ")}</span>
              </div>
            )}
            {/* Platform */}
            <div className="absolute bottom-2 right-2">
              <div className="w-5 h-5 rounded bg-red-600 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z"/></svg>
              </div>
            </div>
          </div>
        </a>
      )}

      {/* Creator info below */}
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
              <div className="text-[13px] font-medium text-[var(--text)] line-clamp-2 leading-snug group-hover:text-[var(--accent)] transition-colors">
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
      <div className="text-sm text-[var(--text-muted)] mb-5">
        <span className="font-semibold text-[var(--text)] font-[family-name:var(--font-mono)]">{totalResults.toLocaleString()}</span> relevant videos found
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
        <div className="mt-10 text-center">
          <div className="inline-flex flex-col items-center gap-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl px-8 py-6">
            <div className="w-10 h-10 rounded-full bg-[var(--accent-dim)] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--accent)]">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div className="text-sm text-[var(--text)]">{upgradeMessage}</div>
            <button className="px-5 py-2 bg-[var(--accent)] text-white text-xs font-semibold rounded-xl hover:bg-[var(--accent-hover)] transition-colors">
              Unlock Full Access
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
