import z from "zod";

const firstNameSchema = z
  .string()
  .min(1, "First name is required")
  .max(100, "First name must not exceed 100 characters")
  .trim();

const lastNameSchema = z
  .string()
  .min(1, "Last name is required")
  .max(100, "Last name must not exceed 100 characters")
  .trim();

const emailSchema = z
  .email("Please enter a valid email address")
  .max(255, "Email must not exceed 255 characters")
  .toLowerCase()
  .trim();

const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters long")
  .max(128, "Password must not exceed 128 characters")
  .regex(
    /^(?=.*[a-zA-Z])(?=.*\d)/,
    "Password must contain at least one letter and one number"
  );

const confirmPasswordSchema = z
  .string()
  .min(1, "Please confirm your password")
  .min(8, "Password must be at least 8 characters long")
  .max(128, "Password must not exceed 128 characters");

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
export type LoginSchemaInput = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type SignupSchemaInput = z.infer<typeof signupSchema>;
