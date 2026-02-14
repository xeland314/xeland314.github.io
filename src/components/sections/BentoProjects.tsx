import React, { useState } from 'react';

interface Project {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  image?: string;
  tags: string[];
  githubLink?: string;
  demoLink?: string;
}

interface Props {
  projects: Project[];
  lang: 'es' | 'en';
}

const BentoProjects: React.FC<Props> = ({ projects, lang }) => {
  const [index, setIndex] = useState(0);

  if (!projects || projects.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
        <p className="text-gray-400 text-xs">No projects available</p>
      </div>
    );
  }

  const next = () => setIndex((i) => (i + 1) % projects.length);
  const prev = () => setIndex((i) => (i - 1 + projects.length) % projects.length);

  const p = projects[index];
  // Slugs in projectDataEN already include 'en/projects/'
  // Slugs in projectData (ES) are just the name
  const detailsLink = lang === 'es' ? `/es/projects/${p.slug}` : `/${p.slug}`;

  return (
    <div className="relative h-full flex flex-col bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm group">
      {/* Header with See all link */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
         <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/90 drop-shadow-md">
            {lang === 'es' ? 'Proyectos' : 'Projects'}
         </h3>
         <a 
            href={lang === 'es' ? '/es/projects' : '/en/projects'} 
            className="pointer-events-auto text-[9px] font-bold text-white/80 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full transition-all flex items-center gap-1"
         >
            {lang === 'es' ? 'Ver todos' : 'See all'}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
         </a>
      </div>

      <div className="relative h-64 overflow-hidden bg-gray-100 dark:bg-gray-900">
        {p.image ? (
          <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" width={"256"} height={"256"} />
        ) : (
          <div className="flex items-center justify-center h-full text-[10px] uppercase text-gray-400 font-mono tracking-tighter">No preview available</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent"></div>
        <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
          <h3 className="text-white font-bold text-base leading-tight truncate mr-2">{p.title}</h3>
          <span className="text-blue-300 text-[9px] font-mono font-bold bg-blue-900/40 px-1.5 py-0.5 rounded-full">{index + 1} / {projects.length}</span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow justify-between">
        <p className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
          {p.shortDescription || p.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-3">
            <a href={detailsLink} className="text-[10px] uppercase tracking-widest font-bold text-blue-600 dark:text-blue-400 hover:underline">
              {lang === 'es' ? 'Detalles' : 'Details'}
            </a>
            
            <div className="flex gap-2 border-l border-gray-100 dark:border-gray-700 pl-3">
                {p.githubLink && (
                  <a href={p.githubLink} target="_blank" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" title="GitHub">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>
                  </a>
                )}
                {p.demoLink && (
                   <a href={p.demoLink} target="_blank" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" title="Demo">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  </a>
                )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={prev}
              aria-label="Previous project"
              className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              onClick={next}
              aria-label="Next project"
              className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BentoProjects;
