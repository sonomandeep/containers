import { config } from "dotenv";
import type { ZodError } from "zod";
import { z } from "zod";

config();

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  API_BASE_URL: z.string().nonempty(),
});

export type Env = z.infer<typeof envSchema>;

// eslint-disable-next-line import/no-mutable-exports
let env: Env;

try {
  // eslint-disable-next-line node/prefer-global/process
  env = envSchema.parse(process.env);
} catch (e) {
  const error = e as ZodError;
  console.error("Invalid Env");
  console.error((z.treeifyError(error) as any).properties);
  // eslint-disable-next-line node/prefer-global/process
  process.exit(1);
}

export default env;
