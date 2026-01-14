import { createAuthClient } from "better-auth/react"; // make sure to import from better-auth/react
import env from "@/lib/env";

export const auth = createAuthClient({
  baseURL: env.API_BASE_URL,
});
