import React from "react";
import { ThemedImage } from "@/app/components";

const ProgrammingLanguages = () => {
  return (
    <section
      id="programming-languages"
      className="flex flex-col items-center mb-16 max-sm:pt-5"
    >
      <h3 className="scrolldown-animation-2 text-2xl font-bold mb-8">
        Lenguajes de Programación
      </h3>
      <div className="scrolldown-animation-2 flex text-center mb-4 items-center justify-center">
        <ThemedImage
          srcForLight="https://skillicons.dev/icons?i=py,java,c,go,dart,js,ts,html,css&perline=10&theme=light"
          srcForDark="https://skillicons.dev/icons?i=py,java,c,go,dart,js,ts,html,css&perline=10&theme=dark"
          alt="Programming languages"
          width="400"
          height="100"
        />
      </div>
      <div className="scrolldown-animation-2 pt-5 flex text-center mb-4 items-center justify-center border-0 border-white dark:border-gray-800">
        <ThemedImage
          srcForLight="https://github-readme-stats-git-main-xeland314s-projects.vercel.app/api/top-langs/?username=xeland314&theme=default&include_all_commits=true&exclude_repo=github-readme-stats,to-do-list-simple,Analizador-lexico,servichef_site&layout=compact&langs_count=10&hide=cmake,c%2B%2B,swift"
          srcForDark="https://github-readme-stats-git-main-xeland314s-projects.vercel.app/api/top-langs/?username=xeland314&theme=city_lights&include_all_commits=true&exclude_repo=github-readme-stats,to-do-list-simple,Analizador-lexico,servichef_site&layout=compact&langs_count=10&hide=cmake,c%2B%2B,swift"
          alt="Github Programming Languages Stats"
        />
      </div>
    </section>
  );
};

export default ProgrammingLanguages;
