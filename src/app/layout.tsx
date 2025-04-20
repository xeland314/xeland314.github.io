import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Footer, Header } from "./components";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Christopher Villamarín - Backend Developer en Quito, Ecuador",
  description:
    "Descubre el portafolio de Christopher Villamarín, desarrollador backend especializado en crear soluciones escalables para aplicaciones web, móviles y de escritorio.",
  authors: [
    { name: "Christopher Alexander Villamarín Pila" },
    { name: "xeland314" },
  ],
  creator: "xeland314",
  keywords: [
    "programador",
    "desarrollador backend",
    "Python",
    "django",
    "django rest framework",
    "Quito",
    "Ecuador",
    "sistemas escalables",
    "portafolio profesional",
  ],
  applicationName: "Christopher Villamarín Portfolio",
  openGraph: {
    title: "Christopher Villamarín - Backend Developer",
    description:
      "Portafolio profesional de Christopher Villamarín. Experto en desarrollo backend para aplicaciones web, móviles y de escritorio.",
    url: "https://xeland314.github.io/",
    type: "website",
    images: [
      {
        url: "https://xeland314.github.io/images/preview.png",
        width: 1200,
        height: 630,
        alt: "Portafolio de Christopher Villamarín",
      },
    ],
  },
  metadataBase: new URL("https://xeland314.github.io"),
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="algolia-site-verification" content="839FA93308FEFD9D" />
        <script src="https://www.google.com/recaptcha/enterprise.js?render=6LfI7IcqAAAAAGHi4AWFSAt0nZTKeFedhTku6-eD"></script>
      </head>
      <body
        className={`${inter.className} bg-white dark:bg-gray-800 text-black dark:text-white`}
      >
        <ThemeProvider attribute="data-mode">
          <Header />
          <div className="min-h-screen mx-auto p-1 pt-0">{children}</div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
