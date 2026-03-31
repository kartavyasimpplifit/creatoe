"use client";

import { useState } from "react";
import { Search, Link2, Users, Play } from "lucide-react";
import { formatNumber, type StatsResponse } from "@/lib/api";
import { CreatoeLogo } from "./creatoe-logo";

const CREATOR_QUERIES = [
  "Hindi creators who reviewed Realme in last 60 days",
  "Telugu creators with high engagement",
  "Micro creators who review budget phones",
  "Camera test specialists for Samsung",
];
const VIDEO_QUERIES = [
  "Most viewed Samsung unboxing this month",
  "Budget phone camera test over 100K views",
  "Realme comparison videos last 30 days",
  "Top liked phone reviews this week",
];

type Mode = "product" | "creators" | "videos";

const MODES: { key: Mode; label: string; icon: React.ReactNode }[] = [
  { key: "product", label: "Product Match", icon: <Link2 size={14} /> },
  { key: "creators", label: "Creators", icon: <Users size={14} /> },
  { key: "videos", label: "Videos", icon: <Play size={14} /> },
];

export function SearchHero({ onProductSearch, onAISearch, stats }: {
  onProductSearch: (url: string) => void;
  onAISearch: (query: string, mode: string) => void;
  stats: StatsResponse | null;
}) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("product");
  const [showLogo, setShowLogo] = useState(true);

  const suggestions = mode === "creators" ? CREATOR_QUERIES : mode === "videos" ? VIDEO_QUERIES : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setShowLogo(false);
    mode === "product" ? onProductSearch(input.trim()) : onAISearch(input.trim(), mode);
  };

  return (
    <div className="min-h-[92vh] flex flex-col items-center justify-center px-6">
      <div className="mb-10">
        <CreatoeLogo size="lg" animate={showLogo} />
        <div className="text-[11px] text-[var(--text-muted)] tracking-[0.25em] uppercase mt-2.5 ml-0.5 font-medium">
          by Suggest
        </div>
      </div>

      <p className="text-[15px] text-[var(--text-secondary)] max-w-md text-center mb-8 leading-relaxed">
        AI-powered creator intelligence for commerce.<br />
        Match products, search creators, discover trending videos.
      </p>

      {/* Mode toggle */}
      <div className="flex items-center bg-[var(--bg-card)] border border-[var(--border)] rounded-full p-1 mb-6">
        {MODES.map(m => (
          <button
            key={m.key}
            onClick={() => { setMode(m.key); setInput(""); }}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
              mode === m.key
                ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            {m.icon}
            {m.label}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <form onSubmit={handleSubmit} className="w-full max-w-xl mb-4">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--accent)]/10 to-purple-500/10 rounded-2xl opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity duration-300" />
          <div className="relative flex items-center bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl focus-within:border-[var(--accent)]/30 transition-all duration-200">
            <div className="pl-4 pr-2 text-[var(--text-muted)]">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={input}
              onChange={e => {
                setInput(e.target.value);
                if (e.target.value.includes("flipkart.com") || e.target.value.includes("amazon.in") || e.target.value.includes("http")) setMode("product");
              }}
              placeholder={
                mode === "product" ? "Paste a Flipkart or Amazon link..."
                : mode === "creators" ? "Describe the creator you need..."
                : "What videos are you looking for..."
              }
              className="flex-1 bg-transparent py-3.5 px-2 text-sm text-[var(--text)] placeholder-[var(--text-muted)] outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="m-1.5 px-5 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-15 text-white text-sm font-semibold rounded-xl transition-all duration-200"
            >
              {mode === "product" ? "Analyze" : "Search"}
            </button>
          </div>
        </div>
      </form>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 max-w-xl mb-6 animate-fade-in">
          {suggestions.map(q => (
            <button
              key={q}
              onClick={() => { setInput(q); onAISearch(q, mode); setShowLogo(false); }}
              className="px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border)] text-[11px] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--border-light)] transition-all duration-200"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {mode === "product" && (
        <button
          onClick={() => {
            const u = "https://www.flipkart.com/realme-narzo-70-5g-forest-green-128-gb/p/itmb71c5e63b49db";
            setInput(u);
            onProductSearch(u);
            setShowLogo(false);
          }}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors duration-200"
        >
          Try with Realme Narzo 70 5G →
        </button>
      )}

      {stats && (
        <div className="flex gap-12 mt-16">
          {[
            { label: "Creators", value: formatNumber(stats.phone_creators) },
            { label: "Videos", value: formatNumber(stats.analyzed_videos) },
            { label: "Languages", value: Object.keys(stats.languages).length.toString() },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-[var(--text)]" style={{ fontFamily: "var(--font-mono)" }}>
                {s.value}
              </div>
              <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-[0.25em] mt-1.5 font-medium">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
