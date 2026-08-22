"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import type { TimelineEvent } from "@/lib/data/timeline";

interface TimelineSectionProps {
  timelineEvents: TimelineEvent[];
}

export const TimelineSection = ({ timelineEvents }: TimelineSectionProps) => {
  const [emblaTimeline] = useEmblaCarousel({ dragFree: true, align: "start" });

  return (
    <section className="py-20 md:py-40 bg-background overflow-hidden">
      <div className="px-6 md:px-8 mb-12 md:mb-20">
        <h2 className="text-4xl md:text-6xl font-serif italic text-center">Nossa Trajetória</h2>
      </div>
      <div className="px-6 md:px-8" ref={emblaTimeline}>
        <div className="flex gap-6 md:gap-8">
          {timelineEvents.map((event, i) => (
            <div key={i} className="flex-[0_0_280px] md:flex-[0_0_400px] group">
              <div className="text-6xl md:text-8xl font-serif italic text-stone-100 group-hover:text-primary/10 transition-colors mb-2 md:mb-4">
                {event.year}
              </div>
              <div className="relative p-6 md:p-10 bg-white border border-stone-100 rounded-[2rem] md:rounded-[3rem] shadow-xl shadow-stone-200/20 group-hover:-translate-y-4 transition-transform duration-500">
                <div className="relative w-full h-32 md:h-48 mb-6 md:mb-8 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    sizes="400px"
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                </div>
                <h4 className="font-serif italic text-2xl md:text-3xl mb-3 md:mb-4 text-foreground">
                  {event.title}
                </h4>
                <p className="text-stone-500 font-sans text-xs md:text-sm leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
