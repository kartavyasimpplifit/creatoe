"use client";

export function CampaignBar({ count, onView, onExport }: {
  count: number;
  onView: () => void;
  onExport: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-[var(--border)]/50">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent)] to-purple-500 flex items-center justify-center text-white text-sm font-extrabold shadow-[0_0_15px_rgba(129,140,248,0.3)]">
            {count}
          </div>
          <div>
            <div className="text-sm font-bold text-[var(--text)]">Campaign Builder</div>
            <div className="text-[10px] text-[var(--text-dim)]">{count} creator{count > 1 ? "s" : ""} selected</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onExport}
            className="px-4 py-2 bg-[var(--bg-elevated)] text-[var(--text-muted)] text-xs font-semibold rounded-xl hover:text-[var(--text)] border border-[var(--border)] transition-all">
            Export CSV
          </button>
          <button onClick={onView}
            className="px-5 py-2 bg-gradient-to-r from-[var(--accent)] to-purple-500 text-white text-xs font-bold rounded-xl hover:shadow-[0_0_20px_rgba(129,140,248,0.3)] transition-all">
            View Campaign →
          </button>
        </div>
      </div>
    </div>
  );
}
