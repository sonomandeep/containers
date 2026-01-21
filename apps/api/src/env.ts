import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(8080),
  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal", "silent"])
    .default("info"),
  APP_URL: z.url(),
  UPLOAD_DIR: z.string(),

  // DATABASE
  DATABASE_URL: z.url(),

  // EMAIL
  EMAIL_FROM: z.string(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number(),
  SMTP_SECURE: z.enum(["true", "false"]).transform((val) => val === "true"),
  SMTP_USERNAME: z.string(),
  SMTP_PASSWORD: z.string(),
});

export type Env = z.infer<typeof envSchema>;

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid Env");
  console.error(z.treeifyError(result.error).properties);
  process.exit(1);
}

export default result.data;
