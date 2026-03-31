import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

export function formatCurrency(min: number, max: number): string {
  const fmt = (n: number) => {
    if (n >= 100_000) return `${(n / 100_000).toFixed(1)}L`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return `₹${n}`;
  };
  return `₹${fmt(min)} - ₹${fmt(max)}`;
}

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
