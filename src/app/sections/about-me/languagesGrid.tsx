"use client";

import React, { useState } from "react";
import LanguageImage from "@/app/components/languages";

function Carousel({ children }: { children: React.ReactNode }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? React.Children.count(children) - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === React.Children.count(children) - 1 ? 0 : prevIndex + 1
    );
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = startX - e.clientX;
    if (diff > 50) {
      handleNext();
      setIsDragging(false);
    } else if (diff < -50) {
      handlePrev();
      setIsDragging(false);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="relative w-full h-20"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="flex w-80 items-center justify-center space-x-4">
        {React.Children.map(children, (child, index) => (
          <>
            <div
              className={`flex-shrink-0 items-center justify-center transition-transform duration-300 ease-in-out px-4 ${
                index === currentIndex ? "block" : "hidden"
              }`}
            >
              {child}
            </div>
            <div
              className={`flex-shrink-0 transition-transform duration-300 ease-in-out ${
                index + 1 === currentIndex ? "block" : "hidden"
              }`}
            >
              {child}
            </div>
          </>
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between space-x-2 py-2">
        <button
          className="bg-gray-800 dark:bg-gray-200 text-white dark:text-black p-2 font-light text-xs rounded-md"
          onClick={handlePrev}
        >
          Prev
        </button>
        <button
          className="bg-gray-800 dark:bg-gray-200 text-white dark:text-black p-2 font-light text-xs rounded-md"
          onClick={handleNext}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function FrontendRow() {
  return (
    <div className="p-4 bg-gray-200 dark:bg-gray-700">
      <div className="mb-4">
        <h4 className="text-xl font-bold text-center">Frontend</h4>
      </div>
      <Carousel>
        <LanguageImage title="React" image="react" />
        <LanguageImage title="Next.js" image="nextjs" />
        <LanguageImage title="JavaScript" image="js" />
        <LanguageImage title="TypeScript" image="ts" />
        <LanguageImage title="TailwindCss" image="tailwind" />
        <LanguageImage title="HTML" image="html" />
        <LanguageImage title="CSS" image="css" />
      </Carousel>
    </div>
  );
}

function BackendRow() {
  return (
    <div className="p-4 bg-white dark:bg-gray-800">
      <div className="mb-4">
        <h4 className="text-xl font-bold text-center">Backend</h4>
      </div>
      <Carousel>
        <LanguageImage title="Python" image="py" />
        <LanguageImage title="Django" image="django" />
        <LanguageImage title="Sqlite" image="sqlite" />
        <LanguageImage title="Postgres" image="postgres" />
        <LanguageImage title="Bash" image="bash" />
        <LanguageImage title="Nginx" image="nginx" />
        <LanguageImage title="Git" image="git" />
      </Carousel>
    </div>
  );
}

function CloudRow() {
  return (
    <div className="p-4 bg-gray-200 dark:bg-gray-700">
      <div className="mb-4">
        <h4 className="text-xl font-bold text-center">Cloud</h4>
      </div>
      <Carousel>
        <LanguageImage title="AWS" image="aws" />
        <LanguageImage title="Cloudflare" image="cloudflare" />
        <LanguageImage title="Linux" image="linux" />
        <LanguageImage title="Debian" image="debian" />
        <LanguageImage title="Ubuntu" image="ubuntu" />
      </Carousel>
    </div>
  );
}

export default function LanguageGrid() {
  return (
    <div className="w-full overflow-x-auto">
      <FrontendRow />
      <BackendRow />
      <CloudRow />
    </div>
  );
}
