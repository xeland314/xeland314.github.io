"use client";

import { useRouter } from "next/navigation";
import { projects } from "@/app/sections/projects/info";
import { ArrowUp, ArrowRight } from "lucide-react";

export default function Footer() {
  const router = useRouter();

  const getRandomProject = () => {
    const randomIndex = Math.floor(Math.random() * projects.length);
    return projects[randomIndex];
  };

  const handleNextArticle = () => {
    const nextProject = getRandomProject();
    if (nextProject?.links?.[0]) router.replace(`${nextProject.links[0]}`);
  };

  return (
    <footer className="flex justify-between items-center bg-gray-200 dark:bg-gray-800 p-4 rounded-sm mt-4">
      <button
        className="flex flex-row items-center bg-gray-200 py-2 sm:px-4 rounded-sm hover:text-blue-700 dark:bg-gray-800 dark:hover:bg-text-600"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        title="Read it again"
      >
        <ArrowUp className="mr-2 hidden sm:block" size={24} />
        Read it again
      </button>
      <button
        className="flex flex-row items-center bg-blue-500 text-white py-2 sm:px-4 rounded-sm hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
        onClick={handleNextArticle}
        title="Next project"
      >
        Next project
        <ArrowRight className="ml-2 text-white hidden sm:block" size={24} />
      </button>
    </footer>
  );
}
