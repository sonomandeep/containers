import type { Subprocess, Terminal } from "bun";
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
import {
  parseEvent,
  startTerminal,
  validateTerminalAccess,
} from "@/lib/services/terminal.service";
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

export const terminal = upgradeWebSocket(async (c) => {
  const logger = c.var.logger;
  const containerId = c.req.param("containerId");
  const cols = c.req.query("cols");
  const rows = c.req.query("rows");
  const access = await validateTerminalAccess(containerId);
  const MAX_WS_BUFFERED_AMOUNT = 1024 * 1024;
  let term: Terminal | null = null;
  let subprocess: Subprocess | null = null;

  const cleanup = () => {
    if (term) {
      term.close();
      term = null;
    }

    if (subprocess) {
      if (!subprocess.killed) {
        subprocess.kill("SIGTERM");
      }
      subprocess = null;
    }
  };

  return {
    onOpen(_, ws) {
      if (access.error) {
        logger.warn(
          { error: access.error, containerId },
          "terminal access denied"
        );
        ws.close(1008, access.error.message);
        return;
      }

      const { data, error } = startTerminal(
        containerId,
        Number(cols) || 80,
        Number(rows) || 24,
        (_term, arrayBuffer) => {
          if (ws.readyState !== 1) {
            return;
          }

          const raw = ws.raw as { bufferedAmount?: number } | undefined;
          if (
            raw &&
            typeof raw.bufferedAmount === "number" &&
            raw.bufferedAmount > MAX_WS_BUFFERED_AMOUNT
          ) {
            return;
          }

          ws.send(arrayBuffer);
        }
      );

      if (error) {
        logger.error(error, "error opening terminal");
        cleanup();
        ws.close();
      }

      term = data?.terminal ?? null;
      subprocess = data?.process ?? null;
    },
    async onMessage(e, ws) {
      if (term === null) {
        return ws.close();
      }

      const event = await parseEvent(e.data);
      if (event.error || event.data === null) {
        logger.warn({ error: event.error }, "invalid terminal event");
        ws.close();
        return;
      }

      if (event.data.type === "input") {
        term.write(event.data.message);
      }

      if (event.data.type === "resize") {
        term.resize(event.data.cols, event.data.rows);
      }
    },
    onClose() {
      logger.debug("Connection closed");
      cleanup();
    },
    onError() {
      logger.debug("error in ws");
      cleanup();
    },
  };
});
