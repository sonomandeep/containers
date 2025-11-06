import { createFetch } from "@better-fetch/fetch";

export const $api = createFetch({
  baseURL: process.env.API_BASE_URL,
  retry: {
    type: "linear",
    attempts: 3,
    delay: 1000,
  },
});
