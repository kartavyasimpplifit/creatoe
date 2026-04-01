"use client";

import type { ProductData } from "@/lib/api";
import { formatNumber } from "@/lib/api";

const BAND_COLORS: Record<string, string> = {
  budget: "#34d399", mid: "#60a5fa", "mid-premium": "#a78bfa",
  premium: "#fbbf24", "ultra-premium": "#fb7185",
};

export function ProductCard({ product, totalMatched, totalDisqualified }: {
  product: ProductData;
  totalMatched: number;
  totalDisqualified: number;
}) {
  return (
    <div className="rounded-2xl p-6 animate-fade-in" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div className="flex items-start gap-4 mb-6">
        {product.image_url ? (
          <img src={product.image_url} alt="" className="w-20 h-20 rounded-xl object-cover" style={{ backgroundColor: "var(--bg-elevated)" }} />
        ) : (
          <div className="w-20 h-20 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--bg-elevated)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="1"><rect x="5" y="2" width="14" height="20" rx="2"/></svg>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-normal leading-tight" style={{ color: "var(--text)" }}>
            {product.brand} {product.model}
          </div>
          <div className="flex items-center gap-2 mt-2">
            {product.price > 0 && (
              <span className="text-[13px] font-light" style={{ color: "var(--gold)", fontFamily: "var(--font-mono)" }}>
                ₹{product.price.toLocaleString()}
              </span>
            )}
            <span className="text-[9px] font-medium uppercase" style={{ color: BAND_COLORS[product.price_band] || "var(--text-dim)" }}>
              {product.price_band}
            </span>
          </div>
          {product.key_features.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {product.key_features.slice(0, 3).map(f => (
                <span key={f} className="text-[9px] px-2 py-0.5 rounded-full" style={{ color: "var(--text-dim)", border: "1px solid var(--border)" }}>
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pt-4" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-4xl font-light text-gradient tracking-tight" style={{ fontFamily: "var(--font-mono)" }}>
              {formatNumber(totalMatched)}
            </div>
            <div className="text-[8px] tracking-[0.25em] mt-1 font-normal lowercase" style={{ color: "var(--text-dim)" }}>creators matched</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-light" style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>{totalDisqualified}</div>
            <div className="text-[8px] tracking-[0.25em] mt-1 lowercase" style={{ color: "var(--text-dim)" }}>filtered</div>
          </div>
        </div>
      </div>
    </div>
  );
}
