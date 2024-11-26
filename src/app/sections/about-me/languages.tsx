import React from "react";

const ProgrammingLanguages = () => {
  return (
    <section id="programming-languages" className="flex flex-col items-center mb-16">
      <h3 className="scrolldown-animation-2 text-2xl font-bold mb-8">Lenguajes de Programación</h3>
      <div className="scrolldown-animation-2 flex text-center mb-4 items-center justify-center">
        <picture>
          <source
            srcSet="https://skillicons.dev/icons?i=py,java,c,go,dart,js,ts,html,css&perline=10&theme=dark"
            media="(prefers-color-scheme: dark)"
          />
          <img
            src="https://skillicons.dev/icons?i=py,java,c,go,dart,js,ts,html,css&perline=10&theme=light"
            alt="Programming languages"
            width="400"
            height="100"
          />
        </picture>
      </div>
      <div className="scrolldown-animation-2 flex text-center mb-4 items-center justify-center">
        <picture>
          <source
            srcSet="https://github-readme-stats-git-main-xeland314s-projects.vercel.app/api/top-langs/?username=xeland314&theme=city_lights&include_all_commits=true&exclude_repo=github-readme-stats,to-do-list-simple,Analizador-lexico,servichef_site&layout=compact&langs_count=10&hide=cmake,c%2B%2B,swift"
            media="(prefers-color-scheme: dark)"
          />
          <source
            srcSet="https://github-readme-stats-git-main-xeland314s-projects.vercel.app/api/top-langs/?username=xeland314&theme=default&include_all_commits=true&exclude_repo=github-readme-stats,to-do-list-simple,Analizador-lexico,servichef_site&layout=compact&langs_count=10&hide=cmake,c%2B%2B,swift"
            media="(prefers-color-scheme: light), (prefers-color-scheme: no-preference)"
          />
          <img
            src="https://github-readme-stats-git-main-xeland314s-projects.vercel.app/api/top-langs/?username=xeland314&theme=default&include_all_commits=true&exclude_repo=github-readme-stats,to-do-list-simple,Analizador-lexico,servichef_site&layout=compact&langs_count=10&hide=cmake,c%2B%2B,swift#gh-light-mode-only"
            alt="Github Programming Languages Stats"
          />
        </picture>
      </div>
    </section>
  );
};

export default ProgrammingLanguages;
