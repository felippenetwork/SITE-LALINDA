"use client";

import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";

interface CounterProps {
  value: number;
  label: string;
  suffix?: string;
}

export const Counter = ({ value, label, suffix = "" }: CounterProps) => {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 });

  useEffect(() => {
    if (inView) {
      let start = 0;
      const duration = 2000;
      const stepTime = Math.abs(Math.floor(duration / value));
      const timer = setInterval(() => {
        start += 1;
        if (start >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, stepTime);
      return () => clearInterval(timer);
    }
    return undefined;
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
