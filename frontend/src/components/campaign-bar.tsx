"use client";

import { Download, ArrowRight } from "lucide-react";

export function CampaignBar({ count, onView, onExport }: {
  count: number;
  onView: () => void;
  onExport: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-[48px] right-0 z-40 glass" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-medium text-white" style={{ backgroundColor: "var(--accent)" }}>
            {count}
          </div>
          <div>
            <div className="text-[13px] font-normal" style={{ color: "var(--text)" }}>Campaign Builder</div>
            <div className="text-[10px] font-light" style={{ color: "var(--text-dim)" }}>{count} creator{count > 1 ? "s" : ""} selected</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onExport}
            className="px-3 py-1.5 text-[11px] font-normal rounded-lg flex items-center gap-1.5 transition-all duration-300"
            style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}>
            <Download size={11} /> Export
          </button>
          <button onClick={onView}
            className="px-4 py-1.5 text-[11px] font-medium rounded-lg flex items-center gap-1.5 transition-all duration-300"
            style={{ color: "var(--accent)", border: "1px solid var(--accent)" }}>
            View Campaign <ArrowRight size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}
