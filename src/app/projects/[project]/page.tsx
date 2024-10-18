// /projects/[project]/page.tsx

import ProjectPageClient from './projectPage';
import { projects } from '@/app/sections/projects/info';

export async function generateStaticParams() {
  return projects.map((project) => ({
    project: project.title.toLowerCase().replace(/\s+/g, "-"),
  }));
}

interface ProjectParams {
  project: string;
}


export default function ProjectPage({ params }: { params: ProjectParams }) {
  const projectData = projects.find((p) =>
    p.title.toLowerCase().replace(/\s+/g, "-").localeCompare(params.project) === 0
  );

  if (!projectData) {
    return <p>Proyecto no encontrado</p>;
  }

  return <ProjectPageClient projectData={projectData} />;
}
