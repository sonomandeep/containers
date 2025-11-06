import type { Logger } from "pino";
import * as client from "./logger.client";
import * as server from "./logger.server";

// eslint-disable-next-line import/no-mutable-exports
let logger: Logger;

if (typeof window === "undefined") {
  logger = server.logger;
}
else {
  logger = client.logger;
}

export { logger };
