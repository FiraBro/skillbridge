import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(5),
  markdown: z.string().min(10),
  tags: z.array(z.string()).max(5),
  cover_image: z.string().url().optional(), // ✅ ADD THIS
});

export const updatePostSchema = createPostSchema.partial();
