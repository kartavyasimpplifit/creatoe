"use client";

import type { ProductData } from "@/lib/api";
import { formatNumber } from "@/lib/api";

const BAND_STYLES: Record<string, string> = {
  budget: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  mid: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "mid-premium": "text-purple-400 bg-purple-500/10 border-purple-500/20",
  premium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  "ultra-premium": "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

export function ProductCard({ product, totalMatched, totalDisqualified }: {
  product: ProductData;
  totalMatched: number;
  totalDisqualified: number;
}) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 animate-fade-in">
      <div className="flex items-start gap-4 mb-4">
        {product.image_url ? (
          <img src={product.image_url} alt="" className="w-14 h-14 rounded-xl object-cover bg-[var(--bg-elevated)]" />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--accent-dim)] to-purple-500/10 flex items-center justify-center text-2xl">
            📱
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-base font-bold text-[var(--text)] leading-tight">
            {product.brand} {product.model}
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {product.price > 0 && (
              <span className="text-sm font-semibold font-[family-name:var(--font-mono)] text-[var(--gold)]">
                ₹{product.price.toLocaleString()}
              </span>
            )}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${BAND_STYLES[product.price_band] || "text-[var(--text-dim)] bg-[var(--bg-elevated)]"}`}>
              {product.price_band.toUpperCase()}
            </span>
            {product.key_features.slice(0, 3).map(f => (
              <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border)]">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-end justify-between pt-4 border-t border-[var(--border)]">
        <div>
          <div className="text-2xl font-extrabold text-[var(--text)] font-[family-name:var(--font-mono)] tracking-tight">
            {formatNumber(totalMatched)}
          </div>
          <div className="text-[10px] text-[var(--text-dim)] uppercase tracking-[0.15em] mt-0.5 font-medium">Creators Matched</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold font-[family-name:var(--font-mono)] text-[var(--text-dim)]">{totalDisqualified}</div>
          <div className="text-[10px] text-[var(--text-dim)] uppercase tracking-[0.15em] mt-0.5">Filtered</div>
        </div>
      </div>
    </div>
  );
}
