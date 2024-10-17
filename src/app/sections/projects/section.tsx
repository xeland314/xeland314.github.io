import { Github, OpenLink } from "@/app/icons";
import React from "react";

interface IProjectInfo {
  title: string;
  description: string;
  shortDescription: string;
  githubLink?: string;
  demoLink?: string;
  tags: string[];
  image?: string;
}

export function ProjectCard({ project }: { project: IProjectInfo }) {
  return (
    <div className="rounded-lg shadow-md overflow-hidden">
      {project.image && (
        <img
          className="w-full h-48 object-cover"
          src={project.image}
          alt={project.title}
        />
      )}
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2">{project.title}</h3>
        <p
          className="text-gray
-600 text-sm mb-2"
        >
          {project.shortDescription}
        </p>
        <div className="flex flex-wrap gap-2 mb-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="bg-gray-200 text-gray-700 rounded-full px-2 py-1 text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          {project.githubLink && (
            <a
              href={project.githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-row bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              <span>{"Repo "}</span>
              <Github />
            </a>
          )}
          {project.demoLink && (
            <a
              href={project.demoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-row bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              <span>Demo</span>
              <OpenLink />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProjectsSection() {
  const projects: IProjectInfo[] = [
    {
      title: "Tetris",
      description: "Un clásico juego de Tetris desarrollado en Java utilizando Swing. Este proyecto incluye características como niveles de dificultad, puntuaciones y una interfaz gráfica intuitiva.",
      shortDescription: "Juego de Tetris en Java con Swing.",
      githubLink: "https://github.com/xeland314/PoliTetris",
      demoLink: "https://github.com/xeland314/PoliTetris/releases",
      tags: ["Java", "Swing"],
      image: "/images/tetris.jpg",
    },
    {
      title: "Chat Analyzer",
      description: "Una herramienta de análisis de chats de WhatsApp desarrollada en Python. Utiliza NLTK para procesar el lenguaje natural y proporciona estadísticas detalladas sobre las conversaciones.",
      shortDescription: "Analiza chats de WhatsApp con Python.",
      githubLink: "https://github.com/xeland314/chat-analyzer",
      tags: ["Python", "WhatsApp", "NLTK", "CLI"],
    },
    {
      title: "Memory Game",
      description: "Un juego de memoria interactivo creado con HTML, CSS y JavaScript. Desafía a los jugadores a encontrar pares de cartas en el menor tiempo posible.",
      shortDescription: "Juego de memoria con HTML, CSS y JS.",
      githubLink: "https://github.com/xeland314/memory-game",
      demoLink: "https://xeland314.github.io/memory-game/",
      tags: ["HTML", "CSS", "JavaScript"],
      image: "/images/memorygame.jpg",
    },
    {
      title: "Encriptador de Texto",
      description: "Proyecto desarrollado como parte del reto Alura Latam. Este encriptador de texto permite cifrar y descifrar mensajes utilizando técnicas básicas de criptografía.",
      shortDescription: "Reto Alura Latam: Encriptador de texto.",
      githubLink: "https://github.com/xeland314/encriptador-de-texto",
      demoLink: "https://xeland314.github.io/encriptador-de-texto/",
      tags: ["HTML", "CSS", "JavaScript"],
      image: "/images/encriptador.jpg",
    },
  ];  

  return (
    <section id="proyectos" className="mb-16">
      <h2 className="text-3xl font-bold mb-8">Proyectos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </section>
  );
}
