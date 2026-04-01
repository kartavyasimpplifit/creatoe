"use client";

import { Check, Circle } from "lucide-react";
import type { ProductData } from "@/lib/api";

const STEPS = [
  { label: "Connecting to product page", detail: "Fetching marketplace data..." },
  { label: "Extracting product DNA", detail: "Brand, model, price, features..." },
  { label: "Scanning creator database", detail: "Matching against 432 phone creators..." },
  { label: "Computing match scores", detail: "Brand Fit · Feature Relevance · Quality..." },
  { label: "Analyzing demand intelligence", detail: "Language gaps, competitive share..." },
  { label: "Ranking results", detail: "Ordering by product-match score..." },
];

function ProgressRing({ progress }: { progress: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width="88" height="88" className="mb-6">
      <circle cx="44" cy="44" r={radius} fill="none" stroke="var(--border)" strokeWidth="1.5" />
      <circle cx="44" cy="44" r={radius} fill="none" stroke="var(--accent)" strokeWidth="1.5"
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.5s ease-out", transform: "rotate(-90deg)", transformOrigin: "center" }} />
      <text x="44" y="48" textAnchor="middle" fill="var(--text)" fontSize="14" fontFamily="var(--font-mono)" fontWeight="300">
        {Math.round(progress)}%
      </text>
    </svg>
  );
}

export function LoadingSequence({ step, url, product, errorMessage }: {
  step: number;
  url: string;
  product?: ProductData | null;
  errorMessage?: string;
}) {
  const progress = step >= 6 ? 100 : step >= 0 ? ((step + 1) / 6) * 100 : 0;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-5">
      <div className="max-w-md w-full flex flex-col items-center">
        {step !== -1 && <ProgressRing progress={progress} />}

        <div className="text-center mb-6">
          <div className="text-[9px] tracking-[0.3em] uppercase mb-2 font-normal" style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
            Analyzing
          </div>
          <div className="rounded-xl px-4 py-2 text-[11px] font-light truncate max-w-sm" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--accent)", fontFamily: "var(--font-mono)" }}>
            {url.length > 50 ? url.slice(0, 50) + "..." : url || "Searching..."}
          </div>
        </div>

        {product && step >= 2 && (
          <div className="w-full rounded-xl p-4 mb-5 animate-fade-in" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-3">
              {product.image_url ? (
                <img src={product.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" style={{ backgroundColor: "var(--bg-elevated)" }} />
              ) : (
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--bg-elevated)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="1"><rect x="5" y="2" width="14" height="20" rx="2"/></svg>
                </div>
              )}
              <div>
                <div className="text-[13px] font-normal" style={{ color: "var(--text)" }}>{product.brand} {product.model}</div>
                <div className="text-[11px] font-light" style={{ color: "var(--text-muted)" }}>
                  {product.price > 0 ? `₹${product.price.toLocaleString()} · ` : ""}{product.price_band}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === -1 ? (
          <div className="w-full rounded-xl p-6 text-center" style={{ backgroundColor: "rgba(254,44,85,0.06)", border: "1px solid rgba(254,44,85,0.1)" }}>
            <div className="text-[13px] font-normal mb-1" style={{ color: "var(--danger)" }}>
              {errorMessage && errorMessage !== "Analysis failed" ? "Not supported" : "Analysis failed"}
            </div>
            <div className="text-[11px] font-light" style={{ color: "var(--text-muted)" }}>
              {errorMessage || "Check the URL and try again."}
            </div>
          </div>
        ) : (
          <div className="w-full rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
            {STEPS.slice(0, Math.min(step + 1, STEPS.length)).map((s, i) => {
              const isActive = i === step && step < 6;
              const isDone = i < step;
              return (
                <div key={i} className="flex items-start gap-3 relative animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                  {i < STEPS.length - 1 && i < step && (
                    <div className="absolute left-[9px] top-[22px] w-px h-[calc(100%-4px)]" style={{ backgroundColor: "var(--border)" }} />
                  )}
                  <div className="w-5 flex justify-center flex-shrink-0 pt-0.5 relative z-10">
                    {isDone ? (
                      <Check size={11} style={{ color: "var(--success)" }} />
                    ) : isActive ? (
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--accent)", boxShadow: "0 0 8px rgba(129,140,248,0.4)" }} />
                    ) : (
                      <Circle size={6} style={{ color: "var(--border)" }} />
                    )}
                  </div>
                  <div className="pb-3">
                    <div className={`text-[11px] font-normal ${isActive ? "" : ""}`} style={{ color: isActive ? "var(--text)" : "var(--text-dim)" }}>{s.label}</div>
                    {isActive && (
                      <div className="text-[10px] font-light mt-0.5" style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
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
