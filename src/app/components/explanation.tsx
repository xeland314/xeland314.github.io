"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const NameAnimation = () => {
  const [step, setStep] = useState(0);
  const transformations = [
    {
      text: "alexander",
      description: "Mi nombre",
      subDescription: "El nombre completo antes de cualquier transformación",
    },
    {
      text: "alex → xela",
      description: "Se parte a la mitad y se voltea (palíndromo)",
      subDescription:
        "Esto crea un efecto de espejo en la primera parte del nombre",
    },
    {
      text: "xelaander",
      description: "Se une nuevamente",
      subDescription:
        "Recomponiendo las partes separadas y manteniendo el efecto",
    },
    {
      text: "xelandEr",
      description: "Mayúscula y se elimina la 'a' repetida",
      subDescription: "Un cambio en la estructura para mayor claridad",
    },
    {
      text: "xelandErA",
      description: "Se añade la 'a' borrada",
      subDescription:
        "Recuperamos la letra perdida para mantener el estilo original",
    },
    {
      text: "xelandErA",
      description: "Queda como xeland era, es decir, la era de xeland",
      subDescription:
        "El nombre se convierte en una representación de una nueva era",
    },
    {
      text: "xeland314",
      description: "ErA → 314",
      subDescription: "La adición de 314 da un toque técnico y matemático",
    },
  ];

  // Detectar teclas de navegación
  useEffect(() => {
    const handleKeyDown = (event: { key: string; }) => {
      if (event.key === "ArrowRight") {
        setStep((prev) => (prev + 1) % transformations.length);
      } else if (event.key === "ArrowLeft") {
        setStep(
          (prev) => (prev - 1 + transformations.length) % transformations.length
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center h-40 w-40 bg-gray-900 text-white">
      <motion.h1
        key={step}
        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
        transition={{ duration: 0.5 }}
        className="text-lg font-bold"
      >
        {transformations[step].text}
      </motion.h1>
      <motion.p
        key={step + 10}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="text-sm mt-2"
      >
        {transformations[step].description}
      </motion.p>
      <footer className="fixed bottom-0 w-full bg-gray-900 text-white py-2 flex justify-center gap-x-4 rounded-lg">
        <button
          onClick={() =>
            setStep(
              (prev) =>
                (prev - 1 + transformations.length) % transformations.length
            )
          }
          className="px-2 py-1 text-xs rounded-lg bg-blue-700"
        >
          Anterior
        </button>
        <button
          onClick={() => setStep((prev) => (prev + 1) % transformations.length)}
          className="px-2 py-1 text-xs rounded-lg bg-blue-700"
        >
          Siguiente
        </button>
      </footer>
    </div>
  );
};

export default NameAnimation;
