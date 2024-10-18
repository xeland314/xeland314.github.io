import { Footer, Header } from "./components";
import Introduction from "./sections/introduction";
import ProjectsSection from "./sections/projects/section";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Main Content */}
      <main className="flex-grow mx-auto px-4 py-8">
        <Introduction />
        <ProjectsSection/>
        <section id="blogs" className="mb-16">
          <h2 className="text-3xl font-bold">Blogs</h2>
          {/* Aquí puedes añadir tus entradas de blog */}
        </section>

        <section id="acerca-de-mi" className="mb-16">
          <h2 className="text-3xl font-bold">Acerca de mí</h2>
          {/* Aquí puedes añadir información sobre ti */}
        </section>
      </main>

      <Footer/>
    </div>
  );
}
