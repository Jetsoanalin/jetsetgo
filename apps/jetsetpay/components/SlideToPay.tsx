"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export function SlideToPay({ label = "Slide to Pay →", onComplete, disabled = false }: { label?: string; onComplete: () => void | Promise<void>; disabled?: boolean }) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0); // 0..1
  const [dragging, setDragging] = useState(false);
  const [success, setSuccess] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    function onMove(e: PointerEvent) {
      if (!dragging || !trackRef.current || success) return;
      const rect = trackRef.current.getBoundingClientRect();
      let x = e.clientX - rect.left;
      x = Math.max(0, Math.min(rect.width, x));
      setProgress(x / rect.width);
      e.preventDefault();
    }
    function onUp() {
      if (!dragging) return;
      setDragging(false);
      setProgress((p) => {
        if (p > 0.95 && !completedRef.current) {
          completedRef.current = true;
          setSuccess(true);
          // Defer parent callback to next tick to avoid setState during render warnings
          setTimeout(() => {
            Promise.resolve(onComplete()).finally(() => setTimeout(() => { setSuccess(false); setProgress(0); completedRef.current = false; }, 800));
          }, 0);
          return 1;
        }
        return 0; // snap back
      });
    }
    window.addEventListener('pointermove', onMove as any, { passive: false } as any);
    window.addEventListener('pointerup', onUp as any);
    window.addEventListener('pointercancel', onUp as any);
    return () => {
      window.removeEventListener('pointermove', onMove as any);
      window.removeEventListener('pointerup', onUp as any);
      window.removeEventListener('pointercancel', onUp as any);
    };
  }, [dragging, onComplete, success]);

  const onDown = useCallback((e: React.PointerEvent) => {
    if (disabled || success) return;
    setDragging(true);
    (e.target as Element).setPointerCapture?.(e.pointerId);
    e.preventDefault();
  }, [disabled, success]);

  // Keep knob fully visible at start (offset 6px)
  const knobLeft = `calc(${progress * 100}% - 18px + 6px)`; // knob 36px radius visible

  return (
    <div ref={trackRef} className={`relative h-14 rounded-full border ${disabled ? 'opacity-60' : ''} ${success ? 'border-emerald-500' : 'border-neutral-800'} ${success ? 'bg-emerald-600/20' : 'bg-neutral-900'} overflow-hidden select-none touch-none`}>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className={`font-semibold text-lg ${success ? 'text-white' : 'text-white'}`} style={{ opacity: success ? 1 : 1 - progress }}>{success ? 'Paid' : label}</span>
      </div>
      <div className={`absolute inset-y-0 left-0 ${success ? 'bg-emerald-500' : 'bg-blue-600'} transition-[width,background]`} style={{ width: `${Math.max(progress * 100, dragging ? progress * 100 : 0)}%` }} />
      <div
        role="button"
        aria-label={label}
        onPointerDown={onDown}
        className={`absolute top-1/2 -translate-y-1/2 h-12 w-12 rounded-full grid place-items-center shadow-xl cursor-pointer touch-none ${success ? 'bg-emerald-500 text-white' : 'bg-white text-black'}`}
        style={{ left: knobLeft, transition: dragging ? 'none' : 'left 300ms ease, background 300ms ease' }}
      >
        {success ? '✓' : '➜'}
      </div>
    </div>
  );
} 