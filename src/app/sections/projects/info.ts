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
  {
    title: "Analizador-lexico",
    description:
      "Un analizador léxico que reconoce y recupera errores en las distintas etapas de compilación. Este proyecto destaca por su uso de expresiones regulares para reconocer sistemas numéricos, operadores aritméticos y funciones matemáticas.",
    shortDescription: "Analizador léxico para sistemas numéricos y operadores.",
    githubLink: "https://github.com/xeland314/Analizador-lexico",
    tags: ["C", "Compiladores", "Expresiones Regulares", "Golang"],
    image: "/images/analizador.png",
  },
  {
    title: "Speed Test",
    description:
      "Un script en Bash para medir el tiempo de ejecución de cualquier programa en Linux. Utiliza 'time' y 'awk' para calcular el tiempo real, de usuario y de sistema, además de la desviación estándar.",
    shortDescription: "Script en Bash para pruebas de velocidad en Linux.",
    githubLink: "https://github.com/xeland314/speedtest",
    tags: ["Bash", "Linux", "Performance", "AWK"],
  },
  {
    title: "freqtables",
    description:
      "Un paquete en Python para crear tablas de frecuencias simples e intervalos. Permite inicializar tablas con listas, tuplas o diccionarios y calcular estadísticas descriptivas.",
    shortDescription: "Paquete en Python para tablas de frecuencias.",
    githubLink: "https://github.com/xeland314/freqtables",
    tags: ["Python", "Estadísticas", "Tablas de Frecuencias"],
    image: "/images/freqtables.png",
  },
  {
    title: "objects-in-C",
    description:
      "Un proyecto basado en el libro 'Object-oriented Programming with Ansi-C' de Axel-Tobias Schreiner. Implementa conceptos de programación orientada a objetos en C, como encapsulamiento y herencia.",
    shortDescription: "Programación orientada a objetos en C.",
    githubLink: "https://github.com/xeland314/objects-in-C",
    tags: ["C", "OOP", "Encapsulamiento", "Strings"],
  },
  {
    title: "Conversor de Unidades",
    description:
      "Un conversor de unidades desarrollado para el Challenge #2 de Oracle Next Education. Permite convertir entre diferentes unidades de longitud, tiempo, temperatura y divisas con una interfaz gráfica sencilla.",
    shortDescription: "Conversor de unidades con interfaz gráfica en Java.",
    githubLink: "https://github.com/xeland314/conversor-de-unidades",
    tags: ["Java", "Swing", "Conversión de Unidades"],
    image: "/images/conversor.png",
  },
  {
    title: "Simplex",
    description:
      "Un proyecto en Python para resolver problemas de optimización utilizando el método simplex. Incluye ejemplos prácticos y una implementación en Jupyter Notebook.",
    shortDescription: "Optimización con el método simplex en Python.",
    githubLink: "https://github.com/xeland314/simplex",
    tags: ["Python", "Optimización", "Simplex"],
  },
];
