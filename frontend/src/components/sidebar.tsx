"use client";

import { Search, Tag, BarChart3, Puzzle, CreditCard, Zap } from "lucide-react";
import { CreatoeLogoInline } from "./creatoe-logo";

type NavItem = { id: string; icon: React.ReactNode; label: string };

const NAV_ITEMS: NavItem[] = [
  { id: "search", label: "Search", icon: <Search size={16} strokeWidth={1.5} /> },
  { id: "match", label: "Product Match", icon: <Tag size={16} strokeWidth={1.5} /> },
  { id: "intel", label: "Intelligence", icon: <BarChart3 size={16} strokeWidth={1.5} /> },
  { id: "integrations", label: "Integrations", icon: <Puzzle size={16} strokeWidth={1.5} /> },
  { id: "pricing", label: "Pricing", icon: <CreditCard size={16} strokeWidth={1.5} /> },
];

export function Sidebar({ active, onNavigate, credits }: {
  active: string;
  onNavigate: (id: string) => void;
  credits: number;
}) {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[48px] hover:w-[192px] z-50 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group overflow-hidden flex flex-col"
      style={{ background: "linear-gradient(180deg, #080808 0%, #0a0a0a 100%)", borderRight: "1px solid #141414" }}>
      <div className="h-14 flex items-center px-3.5 flex-shrink-0" style={{ borderBottom: "1px solid #141414" }}>
        <div className="group-hover:hidden flex items-center justify-center w-5">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: "var(--bg-elevated)" }}>
            <span className="text-white text-[9px] font-semibold">Ce</span>
          </div>
        </div>
        <div className="hidden group-hover:block">
          <CreatoeLogoInline />
        </div>
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-0.5 px-1.5">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="relative flex items-center gap-3 px-2 py-2.5 rounded-lg w-full text-left transition-all duration-300"
            style={{
              color: active === item.id ? "var(--text)" : "var(--text-muted)",
              backgroundColor: active === item.id ? "var(--bg-elevated)" : "transparent",
            }}
            onMouseEnter={e => { if (active !== item.id) (e.currentTarget.style.color = "var(--text-secondary)"); }}
            onMouseLeave={e => { if (active !== item.id) (e.currentTarget.style.color = "var(--text-muted)"); }}
          >
            {active === item.id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-full" style={{ backgroundColor: "var(--text)" }} />
            )}
            <div className="flex-shrink-0 w-5 flex justify-center">{item.icon}</div>
            <span className="text-[11px] font-normal whitespace-nowrap hidden group-hover:block opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100">
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="px-1.5 pb-3 flex-shrink-0">
        <div className="rounded-lg p-2" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2">
            <div className="w-5 flex justify-center flex-shrink-0">
              <Zap size={12} style={{ color: "var(--text-secondary)" }} />
            </div>
            <div className="hidden group-hover:block opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100">
              <div className="text-[9px]" style={{ color: "var(--text-dim)" }}>Pro</div>
              <div className="text-[11px] font-medium" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                {credits.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
