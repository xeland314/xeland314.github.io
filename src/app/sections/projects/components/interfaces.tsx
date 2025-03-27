
export interface IProjectInfo {
  title: string;
  description: string;
  shortDescription: string;
  githubLink?: string;
  demoLink?: string;
  tags: string[];
  image?: string;
  creationDate?: string; // Fecha de creación del proyecto
  authors?: string[]; // Lista de autores del proyecto
  technologies?: string[]; // Tecnologías utilizadas en el proyecto
}
