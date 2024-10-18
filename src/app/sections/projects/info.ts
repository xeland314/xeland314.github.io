import { IProjectInfo } from "./components";

export const projects: IProjectInfo[] = [
    {
      title: "Tetris",
      description:
        "Un clásico juego de Tetris desarrollado en Java utilizando Swing. Este proyecto incluye características como niveles de dificultad, puntuaciones y una interfaz gráfica intuitiva.",
      shortDescription: "Juego de Tetris en Java con Swing.",
      githubLink: "https://github.com/xeland314/PoliTetris",
      demoLink: "https://github.com/xeland314/PoliTetris/releases",
      tags: ["Java", "Swing"],
      image: "/images/tetris.jpg",
    },
    {
      title: "Chat Analyzer",
      description:
        "Una herramienta de análisis de chats de WhatsApp desarrollada en Python. Utiliza NLTK para procesar el lenguaje natural y proporciona estadísticas detalladas sobre las conversaciones.",
      shortDescription: "Analiza chats de WhatsApp con Python.",
      githubLink: "https://github.com/xeland314/chat-analyzer",
      tags: ["Python", "WhatsApp", "NLTK", "CLI"],
    },
    {
      title: "Memory Game",
      description:
        "Un juego de memoria interactivo creado con HTML, CSS y JavaScript. Desafía a los jugadores a encontrar pares de cartas en el menor tiempo posible.",
      shortDescription: "Juego de memoria con HTML, CSS y JS.",
      githubLink: "https://github.com/xeland314/memory-game",
      demoLink: "https://xeland314.github.io/memory-game/",
      tags: ["HTML", "CSS", "JavaScript"],
      image: "/images/memorygame.jpg",
    },
    {
      title: "Encriptador de Texto",
      description:
        "Proyecto desarrollado como parte del reto Alura Latam. Este encriptador de texto permite cifrar y descifrar mensajes utilizando técnicas básicas de criptografía.",
      shortDescription: "Reto Alura Latam: Encriptador de texto.",
      githubLink: "https://github.com/xeland314/encriptador-de-texto",
      demoLink: "https://xeland314.github.io/encriptador-de-texto/",
      tags: ["HTML", "CSS", "JavaScript"],
      image: "/images/encriptador.jpg",
    },
  ];