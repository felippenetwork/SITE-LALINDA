import { Counter } from "@/components/shared/Counter";
import type { HomeStat } from "@/lib/data/site-settings";

interface StatsSectionProps {
  stats: [HomeStat, HomeStat, HomeStat];
}

export const StatsSection = ({ stats }: StatsSectionProps) => {
  return (
    <section className="py-20 md:py-40 bg-foreground border-y border-white/5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]"></div>
      <div className="container mx-auto px-6 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24 relative z-10">
        {stats.map((stat, index) => (
          <Counter key={index} value={stat.value} label={stat.label} suffix="+" />
        ))}
      </div>
    </section>
  );
};
