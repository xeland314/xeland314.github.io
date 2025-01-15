import React from "react";
import LanguageGrid from "./languagesGrid";


const ProgrammingLanguages = () => {
  return (
    <section
      id="programming-languages"
      className="flex flex-col items-center mb-16 max-sm:pt-5"
    >
      <h3 className="scrolldown-animation-2 text-2xl font-bold mb-4">
        Tecnologías
      </h3>
      <div className="scrolldown-animation-2 flex flex-col text-center items-center justify-center">
        <LanguageGrid />
      </div>
    </section>
  );
};

export default ProgrammingLanguages;
