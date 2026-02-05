import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z
  .object({
    NODE_ENV: z.string().default("development"),
    PORT: z.coerce.number().default(8080),
    LOG_LEVEL: z
      .enum(["trace", "debug", "info", "warn", "error", "fatal", "silent"])
      .default("info"),
    APP_URL: z.url(),
    UPLOAD_DIR: z.string(),
    AUTH_CROSS_SUBDOMAIN_COOKIES_ENABLED: z
      .enum(["true", "false"])
      .transform((val) => val === "true")
      .default(false),
    AUTH_CROSS_SUBDOMAIN_COOKIES_DOMAIN: z.string().optional(),

    // DATABASE
    DATABASE_URL: z.url(),

    // EMAIL
    EMAIL_FROM: z.string(),
    SMTP_HOST: z.string(),
    SMTP_PORT: z.coerce.number(),
    SMTP_SECURE: z.enum(["true", "false"]).transform((val) => val === "true"),
    SMTP_USERNAME: z.string(),
    SMTP_PASSWORD: z.string(),

    // REDIS
    REDIS_HOST: z.string(),
    REDIS_TIMEOUT: z.coerce.number().default(1000),
  })
  .superRefine((values, ctx) => {
    if (!values.AUTH_CROSS_SUBDOMAIN_COOKIES_ENABLED) {
      return;
    }

    if (!values.AUTH_CROSS_SUBDOMAIN_COOKIES_DOMAIN) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "AUTH_CROSS_SUBDOMAIN_COOKIES_DOMAIN is required when cross-subdomain cookies are enabled.",
        path: ["AUTH_CROSS_SUBDOMAIN_COOKIES_DOMAIN"],
      });
      return;
    }

    if (!values.AUTH_CROSS_SUBDOMAIN_COOKIES_DOMAIN.startsWith(".")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "AUTH_CROSS_SUBDOMAIN_COOKIES_DOMAIN must start with a dot (e.g. .example.com).",
        path: ["AUTH_CROSS_SUBDOMAIN_COOKIES_DOMAIN"],
      });
    }

    if (values.AUTH_CROSS_SUBDOMAIN_COOKIES_DOMAIN.includes("://")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "AUTH_CROSS_SUBDOMAIN_COOKIES_DOMAIN must be a bare domain without a protocol.",
        path: ["AUTH_CROSS_SUBDOMAIN_COOKIES_DOMAIN"],
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid Env");
  console.error(z.treeifyError(result.error).properties);
  process.exit(1);
}

export default result.data;
