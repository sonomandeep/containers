import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

export const notFoundSchema = createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND);
export const internalServerErrorSchema = createMessageObjectSchema(HttpStatusPhrases.INTERNAL_SERVER_ERROR);
