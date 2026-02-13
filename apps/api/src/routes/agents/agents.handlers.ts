import type { Context } from "hono";
import { upgradeWebSocket } from "hono/bun";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import {
  isContainerEvent,
  isSnapshotEvent,
  parseAgentMessage,
} from "@/lib/services/agent-protocol.service";
import type { AppBindings, AppRouteHandler } from "@/lib/types";
import type {
  CreateRoute,
  GetByIdRoute,
  ListRoute,
  UpdateRoute,
} from "./agents.routes";
import {
  agentsRegistry,
  createAgent,
  getAgentById,
  listAgents,
  storeContainer,
  storeContainersSnapshot,
  updateAgent,
} from "./agents.service";

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const input = c.req.valid("json");
  const organizationId = c.var.session?.activeOrganizationId;

  if (!organizationId) {
    return c.json(
      {
        message: "Active workspace is required.",
      },
      HttpStatusCodes.BAD_REQUEST
    );
  }

  const result = await createAgent(organizationId, input);
  if (result.error || result.data === null) {
    c.var.logger.error(result.error, "error creating agent");

    return c.json(
      {
        message:
          result.error?.message ?? HttpStatusPhrases.INTERNAL_SERVER_ERROR,
      },
      result.error?.code ?? HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  return c.json(result.data, HttpStatusCodes.CREATED);
};

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const organizationId = c.var.session?.activeOrganizationId;

  if (!organizationId) {
    return c.json(
      {
        message: "Active workspace is required.",
      },
      HttpStatusCodes.BAD_REQUEST
    );
  }

  const result = await listAgents(organizationId);
  if (result.error || result.data === null) {
    c.var.logger.error(result.error, "error listing agents");

    return c.json(
      {
        message:
          result.error?.message ?? HttpStatusPhrases.INTERNAL_SERVER_ERROR,
      },
      result.error?.code ?? HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  return c.json(result.data, HttpStatusCodes.OK);
};

export const getById: AppRouteHandler<GetByIdRoute> = async (c) => {
  const params = c.req.valid("param");
  const organizationId = c.var.session?.activeOrganizationId;

  if (!organizationId) {
    return c.json(
      {
        message: "Active workspace is required.",
      },
      HttpStatusCodes.BAD_REQUEST
    );
  }

  const result = await getAgentById(organizationId, params.agentId);
  if (result.error || result.data === null) {
    c.var.logger.error(result.error, "error getting agent by id");

    return c.json(
      {
        message:
          result.error?.message ?? HttpStatusPhrases.INTERNAL_SERVER_ERROR,
      },
      result.error?.code ?? HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  return c.json(result.data, HttpStatusCodes.OK);
};

export const update: AppRouteHandler<UpdateRoute> = async (c) => {
  const params = c.req.valid("param");
  const input = c.req.valid("json");
  const organizationId = c.var.session?.activeOrganizationId;

  if (!organizationId) {
    return c.json(
      {
        message: "Active workspace is required.",
      },
      HttpStatusCodes.BAD_REQUEST
    );
  }

  const result = await updateAgent(organizationId, params.agentId, input);
  if (result.error || result.data === null) {
    c.var.logger.error(result.error, "error updating agent");

    return c.json(
      {
        message:
          result.error?.message ?? HttpStatusPhrases.INTERNAL_SERVER_ERROR,
      },
      result.error?.code ?? HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  return c.json(result.data, HttpStatusCodes.OK);
};

export const socket = upgradeWebSocket((c: Context<AppBindings>) => {
  const logger = c.var.logger;
  const id = c.req.query("id");
  if (!id) {
    throw new Error("handle validation");
  }

  return {
    onOpen(_evt, ws) {
      agentsRegistry.add(id, ws);
      ws.send(JSON.stringify({ type: "welcome", id }));
    },
    onClose(e) {
      agentsRegistry.remove(id);
      logger.debug(e, "connection closed");
    },
    onError(e) {
      agentsRegistry.remove(id);
      logger.debug(e, "connection error");
    },
    async onMessage(e) {
      try {
        const payload = parseAgentMessage(e.data);

        if (isSnapshotEvent(payload)) {
          await storeContainersSnapshot(c.var.redis, payload.data.containers);
        }

        if (isContainerEvent(payload)) {
          await storeContainer(c.var.redis, payload.type, payload.data);
        }
      } catch (error) {
        logger.warn({ error }, "invalid agent message");
      }
    },
  };
});
