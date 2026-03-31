"use client";

import { formatNumber } from "@/lib/api";
import type { StatsResponse } from "@/lib/api";

export function TopBar({ state, stats, onReset }: {
  state: string;
  stats: StatsResponse | null;
  onReset: () => void;
}) {
  return (
    <header className="sticky top-0 z-50 glass border-b border-[var(--border)]/50">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 h-12 flex items-center justify-between">
        <button onClick={onReset} className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--accent)] to-purple-500 flex items-center justify-center shadow-[0_0_12px_rgba(129,140,248,0.2)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          </div>
          <span className="text-sm font-bold tracking-tight">
            <span className="text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">Creator</span>
            <span className="text-[var(--accent)]">Lens</span>
          </span>
        </button>

        <nav className="hidden sm:flex items-center gap-1">
          <button onClick={onReset} className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-card)] transition-all">
            Search
          </button>
          <a href="/integrations" className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-card)] transition-all">
            Integrations
          </a>
        </nav>

        <div className="flex items-center gap-4">
          {stats && (
            <div className="hidden md:flex items-center gap-1.5 text-[10px] text-[var(--text-dim)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse-glow" />
              <span>{formatNumber(stats.phone_creators)} creators</span>
              <span className="text-[var(--border)]">/</span>
              <span>{formatNumber(stats.analyzed_videos)} videos</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
