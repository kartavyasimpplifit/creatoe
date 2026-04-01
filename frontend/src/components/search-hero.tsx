"use client";

import { useState } from "react";
import { Search } from "lucide-react";
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
    <div className="min-h-[94vh] flex flex-col items-center justify-center px-6 hero-glow">
      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-12">
          <CreatoeLogo size="lg" animate={showLogo} />
          <div className="text-[9px] tracking-[0.35em] uppercase mt-3 ml-1 font-normal" style={{ color: "var(--text-dim)" }}>
            by Suggest
          </div>
        </div>

        <p className="text-base text-center mb-10 leading-relaxed max-w-md font-light" style={{ color: "var(--text-secondary)" }}>
          Find the perfect creator for any product.
        </p>

        {/* Mode toggle — minimal text style */}
        <div className="flex items-center gap-6 mb-8">
          {([
            { key: "product" as Mode, label: "Product Match" },
            { key: "creators" as Mode, label: "Creators" },
            { key: "videos" as Mode, label: "Videos" },
          ]).map(m => (
            <button
              key={m.key}
              onClick={() => { setMode(m.key); setInput(""); }}
              className="text-[12px] font-normal transition-all duration-300 pb-1"
              style={{
                color: mode === m.key ? "var(--text)" : "var(--text-dim)",
                borderBottom: mode === m.key ? "1px solid var(--text)" : "1px solid transparent",
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Search bar — clean, minimal */}
        <form onSubmit={handleSubmit} className="w-full max-w-xl mb-3">
          <div className="flex items-center rounded-2xl transition-all duration-300"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="pl-4 pr-2" style={{ color: "var(--text-dim)" }}>
              <Search size={15} strokeWidth={1.5} />
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
              className="flex-1 bg-transparent py-4 px-2 text-[13px] font-light outline-none"
              style={{ color: "var(--text)", fontFamily: "inherit" }}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="mr-2 px-4 py-1.5 text-[12px] font-medium rounded-xl transition-all duration-300 disabled:opacity-10"
              style={{ color: "var(--text-secondary)" }}
            >
              {mode === "product" ? "Analyze" : "Search"}
            </button>
          </div>
        </form>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 max-w-xl mb-4 animate-fade-in">
            {suggestions.map(q => (
              <button
                key={q}
                onClick={() => { setInput(q); onAISearch(q, mode); setShowLogo(false); }}
                className="px-3 py-1 rounded-full text-[10px] font-normal transition-all duration-300"
                style={{ color: "var(--text-dim)", border: "1px solid var(--border)" }}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--border-light)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--text-dim)"; e.currentTarget.style.borderColor = "var(--border)"; }}
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
            className="text-[11px] font-light transition-colors duration-300 mb-4"
            style={{ color: "var(--text-dim)" }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--text-secondary)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-dim)"; }}
          >
            Try with Realme Narzo 70 5G →
          </button>
        )}

        {stats && (
          <div className="flex items-center gap-12 mt-16">
            {[
              { label: "creators", value: formatNumber(stats.phone_creators) },
              { label: "videos", value: formatNumber(stats.analyzed_videos) },
              { label: "languages", value: Object.keys(stats.languages).length.toString() },
            ].map((s, i) => (
              <div key={s.label} className="text-center animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="text-2xl font-light" style={{ color: "var(--text)", fontFamily: "var(--font-mono)" }}>
                  {s.value}
                </div>
                <div className="text-[8px] tracking-[0.3em] mt-2 font-normal lowercase" style={{ color: "var(--text-dim)" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
