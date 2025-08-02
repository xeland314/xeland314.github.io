import { db, Projects, MyCertificates } from "astro:db";
import { projectData } from "./projects";
import { certificates } from "./certificates";

export default async function seed() {
  await db.insert(Projects).values(projectData);
  await db.insert(MyCertificates).values(certificates);
}
