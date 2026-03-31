"use client";

export function CampaignBar({ count, onView, onExport }: {
  count: number;
  onView: () => void;
  onExport: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white text-sm font-bold">
            {count}
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Campaign Builder</div>
            <div className="text-[10px] text-zinc-500">{count} creator{count > 1 ? "s" : ""} selected</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onExport}
            className="px-3 py-1.5 bg-zinc-800 text-zinc-300 text-xs font-medium rounded-lg hover:bg-zinc-700 transition-colors"
          >
            Export CSV
          </button>
          <button
            onClick={onView}
            className="px-4 py-1.5 bg-indigo-500 text-white text-xs font-semibold rounded-lg hover:bg-indigo-400 transition-colors"
          >
            View Campaign →
          </button>
        </div>
      </div>
    </div>
  );
}
