import ProjectsPage from "./projects/page";
import AboutMe from "./sections/about-me";
import CertificationsSection from "./sections/certifications";
import { ContactSection } from "./sections/contact";
import Introduction from "./sections/introduction";

export default function Home() {
  return (
    <main className="flex-grow w-full mx-auto">
      <Introduction />
      <AboutMe />
      <CertificationsSection/>
      <ProjectsPage />
      <ContactSection/>
      <section id="blogs" className="mb-16 py-6 md:py-8 px-10">
        <h2 className="text-3xl font-bold">Blogs</h2>
        {/* Aquí puedes añadir tus entradas de blog */}
      </section>
    </main>
  );
}
