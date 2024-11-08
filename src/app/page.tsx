import AboutMe from "./about-me";
import { Footer, Header } from "./components";
import Introduction from "./sections/introduction";
import ProjectsSection from "./sections/projects/section";

export default function Home() {
  return (
    <div className="w-full min-h-screen">
      <Header />

      {/* Main Content */}
      <main className="flex-grow w-full mx-auto pt-8">
        <Introduction />
        <AboutMe />
        <ProjectsSection />
        <section id="blogs" className="mb-16 py-6 md:py-8 px-10">
          <h2 className="text-3xl font-bold">Blogs</h2>
          {/* Aquí puedes añadir tus entradas de blog */}
        </section>
      </main>
      <Footer />
    </div>
  );
}
