import CertificationCarousel from "./carousel";

const certifications = [
  {
    logo: "/images/efset.svg",
    title: "EF SET English Certificate C1 Advanced",
    issuer: "EF SET",
    issueDate: "2 de noviembre de 2022",
    credentialId: "Y3rZtp",
    credentialUrl: "https://cert.efset.org/Y3rZtp?cid=em100a",
    skills: ["English", "C1 Advanced"],
  },
  {
    logo: "/images/alura_latam_logo.jpeg",
    title: "Programa Oracle Next Education F2 T4 Back-end",
    issuer: "Alura Latam",
    issueDate: "12 de junio de 2023",
    credentialId: "ef287555-cb92-4c6b-8ab7-1d455047cb23",
    credentialUrl:
      "https://app.aluracursos.com/program/certificate/ef287555-cb92-4c6b-8ab7-1d455047cb23?lang",
    skills: ["Backend"],
  },
  {
    logo: "/images/alura_latam_logo.jpeg",
    title: "Java Web",
    issuer: "Alura Latam",
    issueDate: "12 de junio de 2023",
    credentialId: "370d5111-da66-4348-a539-e5170ea8b3d4",
    credentialUrl:
      "https://app.aluracursos.com/degree/certificate/370d5111-da66-4348-a539-e5170ea8b3d4?lang",
    skills: ["Java Servlet", "MVC"],
  },
  {
    logo: "/images/alura_latam_logo.jpeg",
    title: "Principiante en Programación G4 - ONE",
    issuer: "Alura Latam",
    issueDate: "27 de enero de 2023",
    credentialId: "d62eeadc-62b9-4ded-bd29-8f019e727e53",
    credentialUrl:
      "https://app.aluracursos.com/degree/certificate/d62eeadc-62b9-4ded-bd29-8f019e727e53?lang",
    skills: ["HTML", "CSS", "JavaScript", "Git", "GitHub"],
  },
  {
    logo: "/images/alura_latam_logo.jpeg",
    title: "Formación Desarrollo Personal G4 - ONE",
    issuer: "Alura Latam",
    issueDate: "01 de marzo de 2023",
    credentialId: "872af483-f457-44a4-a2c0-449d2f40635f",
    credentialUrl:
      "https://app.aluracursos.com/degree/certificate/872af483-f457-44a4-a2c0-449d2f40635f",
    skills: ["Linkedin", "Enfoque", "Productividad", "Hábitos"],
  },
  {
    logo: "/images/alura_latam_logo.jpeg",
    title: "Formación Java Orientado a Objetos G4 - ONE",
    issuer: "Alura Latam",
    issueDate: "09 de abril de 2023",
    credentialId: "b1cbca66-ead1-4041-bf05-6635d213eb47",
    credentialUrl:
      "https://app.aluracursos.com/degree/certificate/b1cbca66-ead1-4041-bf05-6635d213eb47",
    skills: ["Java", "POO"],
  },
  {
    logo: "/images/alura_latam_logo.jpeg",
    title: "Formación Business Agility G4 - ONE",
    issuer: "Alura Latam",
    issueDate: "26 de abril de 2023",
    credentialId: "f30ed67f-fda6-4414-968c-90569e209d88",
    credentialUrl:
      "https://app.aluracursos.com/degree/certificate/f30ed67f-fda6-4414-968c-90569e209d88",
    skills: ["Gestión", "Agilidad", "Empresas"],
  },
  {
    logo: "/images/alura_latam_logo.jpeg",
    title: "Emprendimiento G4 - ONE",
    issuer: "Alura Latam",
    issueDate: "24 de mayo de 2023",
    credentialId: "58af505b-52ed-4db8-96cb-e004c4206274",
    credentialUrl:
      "https://app.aluracursos.com/degree/certificate/58af505b-52ed-4db8-96cb-e004c4206274?lang",
    skills: ["Emprendimiento", "Innovación", "Bussiness Model Canvas"],
  },

  {
    logo: "/images/alura_latam_logo.jpeg",
    title: "Java y Spring Boot G4 - ONE",
    issuer: "Alura Latam",
    issueDate: "12 de junio de 2023",
    credentialId: "7e24baa4-983c-4fd0-bda2-93bed060da9c",
    credentialUrl:
      "https://app.aluracursos.com/degree/certificate/7e24baa4-983c-4fd0-bda2-93bed060da9c?lang",
    skills: ["Spring Boot", "Java"],
  },
  {
    logo: "/images/alura_latam_logo.jpeg",
    title: "Formación Integre aplicaciones Java con Base de datos",
    issuer: "Alura Latam",
    issueDate: "11 de junio de 2023",
    credentialId: "bd89b003-7193-434d-8056-1f38f66cefd1",
    credentialUrl:
      "https://app.aluracursos.com/degree/certificate/bd89b003-7193-434d-8056-1f38f66cefd1?lang",
    skills: ["Spring Boot", "Java"],
  },

  {
    logo: "/images/microsoft_logo.jpeg",
    title: "Introducción al control de versiones con Git",
    issuer: "Microsoft",
    issueDate: "Marzo de 2023",
    credentialId: "A342BA23E2F906B1",
    credentialUrl:
      "https://learn.microsoft.com/es-es/training/achievements/learn.student-evangelism.intro-to-vc-git.trophy?username=christopher-villamarin&sharingId=A342BA23E2F906B1",
    skills: ["Git", "GitHub"],
  },
  {
    logo: "/images/microsoft_logo.jpeg",
    title: "Introducción a las consultas con Transact-SQL",
    issuer: "Microsoft",
    issueDate: "Marzo de 2023",
    credentialId: "A342BA23E2F906B1",
    credentialUrl:
      "https://learn.microsoft.com/es-es/training/achievements/learn.wwl.get-started-querying-with-transact-sql.trophy?username=christopher-villamarin&sharingId=A342BA23E2F906B1",
    skills: ["SQL"],
  },
];

export default function CertificationsSection() {
  return (
    <section id="certifications" className="md:px-10 px-2 mb-16 mt-5">
      <h2 className="text-3xl text-center font-bold mb-4 scrolldown-animation-2">
        Certificaciones
      </h2>
      <hr className="pb-[1px] mb-4 scrolldown-animation-2 bg-gray-800 dark:bg-white" />
      <CertificationCarousel certifications={certifications} />
    </section>
  );
}
