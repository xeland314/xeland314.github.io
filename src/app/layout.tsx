import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Footer, Header } from "./components";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "xeland314",
  description: "xeland314 blog, portfolio and more...",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script src="https://www.google.com/recaptcha/enterprise.js?render=6LfI7IcqAAAAAGHi4AWFSAt0nZTKeFedhTku6-eD"></script>
      </head>
      <body className={`${inter.className} bg-white dark:bg-gray-800 text-black dark:text-white`}>
        <ThemeProvider attribute="data-mode">
          <Header />
          <div className="min-h-screen mx-auto p-1 pt-0">{children}</div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
