// /projects/[project]/page.tsx

import { notFound } from "next/navigation";
import ProjectPageClient from "./projectPage";
import { projects } from "@/app/sections/projects/info";

export async function generateStaticParams() {
  return projects.map((project) => ({
    project: project.title.toLowerCase().replace(/\s+/g, "-"),
  }));
}

interface ProjectParams {
  project: string;
}

export default function ProjectPage({ params }: { params: ProjectParams }) {
  const normalizeTitle = (title: string) =>
    title.toLowerCase().replace(/\s+/g, "-");
  const projectData = projects.find(
    (p) => normalizeTitle(p.title) === params.project
  );

  if (!projectData) {
    console.error(`Error: El proyecto '${params.project}' no existe.`);
    notFound();
  }

  return <ProjectPageClient projectData={projectData} />;
}
