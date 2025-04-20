import Header from "./header";
import Footer from "./footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen mx-auto flex flex-col justify-between p-4">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
