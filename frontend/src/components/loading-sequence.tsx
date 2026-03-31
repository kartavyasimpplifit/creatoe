"use client";

import type { ProductData } from "@/lib/api";

const STEPS = [
  { label: "Connecting to product page", detail: "Fetching product data..." },
  { label: "Extracting product DNA", detail: "Brand, model, price, features..." },
  { label: "Scanning creator database", detail: "Matching against 432 phone creators..." },
  { label: "Computing 3-dimension scores", detail: "Brand Fit · Feature Relevance · Quality..." },
  { label: "Analyzing demand intelligence", detail: "Language gaps, competitive share, trends..." },
  { label: "Ranking results", detail: "Ordering by product-match score..." },
];

export function LoadingSequence({ step, url, product }: {
  step: number;
  url: string;
  product?: ProductData | null;
}) {
  const isError = step === -1;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="text-[10px] font-mono text-zinc-600 tracking-widest uppercase mb-2">Analyzing</div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-mono text-indigo-300 truncate">
            {url.length > 65 ? url.slice(0, 65) + "..." : url}
          </div>
        </div>

        {product && step >= 2 && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 mb-6 animate-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-lg">📱</div>
              <div>
                <div className="text-sm font-semibold text-white">{product.brand} {product.model}</div>
                <div className="text-[11px] text-zinc-500">
                  {product.price > 0 ? `₹${product.price.toLocaleString()}` : ""} · {product.price_band} · {product.hero_feature}
                </div>
              </div>
            </div>
          </div>
        )}

        {isError ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
            <div className="text-red-400 text-sm font-medium mb-2">Analysis failed</div>
            <div className="text-xs text-zinc-500">Please check the URL and try again.</div>
          </div>
        ) : (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 space-y-2">
            {STEPS.slice(0, Math.min(step + 1, STEPS.length)).map((s, i) => {
              const isActive = i === step && step < 6;
              const isDone = i < step;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${
                    isActive ? "bg-indigo-500/8 border border-indigo-500/20" : isDone ? "opacity-50" : ""
                  }`}
                >
                  <div className="w-5 text-center flex-shrink-0">
                    {isDone ? (
                      <span className="text-emerald-400 text-xs">✓</span>
                    ) : isActive ? (
                      <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-zinc-700" />
                    )}
                  </div>
                  <div>
                    <div className={`text-xs font-medium ${isActive ? "text-white" : "text-zinc-400"}`}>{s.label}</div>
                    {isActive && <div className="text-[10px] text-zinc-600 font-mono mt-0.5">{s.detail}</div>}
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
