"use client";

import { useState, useEffect } from "react";

export function CreatoeLogo({ size = "md", animate = false }: { size?: "sm" | "md" | "lg"; animate?: boolean }) {
  const [step, setStep] = useState(animate ? 0 : 3);

  useEffect(() => {
    if (!animate) return;
    const t1 = setTimeout(() => setStep(1), 400);
    const t2 = setTimeout(() => setStep(2), 900);
    const t3 = setTimeout(() => setStep(3), 1300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [animate]);

  const sizes = {
    sm: { text: "text-lg", dot: "w-1 h-1" },
    md: { text: "text-2xl", dot: "w-1.5 h-1.5" },
    lg: { text: "text-5xl", dot: "w-2 h-2" },
  };
  const s = sizes[size];

  return (
    <div className="inline-flex flex-col items-start">
      <div className={`${s.text} font-extrabold tracking-[-0.03em] select-none`}>
        <span className="text-[var(--text)]">Creato</span>
        <span
          className="text-[var(--accent)] inline-block"
          style={{
            opacity: step >= 2 ? 1 : step >= 1 ? 0.3 : 0,
            transform: step >= 3 ? "translateY(0)" : "translateY(4px)",
            transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          e
        </span>
        {step < 2 && (
          <span className="text-[var(--accent)] opacity-60" style={{ animation: "blink 0.8s infinite" }}>|</span>
        )}
      </div>
      <div className="flex items-center mt-0.5" style={{ paddingLeft: size === "lg" ? "calc(100% - 16px)" : size === "md" ? "calc(100% - 10px)" : "calc(100% - 8px)" }}>
        <div
          className={`${s.dot} rounded-full bg-[var(--accent)]`}
          style={{
            opacity: step >= 3 ? 1 : 0,
            transform: step >= 3 ? "scale(1)" : "scale(0)",
            transition: "all 0.3s ease-out 0.1s",
          }}
        />
      </div>
    </div>
  );
}

export function CreatoeLogoInline() {
  return (
    <span className="text-sm font-extrabold tracking-[-0.02em] select-none">
      <span className="text-[var(--text)]">Creato</span>
      <span className="text-[var(--accent)] relative">
        e
        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--accent)] opacity-70" />
      </span>
    </span>
  );
}
