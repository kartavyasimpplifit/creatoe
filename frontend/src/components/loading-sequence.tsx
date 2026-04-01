"use client";

import { Check, Loader2, Circle } from "lucide-react";
import type { ProductData } from "@/lib/api";

const STEPS = [
  { label: "Connecting to product page", detail: "Fetching data from marketplace..." },
  { label: "Extracting product DNA", detail: "Brand, model, price, features..." },
  { label: "Scanning creator database", detail: "Matching against 432 phone creators..." },
  { label: "Computing match scores", detail: "Brand Fit · Feature Relevance · Quality..." },
  { label: "Analyzing demand intelligence", detail: "Language gaps, competitive share..." },
  { label: "Ranking results", detail: "Ordering by product-match score..." },
];

export function LoadingSequence({ step, url, product, errorMessage }: {
  step: number;
  url: string;
  product?: ProductData | null;
  errorMessage?: string;
}) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-5">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-[10px] text-[var(--text-muted)] tracking-[0.25em] uppercase mb-2" style={{ fontFamily: "var(--font-mono)" }}>
            Analyzing
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-xs text-[var(--accent)] truncate" style={{ fontFamily: "var(--font-mono)" }}>
            {url.length > 55 ? url.slice(0, 55) + "..." : url || "Searching..."}
          </div>
        </div>

        {product && step >= 2 && (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 mb-6 animate-fade-in">
            <div className="flex items-center gap-3">
              {product.image_url ? (
                <img src={product.image_url} alt="" className="w-10 h-10 rounded-xl object-cover bg-[var(--bg-elevated)]" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="2"/></svg>
                </div>
              )}
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
          <div className="rounded-xl p-6 text-center" style={{ background: "rgba(254,44,85,0.08)", border: "1px solid rgba(254,44,85,0.15)" }}>
            <div style={{ color: "var(--danger)" }} className="text-sm font-semibold mb-2">
              {errorMessage && errorMessage !== "Analysis failed" ? "Not supported" : "Analysis failed"}
            </div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>
              {errorMessage || "Check the URL and try again."}
            </div>
          </div>
        ) : (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 space-y-1.5">
            {STEPS.slice(0, Math.min(step + 1, STEPS.length)).map((s, i) => {
              const isActive = i === step && step < 6;
              const isDone = i < step;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 animate-fade-in ${
                    isActive ? "bg-[var(--accent-dim)] border border-[var(--accent)]/15" : ""
                  }`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="w-5 flex justify-center flex-shrink-0">
                    {isDone ? (
                      <Check size={12} className="text-[var(--success)]" />
                    ) : isActive ? (
                      <Loader2 size={12} className="text-[var(--accent)] animate-spin" />
                    ) : (
                      <Circle size={8} className="text-[var(--border)]" />
                    )}
                  </div>
                  <div>
                    <div className={`text-xs font-semibold ${isActive ? "text-[var(--text)]" : "text-[var(--text-muted)]"}`}>{s.label}</div>
                    {isActive && (
                      <div className="text-[10px] text-[var(--text-muted)] mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>
                        {s.detail}
                      </div>
                    )}
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
