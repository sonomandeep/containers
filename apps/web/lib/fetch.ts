import { createFetch } from "@better-fetch/fetch";
import env from "@/lib/env";

export const $api = createFetch({
  baseURL: env.API_BASE_URL,
  retry: {
    type: "linear",
    attempts: 3,
    delay: 1000,
  },
});
