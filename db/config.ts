// astro:db/config.ts
import { defineDb, defineTable, column } from "astro:db";

export const Projects = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    title: column.text(),
    description: column.text(),
    shortDescription: column.text(),
    githubLink: column.text({ optional: true }),
    demoLink: column.text({ optional: true }),
    tags: column.json(),
    image: column.text({ optional: true }),
    slug: column.text({ unique: true }),
    isFeatured: column.boolean({ default: false }),
  },
});

export const MyCertificates = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    logo: column.text(),
    title: column.text(),
    issuer: column.text(),
    issueDate: column.text(),
    date: column.text(),
    credentialId: column.text(),
    credentialUrl: column.text(),
    skills: column.json(),
    isFeatured: column.boolean({ default: false }),
  },
});

export default defineDb({
  tables: { Projects, MyCertificates },
});
