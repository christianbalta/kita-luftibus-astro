import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.string(), // Keep as string
    updatedDate: z.string().optional(),
    heroImage: z.string().optional(),
  }),
});

export const collections = {
  blog: blog,
};