import { defineCollection, z } from 'astro:content';
import { Image } from 'astro:assets';

const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.string(),
    updatedDate: z.string().optional(),
    heroImage: Image().optional(),
  }),
});

export const collections = {
  'blog': blog,
};