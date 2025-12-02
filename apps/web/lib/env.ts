import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  API_BASE_URL: z.string().nonempty(),
});

export type Env = z.infer<typeof envSchema>;

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid Env");
  console.error(z.treeifyError(result.error).properties);
  process.exit(1);
}

export default result.data;
