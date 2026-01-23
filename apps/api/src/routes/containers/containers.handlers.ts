import { upgradeWebSocket } from "hono/bun";
import { streamSSE } from "hono/streaming";
import * as HttpStatusCodes from "stoker/http-status-codes";
import {
  launchContainer,
  listContainers,
  removeContainer,
  restartContainer,
  startContainer,
  stopContainer,
  updateContainerEnvs,
} from "@/lib/services/containers.service";
import type { AppRouteHandler, AppSSEHandler } from "@/lib/types";
import type {
  LaunchRoute,
  ListRoute,
  RemoveRoute,
  RestartRoute,
  StartRoute,
  StopRoute,
  StreamRoute,
  UpdateEnvsRoute,
} from "./containers.routes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const containers = await listContainers();

  return c.json(containers);
};

export const stream: AppSSEHandler<StreamRoute> = (c) => {
  c.var.logger.debug("container metrics stream started");

  return streamSSE(c, async (s) => {
    let isActive = true;
    const UPDATE_INTERVAL = 5000;

    c.req.raw.signal.addEventListener("abort", () => {
      c.var.logger.debug("client disconnected from metrics stream");
      isActive = false;
    });

    while (isActive) {
      try {
        const containers = await listContainers();

        await s.writeSSE({
          data: JSON.stringify(containers),
          event: "containers",
          id: String(Date.now()),
        });

        await s.sleep(UPDATE_INTERVAL);
      } catch (error) {
        c.var.logger.error(error, "error fetching container metrics");

        await s.writeSSE({
          data: JSON.stringify({ error: "Failed to fetch metrics" }),
          event: "error",
          id: String(Date.now()),
        });

        await s.sleep(UPDATE_INTERVAL * 2);
      }
    }

    c.var.logger.debug("container metrics stream ended");
  });
};

export const updateEnvs: AppRouteHandler<UpdateEnvsRoute> = async (c) => {
  const params = c.req.valid("param");
  const input = c.req.valid("json");

  const result = await updateContainerEnvs(params.containerId, input);

  return c.json(result.data?.envs || [], HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const params = c.req.valid("param");
  const query = c.req.valid("query");

  const result = await removeContainer({
    containerId: params.containerId,
    force: query.force,
  });
  if (result.error) {
    c.var.logger.error(result.error);
    return c.json(
      {
        message: result.error.message,
      },
      result.error.code
    );
  }

  return c.json(
    {
      message: "container deleted",
    },
    HttpStatusCodes.OK
  );
};

export const stop: AppRouteHandler<StopRoute> = async (c) => {
  const params = c.req.valid("param");

  const result = await stopContainer({
    containerId: params.containerId,
  });

  if (result.error) {
    c.var.logger.error(result.error);
    return c.json(
      {
        message: result.error.message,
      },
      result.error.code
    );
  }

  return c.json(result.data, HttpStatusCodes.OK);
};

export const start: AppRouteHandler<StartRoute> = async (c) => {
  const params = c.req.valid("param");

  const result = await startContainer({
    containerId: params.containerId,
  });

  if (result.error) {
    c.var.logger.error(result.error);
    return c.json(
      {
        message: result.error.message,
      },
      result.error.code
    );
  }

  return c.json(result.data, HttpStatusCodes.OK);
};

export const restart: AppRouteHandler<RestartRoute> = async (c) => {
  const params = c.req.valid("param");

  const result = await restartContainer({
    containerId: params.containerId,
  });

  if (result.error) {
    c.var.logger.error(result.error);
    return c.json(
      {
        message: result.error.message,
      },
      result.error.code
    );
  }

  return c.json(result.data, HttpStatusCodes.OK);
};

export const launch: AppRouteHandler<LaunchRoute> = async (c) => {
  const input = c.req.valid("json");

  const result = await launchContainer(input);

  if (result.error || result.data === null) {
    c.var.logger.error(result.error);
    return c.json(
      {
        message: result.error.message,
      },
      result.error.code
    );
  }

  return c.json(
    {
      message: "container launched",
      id: result.data.id,
    },
    HttpStatusCodes.OK
  );
};

export const terminal = upgradeWebSocket((c) => {
  const logger = c.var.logger;
  const containerId = c.req.param("containerId");

  return {
    onOpen(event) {
      logger.debug(event, `new client: ${containerId}`);
    },
    onMessage(event, ws) {
      logger.debug(`Message from client: ${event.data}`);
      ws.send("Hello from server!");
    },
    onClose: () => {
      logger.debug("Connection closed");
    },
  };
});
