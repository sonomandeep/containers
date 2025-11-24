import type { DockerodeError } from "@/lib/types";

export function isDockerodeError(err: unknown): err is DockerodeError {
  return typeof err === "object" &&
    err !== null &&
    "message" in err &&
    "statusCode" in err;
}
