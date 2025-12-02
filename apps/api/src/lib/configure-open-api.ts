import { Scalar } from "@scalar/hono-api-reference";
import packageJson from "../../package.json";
import type { AppOpenAPI } from "./types";

export default function configureOpenAPI(app: AppOpenAPI) {
  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      version: packageJson.version,
      title: "Containers API",
    },
  });

  app.get(
    "/reference",
    Scalar({
      url: "/doc",
    })
  );
}
