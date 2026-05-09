import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { defineCollection } from 'astro:content';

const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/pages' }),
  schema: z.object({
    title: z.string(),
    pageTitle: z.string(),
    description: z.string().optional(),
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
    description: z.string().optional(),
    date: z.date(),
    author: z.string(),
    pageTitle: z.string().optional(),
    pinned: z.boolean().optional().default(false),
    hidden: z.boolean().optional().default(false),
    categories: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const projects = defineCollection({
  loader: glob({
    pattern: '*.md',
    base: './src/content/projects',
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      category: z.enum(['professional', 'personal']),
      year: z.number(),
      role: z.string(),
      tech: z.array(z.string()),
      cover: image(),
      hidden: z.boolean().default(false),
      links: z
        .object({
          repo: z.string().optional(),
          repoFrontend: z.string().optional(),
          repoBackend: z.string().optional(),
          site: z.string().optional(),
          docs: z.string().optional(),
        })
        .optional(),
      posts: z.array(z.string()).optional(),
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
      status: z.enum(['To Read', 'Reading', 'Finished']),
      finishedDate: z.date().optional(),
      notes: z.string().optional(),
      hidden: z.boolean().optional().default(false),
    }),
});

export const collections = { pages, posts, projects, reading };
