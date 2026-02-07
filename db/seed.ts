import { db, Projects, MyCertificates, Posts } from "astro:db";
import { projectData } from "./projects";
import { certificates } from "./certificates";
import { certificatesEN } from "./certificates.en";
import { projectDataEN } from "./projects.en";
import { postData } from "./posts";
import { postDataEN } from "./posts.en";

export default async function seed() {
  await db.insert(Projects).values(projectData);
  await db.insert(MyCertificates).values(certificates);
  await db.insert(MyCertificates).values(certificatesEN);
  await db.insert(Projects).values(projectDataEN);
  await db.insert(Posts).values(postData);
  await db.insert(Posts).values(postDataEN);
}
