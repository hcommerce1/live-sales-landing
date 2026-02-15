import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    author: z.object({
      name: z.string(),
      role: z.string().optional(),
    }),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    lang: z.enum(['pl', 'en']).default('pl'),
  }),
});

export const collections = {
  blog: blogCollection,
};
