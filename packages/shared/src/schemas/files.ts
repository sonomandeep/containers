import { z } from "zod";

export const fileSchema = z.object({
  id: z.string(),
  name: z.string(),
  mimeType: z.string(),
  size: z.number(),
  storageKey: z.string(),
  url: z.string().url(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type StoredFile = z.infer<typeof fileSchema>;
