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
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 });
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!inView) return undefined;

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
      <div className="text-stone-400 font-sans uppercase tracking-[0.2em] text-[10px] font-bold">
        {label}
      </div>
    </div>
  );
};
