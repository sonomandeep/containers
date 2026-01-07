import { streamSSE } from "hono/streaming";
import * as HttpStatusCodes from "stoker/http-status-codes";
import {
  getContainersMetrics,
  launchContainer,
  listContainers,
  removeContainer,
  startContainer,
  stopContainer,
} from "@/lib/services/containers.service";
import type { AppRouteHandler, AppSSEHandler } from "@/lib/types";
import type {
  LaunchRoute,
  ListRoute,
  MetricsRoute,
  RemoveRoute,
  StartRoute,
  StopRoute,
} from "./containers.routes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const containers = await listContainers();

  return c.json(containers);
};

export const metrics: AppSSEHandler<MetricsRoute> = (c) => {
  c.var.logger.debug("container metrics stream started");

  return streamSSE(c, async (stream) => {
    let isActive = true;
    const UPDATE_INTERVAL = 5000;

    c.req.raw.signal.addEventListener("abort", () => {
      c.var.logger.debug("client disconnected from metrics stream");
      isActive = false;
    });

    while (isActive) {
      try {
        const contianersMetrics = await getContainersMetrics();

        await stream.writeSSE({
          data: JSON.stringify(contianersMetrics),
          event: "containers-metrics",
          id: String(Date.now()),
        });

        await stream.sleep(UPDATE_INTERVAL);
      } catch (error) {
        c.var.logger.error(error, "error fetching container metrics");

        await stream.writeSSE({
          data: JSON.stringify({ error: "Failed to fetch metrics" }),
          event: "error",
          id: String(Date.now()),
        });

        await stream.sleep(UPDATE_INTERVAL * 2);
      }
    }

    c.var.logger.debug("container metrics stream ended");
  });
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

  return c.json(
    {
      message: "container stopped",
    },
    HttpStatusCodes.OK
  );
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

  return c.json(
    {
      message: "container started",
    },
    HttpStatusCodes.OK
  );
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
