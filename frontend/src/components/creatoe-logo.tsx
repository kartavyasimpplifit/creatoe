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
    sm: { text: "text-lg", dot: "w-1 h-1", glow: 0 },
    md: { text: "text-2xl", dot: "w-1.5 h-1.5", glow: 40 },
    lg: { text: "text-6xl md:text-7xl", dot: "w-2 h-2", glow: 120 },
  };
  const s = sizes[size];

  return (
    <div className="inline-flex flex-col items-start relative">
      {size === "lg" && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            width: `${s.glow * 4}px`,
            height: `${s.glow * 4}px`,
            background: "radial-gradient(circle, rgba(139, 149, 165, 0.06) 0%, transparent 70%)",
            opacity: step >= 3 ? 1 : 0,
            transition: "opacity 1s ease-out",
          }}
        />
      )}
      <div className={`${s.text} font-light tracking-[-0.02em] select-none relative z-10`}>
        <span style={{ color: "var(--text)" }}>Creato</span>
        <span
          className="inline-block"
          style={{
            color: "var(--accent)",
            opacity: step >= 2 ? 1 : step >= 1 ? 0.3 : 0,
            transform: step >= 3 ? "translateY(0)" : "translateY(4px)",
            transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          e
        </span>
        {step < 2 && (
          <span style={{ color: "var(--accent)", opacity: 0.4, animation: "blink 0.8s infinite" }}>|</span>
        )}
      </div>
      <div
        className="flex items-center mt-0.5 relative z-10"
        style={{
          paddingLeft: size === "lg" ? "calc(100% - 18px)" : size === "md" ? "calc(100% - 10px)" : "calc(100% - 8px)",
        }}
      >
        <div
          className={`${s.dot} rounded-full`}
          style={{
            backgroundColor: "var(--accent)",
            opacity: step >= 3 ? 1 : 0,
            transform: step >= 3 ? "scale(1)" : "scale(0)",
            transition: "all 0.4s ease-out 0.1s",
          }}
        />
      </div>
    </div>
  );
}

export function CreatoeLogoInline() {
  return (
    <span className="text-sm font-light tracking-[-0.01em] select-none">
      <span style={{ color: "var(--text)" }}>Creato</span>
      <span className="relative" style={{ color: "var(--accent)" }}>
        e
        <span
          className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
          style={{ backgroundColor: "var(--accent)", opacity: 0.6 }}
        />
      </span>
    </span>
  );
}
