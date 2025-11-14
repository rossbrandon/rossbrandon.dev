import { file, glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/pages' }),
  schema: z.object({
    title: z.string(),
    pageTitle: z.string(),
    date: z.date(),
    author: z.string(),
    tags: z.array(z.string()).optional(),
  }),
});

const posts = defineCollection({
  loader: glob({
    pattern: '*.md',
    base: './src/content/posts',
  }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    author: z.string(),
    pageTitle: z.string().optional(),
    pinned: z.boolean().optional().default(false),
    hidden: z.boolean().optional().default(false),
    categories: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const reading = defineCollection({
  loader: glob({
    pattern: '*.md',
    base: './src/content/reading',
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      author: z.string(),
      cover: image(),
      link: z.string(),
      tags: z.array(z.string()).optional(),
      order: z.number(),
      status: z.enum(['To Read', 'Reading', 'Finished']),
      finishedDate: z.date().optional(),
      notes: z.string().optional(),
    }),
});

export const collections = { pages, posts, reading };
