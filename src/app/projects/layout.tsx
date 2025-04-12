import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Proyectos de Christopher Villamarín - xeland314",
  description: "Explora los proyectos creados por Christopher Villamarín, desarrollador backend especializado en soluciones escalables para aplicaciones web, móviles y de escritorio.",
  keywords: [
    "proyectos",
    "portafolio",
    "xeland314",
    "Christopher Villamarín",
    "desarrollo backend",
    "aplicaciones escalables",
    "django",
    "python",
    "Ecuador",
    "tecnología"
  ],
  authors: [
    { name: "Christopher Alexander Villamarín Pila" },
    { name: "xeland314" },
  ],
  creator: "xeland314",
  openGraph: {
    title: "Proyectos de Christopher Villamarín - xeland314",
    description: "Conoce más sobre los proyectos profesionales realizados por Christopher Villamarín, incluyendo desarrollo backend y aplicaciones innovadoras.",
    url: "https://xeland314.github.io/projects",
    type: "website",
    images: [
      {
        url: "https://xeland314.github.io/images/projects_preview.png",
        width: 1200,
        height: 630,
        alt: "Vista previa de proyectos de Christopher Villamarín",
      },
    ],
  },
  robots: "index, follow", // Asegura la indexación y rastreo
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen mx-auto p-4">{children}</div>
  );
}
