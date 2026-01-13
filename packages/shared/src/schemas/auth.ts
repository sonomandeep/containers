import z from "zod";

export const loginSchema = z.object({
  email: z
    .email("Please enter a valid email address")
    .max(255, "Email must not exceed 255 characters")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password must not exceed 128 characters")
    .regex(
      /^(?=.*[a-zA-Z])(?=.*\d)/,
      "Password must contain at least one letter and one number"
    ),
});
export type LoginSchemaInput = z.infer<typeof loginSchema>;
