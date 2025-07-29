// astro:db/config.ts
import { defineDb, defineTable, column } from 'astro:db';

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
    isFeatured: column.boolean({ default: false })
  }
});

export default defineDb({
  tables: { Projects }
});
