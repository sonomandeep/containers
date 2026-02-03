import { createRouter } from "@/lib/create-app";
import * as handlers from "./agents.handlers";

const router = createRouter().get("/agents/socket", handlers.socket);

export default router;
