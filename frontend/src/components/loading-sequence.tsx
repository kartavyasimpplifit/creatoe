"use client";

import type { ProductData } from "@/lib/api";

const STEPS = [
  { label: "Connecting to product page", detail: "Fetching data from marketplace..." },
  { label: "Extracting product DNA", detail: "Brand, model, price, features..." },
  { label: "Scanning creator database", detail: "Matching against 432 phone creators..." },
  { label: "Computing match scores", detail: "Brand Fit · Feature Relevance · Quality..." },
  { label: "Analyzing demand intelligence", detail: "Language gaps, competitive share..." },
  { label: "Ranking results", detail: "Ordering by product-match score..." },
];

export function LoadingSequence({ step, url, product }: {
  step: number;
  url: string;
  product?: ProductData | null;
}) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-5">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-[10px] font-[family-name:var(--font-mono)] text-[var(--text-dim)] tracking-[0.2em] uppercase mb-2">Analyzing</div>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-xs font-[family-name:var(--font-mono)] text-[var(--accent)] truncate">
            {url.length > 55 ? url.slice(0, 55) + "..." : url || "Searching..."}
          </div>
        </div>

        {product && step >= 2 && (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 mb-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-dim)] to-purple-500/10 flex items-center justify-center text-lg">📱</div>
              <div>
                <div className="text-sm font-bold text-[var(--text)]">{product.brand} {product.model}</div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  {product.price > 0 ? `₹${product.price.toLocaleString()} · ` : ""}{product.price_band} · {product.hero_feature}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === -1 ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
            <div className="text-red-400 text-sm font-semibold mb-2">Analysis failed</div>
            <div className="text-xs text-[var(--text-dim)]">Check the URL and try again.</div>
          </div>
        ) : (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 space-y-1.5">
            {STEPS.slice(0, Math.min(step + 1, STEPS.length)).map((s, i) => {
              const isActive = i === step && step < 6;
              const isDone = i < step;
              return (
                <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 animate-fade-in ${
                  isActive ? "bg-[var(--accent-dim)] border border-[var(--accent)]/20" : ""
                }`} style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="w-5 text-center flex-shrink-0">
                    {isDone ? <span className="text-[var(--success)] text-xs font-bold">✓</span>
                    : isActive ? <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse-glow" />
                    : <div className="w-2 h-2 rounded-full bg-[var(--border)]" />}
                  </div>
                  <div>
                    <div className={`text-xs font-semibold ${isActive ? "text-[var(--text)]" : isDone ? "text-[var(--text-dim)]" : "text-[var(--text-dim)]"}`}>{s.label}</div>
                    {isActive && <div className="text-[10px] text-[var(--text-dim)] font-[family-name:var(--font-mono)] mt-0.5">{s.detail}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
