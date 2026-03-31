"use client";

import { useState } from "react";
import { formatNumber, type StatsResponse } from "@/lib/api";

export function SearchHero({ onSearch, stats }: {
  onSearch: (url: string) => void;
  stats: StatsResponse | null;
}) {
  const [url, setUrl] = useState("");

  return (
    <div className="min-h-[88vh] flex flex-col items-center justify-center px-4">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-indigo-500/8 border border-indigo-500/15 rounded-full px-4 py-1.5 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-medium text-indigo-300 tracking-wide">
            {stats ? `${formatNumber(stats.phone_creators)} phone creators indexed` : "Loading..."}
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 leading-[1.1]">
          <span className="text-white">Find the perfect</span>
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            creator for any product
          </span>
        </h1>
        <p className="text-sm sm:text-base text-zinc-500 max-w-lg mx-auto leading-relaxed">
          Paste a Flipkart or Amazon product link. Get AI-matched creators with
          brand affinity, price alignment, and video evidence.
        </p>
      </div>

      <form
        onSubmit={e => { e.preventDefault(); url.trim() && onSearch(url.trim()); }}
        className="w-full max-w-2xl mb-4"
      >
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity duration-500" />
          <div className="relative flex items-center bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden focus-within:border-indigo-500/40 transition-all">
            <div className="pl-5 pr-2 text-zinc-600">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="Paste a Flipkart or Amazon product link..."
              className="flex-1 bg-transparent py-4 px-2 text-sm text-white placeholder-zinc-600 outline-none"
            />
            <button
              type="submit"
              disabled={!url.trim()}
              className="m-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-20 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all"
            >
              Analyze
            </button>
          </div>
        </div>
      </form>

      <button
        onClick={() => { const u = "https://www.flipkart.com/realme-narzo-70-5g-forest-green-128-gb/p/itmb71c5e63b49db"; setUrl(u); onSearch(u); }}
        className="text-xs text-zinc-600 hover:text-indigo-400 transition-colors mb-16"
      >
        Try with Realme Narzo 70 5G →
      </button>

      {stats && (
        <div className="flex flex-wrap justify-center gap-10">
          {[
            { label: "Phone Creators", value: formatNumber(stats.phone_creators) },
            { label: "Videos Analyzed", value: formatNumber(stats.analyzed_videos) },
            { label: "Languages", value: Object.keys(stats.languages).length.toString() },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-white font-mono">{s.value}</div>
              <div className="text-[10px] text-zinc-600 uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
