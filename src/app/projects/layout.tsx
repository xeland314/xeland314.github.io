import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "../themes";
import { Footer, Header } from "@/app/components";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "xeland314 - Projects",
  description: "xeland314 projects created in the past",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <ThemeProvider>
        <body
          className={`${inter.className} bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100`}
        >
          <Header />
          <div className="container mx-auto pt-20 p-4">{children}</div>
          <Footer />
        </body>
      </ThemeProvider>
    </html>
  );
}
