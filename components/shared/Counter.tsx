"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

interface CounterProps {
  value: number;
  label: string;
  suffix?: string;
}

const DURATION_MS = 1500;

export const Counter = ({ value, label, suffix = "" }: CounterProps) => {
  // Starts at the real final value — not 0 — so the correct number is what
  // renders on first paint regardless of whether JS ever runs, hydration
  // succeeds, or the IntersectionObserver below ever fires. The count-up
  // animation is a progressive enhancement layered on top, never the only
  // path to the right number.
  const [count, setCount] = useState(value);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 });
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!inView) return undefined;

    // `count` already starts at `value` — if motion is reduced, there's
    // nothing to do, the correct number is already showing.
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return undefined;

    // The reset to (near) 0 happens naturally on the first tick below
    // rather than via a synchronous setState here in the effect body.
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / DURATION_MS, 1);
      // Ease-out: fast start, settles into the final value smoothly.
      const eased = 1 - (1 - progress) ** 3;
      setCount(Math.round(eased * value));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== undefined) cancelAnimationFrame(frameRef.current);
    };
  }, [inView, value]);

  return (
    <div ref={ref} className="text-center group">
      <div className="text-6xl font-serif italic text-primary mb-2 transition-transform duration-500 group-hover:scale-110">
        {count}
        {suffix}
      </div>
      <div className="text-muted-foreground-on-dark font-sans uppercase tracking-[0.2em] text-[10px] font-bold">
        {label}
      </div>
    </div>
  );
};
