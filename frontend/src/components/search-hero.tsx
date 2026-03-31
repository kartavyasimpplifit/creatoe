"use client";

import { useState } from "react";
import { formatNumber, type StatsResponse } from "@/lib/api";

const CREATOR_QUERIES = [
  "Hindi creators who reviewed Realme in last 60 days",
  "Telugu creators with high engagement under 200K subs",
  "Micro creators who review budget phones",
  "Camera test specialists for Samsung",
];

const VIDEO_QUERIES = [
  "Most viewed Samsung unboxing videos this month",
  "Budget phone camera test videos over 100K views",
  "Realme comparison videos last 30 days",
  "Top liked phone review videos this week",
];

type Mode = "product" | "creators" | "videos";

export function SearchHero({ onProductSearch, onAISearch, stats }: {
  onProductSearch: (url: string) => void;
  onAISearch: (query: string, mode: string) => void;
  stats: StatsResponse | null;
}) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("product");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (mode === "product") {
      onProductSearch(input.trim());
    } else {
      onAISearch(input.trim(), mode);
    }
  };

  const suggestions = mode === "creators" ? CREATOR_QUERIES : mode === "videos" ? VIDEO_QUERIES : [];
  const placeholders: Record<Mode, string> = {
    product: "Paste a Flipkart or Amazon product link...",
    creators: "e.g. Hindi creators who review budget Realme phones...",
    videos: "e.g. Most viewed Samsung unboxing videos this month...",
  };

  const icons: Record<Mode, React.ReactNode> = {
    product: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
    creators: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    videos: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center px-5">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-[var(--accent-dim)] border border-[var(--accent)]/15 rounded-full px-4 py-1.5 mb-7">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse-glow" />
          <span className="text-[11px] font-medium text-[var(--accent)] tracking-wide">
            {stats ? `${formatNumber(stats.phone_creators)} creators · ${formatNumber(stats.analyzed_videos)} videos analyzed` : "Loading..."}
          </span>
        </div>

        <h1 className="text-[2.75rem] sm:text-[3.5rem] md:text-[4rem] font-extrabold tracking-[-0.03em] leading-[1.05] mb-5">
          <span className="text-[var(--text)]">AI-powered</span>
          <br />
          <span className="bg-gradient-to-r from-[var(--accent)] via-purple-400 to-[var(--accent)] bg-clip-text text-transparent">
            creator intelligence
          </span>
        </h1>
        <p className="text-[15px] text-[var(--text-muted)] max-w-lg mx-auto leading-relaxed">
          Match products to creators, search creators by attributes,
          or discover trending videos across YouTube India.
        </p>
      </div>

      {/* 3-mode toggle */}
      <div className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-full p-1 mb-5">
        {([
          { key: "product" as Mode, label: "Product Match" },
          { key: "creators" as Mode, label: "Search Creators" },
          { key: "videos" as Mode, label: "Search Videos" },
        ]).map(m => (
          <button
            key={m.key}
            onClick={() => { setMode(m.key); setInput(""); }}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              mode === m.key ? "bg-[var(--accent)] text-white shadow-[0_0_10px_rgba(129,140,248,0.25)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <form onSubmit={handleSubmit} className="w-full max-w-2xl mb-4">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--accent)]/20 via-purple-500/10 to-[var(--accent)]/20 rounded-2xl opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity duration-500" />
          <div className="relative flex items-center bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden focus-within:border-[var(--accent)]/40 transition-all">
            <div className="pl-5 pr-2 text-[var(--text-dim)]">
              {icons[mode]}
            </div>
            <input
              type="text"
              value={input}
              onChange={e => {
                setInput(e.target.value);
                if (e.target.value.includes("flipkart.com") || e.target.value.includes("amazon.in") || e.target.value.includes("http")) {
                  setMode("product");
                }
              }}
              placeholder={placeholders[mode]}
              className="flex-1 bg-transparent py-4 px-2 text-sm text-[var(--text)] placeholder-[var(--text-dim)] outline-none"
            />
            <button type="submit" disabled={!input.trim()}
              className="m-2 px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-20 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all">
              {mode === "product" ? "Analyze" : "Search"}
            </button>
          </div>
        </div>
      </form>

      {/* Suggested queries */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 max-w-2xl mb-4 animate-fade-in">
          {suggestions.map(q => (
            <button key={q} onClick={() => { setInput(q); onAISearch(q, mode); }}
              className="px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border)] text-[11px] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--border-light)] transition-all">
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Demo link (product mode) */}
      {mode === "product" && (
        <button
          onClick={() => { const u = "https://www.flipkart.com/realme-narzo-70-5g-forest-green-128-gb/p/itmb71c5e63b49db"; setInput(u); onProductSearch(u); }}
          className="text-xs text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors mb-16">
          Try with Realme Narzo 70 5G →
        </button>
      )}

      {/* Stats */}
      {stats && (
        <div className="flex flex-wrap justify-center gap-12 mt-8">
          {[
            { label: "Phone Creators", value: formatNumber(stats.phone_creators) },
            { label: "Videos Analyzed", value: formatNumber(stats.analyzed_videos) },
            { label: "Languages", value: Object.keys(stats.languages).length.toString() },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-[var(--text)] font-[family-name:var(--font-mono)]">{s.value}</div>
              <div className="text-[10px] text-[var(--text-dim)] uppercase tracking-[0.15em] mt-1.5 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
