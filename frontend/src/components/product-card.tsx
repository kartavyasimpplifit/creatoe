"use client";

import type { ProductData } from "@/lib/api";
import { formatNumber } from "@/lib/api";

export function ProductCard({ product, totalMatched, totalDisqualified }: {
  product: ProductData;
  totalMatched: number;
  totalDisqualified: number;
}) {
  const bandColors: Record<string, string> = {
    budget: "text-emerald-400 bg-emerald-400/10",
    mid: "text-blue-400 bg-blue-400/10",
    "mid-premium": "text-purple-400 bg-purple-400/10",
    premium: "text-amber-400 bg-amber-400/10",
    "ultra-premium": "text-rose-400 bg-rose-400/10",
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-start gap-3 mb-3">
        {product.image_url ? (
          <img src={product.image_url} alt="" className="w-12 h-12 rounded-lg object-cover bg-zinc-800" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-xl">📱</div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white leading-tight">
            {product.brand} {product.model}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {product.price > 0 && (
              <span className="text-xs font-mono text-zinc-300">₹{product.price.toLocaleString()}</span>
            )}
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${bandColors[product.price_band] || "text-zinc-400 bg-zinc-800"}`}>
              {product.price_band}
            </span>
            {product.key_features.slice(0, 3).map(f => (
              <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">{f}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
        <div>
          <div className="text-xl font-bold text-white font-mono">{formatNumber(totalMatched)}</div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Creators Matched</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-mono text-zinc-500">{totalDisqualified}</div>
          <div className="text-[10px] text-zinc-600 uppercase tracking-wider">Filtered Out</div>
        </div>
      </div>
    </div>
  );
}
