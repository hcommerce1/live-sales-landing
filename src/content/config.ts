import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date().refine(
      (d) => d <= new Date(new Date().toISOString().slice(0, 10) + 'T23:59:59Z'),
      { message: 'pubDate nie może być w przyszłości — użyj dzisiejszej daty' }
    ),
    updatedDate: z.date().optional(),
    lang: z.enum(['pl', 'en']),
    category: z.enum(['tutorial', 'case-study', 'guide', 'announcement']),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    ogImage: z.string().optional(),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
    // Dla przyszłych kalkulatorów embeddable w MDX
    calculators: z.array(z.enum(['roi', 'savings', 'integration', 'custom'])).optional(),
  }),
});

export const collections = {
  blog: blogCollection,
};
