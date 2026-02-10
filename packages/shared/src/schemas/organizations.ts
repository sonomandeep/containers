import z from "zod";

export const organizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  logo: z.url().optional(),
});
export type Organization = z.infer<typeof organizationSchema>;

export const createOrganizationSchema = organizationSchema.pick({
  name: true,
  slug: true,
  logo: true,
});
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
