import ProjectsPage from "./projects/page";
import AboutMe from "./sections/about-me";
import BlogsIndex from "./sections/blogs";
import CertificationsSection from "./sections/certifications";
import { ContactSection } from "./sections/contact";
import Introduction from "./sections/introduction";

export default function Home() {
  return (
    <main className="grow w-full mx-auto">
      <Introduction />
      <AboutMe />
      <CertificationsSection/>
      <ProjectsPage />
      <ContactSection/>
      <BlogsIndex />
    </main>
  );
}
