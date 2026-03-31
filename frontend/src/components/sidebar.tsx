"use client";

import { Search, Tag, BarChart3, Puzzle, CreditCard, Zap } from "lucide-react";
import { CreatoeLogoInline } from "./creatoe-logo";

type NavItem = { id: string; icon: React.ReactNode; label: string };

const NAV_ITEMS: NavItem[] = [
  { id: "search", label: "Search", icon: <Search size={18} /> },
  { id: "match", label: "Product Match", icon: <Tag size={18} /> },
  { id: "intel", label: "Intelligence", icon: <BarChart3 size={18} /> },
  { id: "integrations", label: "Integrations", icon: <Puzzle size={18} /> },
  { id: "pricing", label: "Pricing", icon: <CreditCard size={18} /> },
];

export function Sidebar({ active, onNavigate, credits }: {
  active: string;
  onNavigate: (id: string) => void;
  credits: number;
}) {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[56px] hover:w-[200px] bg-[var(--bg-surface)] border-r border-[var(--border)] z-50 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group overflow-hidden flex flex-col">
      <div className="h-14 flex items-center px-4 border-b border-[var(--border)] flex-shrink-0">
        <div className="group-hover:hidden flex items-center justify-center w-6">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center shadow-[0_0_12px_rgba(129,140,248,0.2)]">
            <span className="text-white text-[11px] font-extrabold tracking-tight">Ce</span>
          </div>
        </div>
        <div className="hidden group-hover:block">
          <CreatoeLogoInline />
        </div>
      </div>

      <nav className="flex-1 py-3 flex flex-col gap-0.5 px-2">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all duration-200 w-full text-left ${
              active === item.id
                ? "bg-[var(--accent-dim)] text-[var(--accent)]"
                : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-card)]"
            }`}
          >
            <div className="flex-shrink-0 w-5 flex justify-center">{item.icon}</div>
            <span className="text-[12px] font-medium whitespace-nowrap hidden group-hover:block opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75">
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="px-2 pb-3 flex-shrink-0">
        <div className="bg-[var(--bg-card)] rounded-xl p-2.5 border border-[var(--border)]">
          <div className="flex items-center gap-2">
            <div className="w-5 flex justify-center flex-shrink-0">
              <Zap size={14} className="text-[var(--accent)]" />
            </div>
            <div className="hidden group-hover:block opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75">
              <div className="text-[10px] text-[var(--text-muted)]">Pro Plan</div>
              <div className="text-xs font-bold text-[var(--text)]" style={{ fontFamily: "var(--font-mono)" }}>
                {credits.toLocaleString()} credits
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
