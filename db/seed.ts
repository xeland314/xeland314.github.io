import { db, Projects, MyCertificates } from "astro:db";
import { projectData } from "./projects";
import { certificates } from "./certificates";
import { certificatesEN } from "./certificates.en";
import { projectDataEN } from "./projects.en";

export default async function seed() {
  await db.insert(Projects).values(projectData);
  await db.insert(MyCertificates).values(certificates);
  await db.insert(MyCertificates).values(certificatesEN);
  await db.insert(Projects).values(projectDataEN);
}
