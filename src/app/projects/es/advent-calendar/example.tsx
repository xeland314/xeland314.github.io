"use client";

import React from "react";

export default function AdventCalendarPreview() {
  return (
    <div className="p-0 py-4 sm:p-6 sm:py-0">
      <header className="mb-4 text-center">
        <a
          href="https://xeland314.github.io/advent-calendar/"
          target="_blank"
          className="text-blue-600 hover:text-blue-800"
        >
          <h1 className="text-3xl font-bold">
            Vista previa del Calendario de Adviento
          </h1>
        </a>
        <p className="text-gray-600 dark:text-white">
          ¡Experimenta cómo funciona!
        </p>
      </header>
      <div className="relative w-full h-96 border rounded-lg shadow-lg">
        <iframe
          src="https://xeland314.github.io/advent-calendar/"
          title="Advent Calendar Interactive Preview"
          className="w-full h-full rounded-lg border-none"
        ></iframe>
      </div>
    </div>
  );
}
