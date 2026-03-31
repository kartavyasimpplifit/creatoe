"use client";

import { formatNumber } from "@/lib/api";
import type { StatsResponse } from "@/lib/api";

export function TopBar({ state, stats, onReset }: {
  state: string;
  stats: StatsResponse | null;
  onReset: () => void;
}) {
  return (
    <header className="sticky top-0 z-50 bg-[#06060a]/90 backdrop-blur-xl border-b border-zinc-800/50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
        <button onClick={onReset} className="flex items-center gap-2 group">
          <div className="w-6 h-6 rounded-md bg-indigo-500/20 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
          </div>
          <span className="text-sm font-bold tracking-tight">
            <span className="text-white group-hover:text-indigo-300 transition-colors">Creator</span>
            <span className="text-indigo-400">Lens</span>
          </span>
        </button>

        <div className="flex items-center gap-4">
          {stats && (
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-zinc-500">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{formatNumber(stats.phone_creators)} phone creators</span>
              <span className="text-zinc-700">·</span>
              <span>{formatNumber(stats.analyzed_videos)} videos analyzed</span>
            </div>
          )}
          <a
            href="/integrations"
            className="text-xs text-zinc-500 hover:text-indigo-400 transition-colors px-2 py-1 rounded-md hover:bg-zinc-800/50"
          >
            Integrations
          </a>
          {state === "results" && (
            <button
              onClick={onReset}
              className="text-xs text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-zinc-800"
            >
              New Search
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
