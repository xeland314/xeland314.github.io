import React from "react";
import LanguageGrid from "./languagesCategory";

const ProgrammingLanguages = () => {
  return (
    <section
      id="programming-languages"
      className="w-full flex flex-col items-center mb-6"
    >
      <div className="w-full scrolldown-animation-2 flex flex-col text-center items-center justify-center">
        <h3 className="pt-4 md:pt-0 scrolldown-animation-2 text-2xl font-bold mb-4">
          Tecnologías
        </h3>
        <LanguageGrid />
      </div>
    </section>
  );
};

export default ProgrammingLanguages;
