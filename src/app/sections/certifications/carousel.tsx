"use client";

import React, { useEffect, useState } from "react";
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
    loop: true,
    align: "start",
  });
  const [currentIndex, setCurrentIndex] = useState(0); // Estado para el índice actual

  // Actualiza el índice actual al cambiar el slide visible
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setCurrentIndex(emblaApi.selectedScrollSnap()); // Actualiza el índice
    };

    emblaApi.on("select", onSelect); // Evento de selección
    onSelect(); // Ajuste inicial

    return () => {
      emblaApi.off("select", onSelect); // Limpia el evento
    };
  }, [emblaApi]);

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="relative scrolldown-animation-2">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {certifications.map((cert, index) => (
            <div
              key={`${cert.title}-${index}-${cert.credentialId}`}
              className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.33%] pl-4"
            >
              <CertificationCard {...cert} />
            </div>
          ))}
        </div>
      </div>
      {/* Botón de navegación izquierda */}
      <button
        title="Anterior"
        type="button"
        className="absolute left-2 -bottom-15 z-10 bg-gray-800 dark:bg-gray-700 text-white p-2 rounded-full"
        onClick={scrollPrev}
      >
        <ChevronLeft />
      </button>
      {/* Contador de certificados */}
      <div className="absolute left-1/2 -bottom-15 z-10 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-600 text-white px-4 py-2 rounded-lg shadow-sm text-center">
        Certificado {currentIndex + 1} de {certifications.length}
      </div>
      {/* Botón de navegación derecha */}
      <button
        title="Siguiente"
        type="button"
        className="absolute right-2 -bottom-15 z-10 bg-gray-800 dark:bg-gray-700 text-white p-2 rounded-full"
        onClick={scrollNext}
      >
        <ChevronRight />
      </button>
    </div>
  );
}
