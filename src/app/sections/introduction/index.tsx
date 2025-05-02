"use client";

import { useState } from "react";
import { SocialNetworks } from "@/app/components";
import HeaderLink from "@/app/components/header/link";
import NameAnimation from "@/app/components/explanation";

export default function Introduction() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section
      id="inicio"
      className="h-full min-h-[92dvh] w-auto flex items-center justify-center"
    >
      <div className="container px-4 md:px-6 relative">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2 relative">
            {/* Tooltip activado en hover */}
            <div
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="relative inline-block"
            >
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none cursor-pointer">
                xeland314
              </h1>
              {isHovered && (
                <div
                  className="absolute left-1/2 top-full transform -translate-x-1/2 mt-3 p-3 bg-gray-900 rounded-lg z-20"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <NameAnimation />
                </div>
              )}
            </div>

            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-300">
              Backend Developer for web, mobile and desktop apps
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            <HeaderLink
              href="/#contact"
              className="inline-block px-6 py-2 text-white bg-blue-600 rounded-sm hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              children={"Contáctame"}
            />
            <HeaderLink
              href="/#projects"
              className="inline-block px-6 py-2 text-white bg-blue-600 rounded-sm hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              children={"Ver Proyectos"}
            />
          </div>
          <div className="pt-8">
            <SocialNetworks />
          </div>
        </div>
      </div>
    </section>
  );
}
