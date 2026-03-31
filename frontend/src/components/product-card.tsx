"use client";

import type { ProductData } from "@/lib/api";
import { formatNumber } from "@/lib/api";

const BAND_COLORS: Record<string, string> = {
  budget: "text-emerald-400",
  mid: "text-blue-400",
  "mid-premium": "text-purple-400",
  premium: "text-amber-400",
  "ultra-premium": "text-rose-400",
};

export function ProductCard({ product, totalMatched, totalDisqualified }: {
  product: ProductData;
  totalMatched: number;
  totalDisqualified: number;
}) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 animate-fade-in">
      <div className="flex items-start gap-4 mb-5">
        {product.image_url ? (
          <img src={product.image_url} alt="" className="w-16 h-16 rounded-xl object-cover bg-[var(--bg-elevated)]" />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-base font-bold text-[var(--text)] leading-tight">
            {product.brand} {product.model}
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {product.price > 0 && (
              <span className="text-sm font-semibold text-[var(--gold)]" style={{ fontFamily: "var(--font-mono)" }}>
                ₹{product.price.toLocaleString()}
              </span>
            )}
            <span className={`text-[10px] font-bold uppercase ${BAND_COLORS[product.price_band] || "text-[var(--text-muted)]"}`}>
              {product.price_band}
            </span>
          </div>
          {product.key_features.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {product.key_features.slice(0, 3).map(f => (
                <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-end justify-between pt-4 border-t border-[var(--border)]">
        <div>
          <div className="text-3xl font-extrabold text-[var(--text)] tracking-tight" style={{ fontFamily: "var(--font-mono)" }}>
            {formatNumber(totalMatched)}
          </div>
          <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-[0.2em] mt-1 font-medium">Creators Matched</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-[var(--text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>{totalDisqualified}</div>
          <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-[0.2em] mt-1">Filtered</div>
        </div>
      </div>
    </div>
  );
}
