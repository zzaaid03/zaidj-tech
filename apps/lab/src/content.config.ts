import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const specimens = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/specimens' }),
  schema: z.object({
    specimenId: z.string(),
    title: z.string(),
    tagline: z.string().max(90),
    year: z.number(),
    stack: z.array(z.string()),
    status: z.enum(['shipped', 'in-lab']),
    demoType: z.enum(['playable', 'recreation', 'static']),
    repoUrl: z.string().url(),
    liveUrl: z.string().url().optional(),
    role: z.string(),
    order: z.number(),
  }),
});

export const collections = { specimens };
