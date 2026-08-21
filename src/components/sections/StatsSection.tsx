import { Counter } from "@/components/shared/Counter";

export const StatsSection = () => {
  return (
    <section className="py-20 md:py-40 bg-stone-900 border-y border-white/5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]"></div>
      <div className="container mx-auto px-6 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24 relative z-10">
        <Counter value={500} label="Mãos Artesãs" suffix="+" />
        <Counter value={120} label="Frota Dedicada" suffix="+" />
        <Counter value={2000} label="Clientes Atendidos" suffix="+" />
      </div>
    </section>
  );
};
