"use client";

import { Download, ArrowRight } from "lucide-react";

export function CampaignBar({ count, onView, onExport }: {
  count: number;
  onView: () => void;
  onExport: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-[56px] right-0 z-40 glass border-t border-[var(--border)]">
      <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[var(--accent)] flex items-center justify-center text-white text-sm font-extrabold shadow-[0_0_15px_rgba(129,140,248,0.25)]">
            {count}
          </div>
          <div>
            <div className="text-sm font-bold text-[var(--text)]">Campaign Builder</div>
            <div className="text-[10px] text-[var(--text-muted)]">{count} creator{count > 1 ? "s" : ""} selected</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onExport}
            className="px-4 py-2 bg-[var(--bg-card)] text-[var(--text-muted)] text-xs font-semibold rounded-xl hover:text-[var(--text)] border border-[var(--border)] transition-all duration-200 flex items-center gap-1.5"
          >
            <Download size={12} />
            Export CSV
          </button>
          <button
            onClick={onView}
            className="px-5 py-2 bg-[var(--accent)] text-white text-xs font-bold rounded-xl hover:bg-[var(--accent-hover)] transition-all duration-200 flex items-center gap-1.5"
          >
            View Campaign
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
