import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "../themes";
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
        <body className={inter.className}>{children}</body>
      </ThemeProvider>
    </html>
  );
}
