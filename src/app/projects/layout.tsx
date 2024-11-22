import type { Metadata } from "next";
import "../globals.css";

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
    <div className="container min-h-screen mx-auto p-4">{children}</div>
  );
}
