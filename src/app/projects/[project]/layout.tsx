// /projects/[project]/layout.tsx

import type { Metadata } from "next";
import "../../globals.css";
import { ThemeProvider } from "../../themes";

export const metadata: Metadata = {
  title: "xeland314 - Projects",
  description: "xeland314 projects created in the past",
};

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <ThemeProvider>
        <body className="bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
          <div className="container mx-auto p-4">{children}</div>
        </body>
      </ThemeProvider>
    </html>
  );
}
