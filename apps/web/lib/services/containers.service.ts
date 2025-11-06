import { z } from "zod";
import { $api } from "@/lib/fetch";

export async function listContainers() {
  const { data, error } = await $api("/containers", {
    method: "get",
    output: z.array(z.any()),
  });

  return { data, error };
}
