"use client";
import { ReactNode } from "react";

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="px-6 pt-10 pb-12 bg-gradient-to-b from-neutral-900 to-neutral-950">
      <h1 className="text-3xl font-bold text-white">{title}</h1>
      {subtitle && <p className="mt-2 text-neutral-400">{subtitle}</p>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-neutral-800 bg-neutral-950 p-6 ${className}`}>{children}</div>
  );
} 