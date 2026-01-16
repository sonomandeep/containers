import { createFetch } from "@better-fetch/fetch";
import env from "@/lib/env";

export const $api = createFetch({
  baseURL: env.NEXT_PUBLIC_API_URL,
  retry: {
    type: "linear",
    attempts: 3,
    delay: 1000,
  },
});
