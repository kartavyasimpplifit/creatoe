"use client";

import { CreatoeLogoInline } from "./creatoe-logo";

type NavItem = { id: string; icon: React.ReactNode; label: string };

const NAV_ITEMS: NavItem[] = [
  {
    id: "search",
    label: "Search",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  },
  {
    id: "match",
    label: "Product Match",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  },
  {
    id: "intel",
    label: "Intelligence",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  },
  {
    id: "pricing",
    label: "Pricing",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  },
];

export function Sidebar({ active, onNavigate, credits }: {
  active: string;
  onNavigate: (id: string) => void;
  credits: number;
}) {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[60px] hover:w-[200px] bg-[var(--bg-card)] border-r border-[var(--border)] z-50 transition-all duration-200 group overflow-hidden flex flex-col">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-[var(--border)] flex-shrink-0">
        <div className="group-hover:hidden">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <span className="text-white text-xs font-extrabold">C</span>
          </div>
        </div>
        <div className="hidden group-hover:block">
          <CreatoeLogoInline />
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3 flex flex-col gap-0.5 px-2">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all w-full text-left ${
              active === item.id
                ? "bg-[var(--accent-dim)] text-[var(--accent)]"
                : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)]"
            }`}
          >
            <div className="flex-shrink-0 w-5 flex justify-center">{item.icon}</div>
            <span className="text-xs font-medium whitespace-nowrap hidden group-hover:block">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Credits */}
      <div className="px-2 pb-3 flex-shrink-0">
        <div className="bg-[var(--bg-elevated)] rounded-xl p-2.5 border border-[var(--border)]">
          <div className="flex items-center gap-2">
            <div className="w-5 flex justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            </div>
            <div className="hidden group-hover:block">
              <div className="text-[10px] text-[var(--text-muted)]">Pro Plan</div>
              <div className="text-xs font-bold text-[var(--text)] font-[family-name:var(--font-mono)]">
                {credits.toLocaleString()} credits
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
