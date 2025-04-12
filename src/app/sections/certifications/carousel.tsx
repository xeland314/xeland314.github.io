"use client";

import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import CertificationCard from "./card";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Certification = {
  logo: string;
  title: string;
  issuer: string;
  issueDate: string;
  credentialId: string;
  credentialUrl: string;
  skills: string[];
};

interface CertificationCarouselProps {
  certifications: Certification[];
}

export default function CertificationCarousel({
  certifications,
}: CertificationCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
  });

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {certifications.map((cert, index) => (
            <div
              key={`${cert.title}-${index}`}
              className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.33%] pl-4"
            >
              <CertificationCard {...cert} />
            </div>
          ))}
        </div>
      </div>
      <button
        title="Anterior"
        type="button"
        className="absolute left-2 -bottom-4 z-10 bg-gray-800 dark:bg-gray-700 text-white p-2 rounded-full"
        onClick={scrollPrev}
      >
        <ChevronLeft />
      </button>
      <button
        title="Siguiente"
        type="button"
        className="absolute right-2 -bottom-4 z-10 bg-gray-800 dark:bg-gray-700 text-white p-2 rounded-full"
        onClick={scrollNext}
      >
        <ChevronRight />
      </button>
    </div>
  );
}
