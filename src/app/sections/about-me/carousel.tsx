"use client";

import React, { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function Carousel({ children }: { children: React.ReactNode }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="relative w-full">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex w-80">
          {React.Children.map(children, (child, index) => (
            <div
              key={index}
              className="flex-[0_0_33.33%] min-w-0"
            >
              {child}
            </div>
          ))}
        </div>
      </div>
      <button
        title="Anterior"
        type="button"
        className="absolute -left-4 bottom-7 z-10 bg-gray-800 dark:bg-gray-700 text-white p-2 rounded-full"
        onClick={scrollPrev}
      >
        <ChevronLeft />
      </button>
      <button
        title="Siguiente"
        type="button"
        className="absolute -right-4 bottom-7 z-10 bg-gray-800 dark:bg-gray-700 text-white p-2 rounded-full"
        onClick={scrollNext}
      >
        <ChevronRight />
      </button>
    </div>
  );
}

export default Carousel;
