/** biome-ignore-all lint/suspicious/noConsole: frontend */
"use client";

import { containerMetricsSchema, type Container } from "@containers/shared";
import { useEffect } from "react";
import { useContainersStore } from "@/lib/store/containers.store";
import z from "zod";

type Props = {
  containers: Array<Container>;
};

export function MetricsStreamController({ containers }: Props) {
  const store = useContainersStore((state) => state);

  useEffect(() => {
    store.setContainers(containers);
  }, [store.setContainers, containers]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: connection must start only after render
  useEffect(() => {
    const eventSource = new EventSource(
      "http://core.internal:9999/containers/metrics/stream"
    );

    eventSource.onopen = () => {
      console.log("[metrics-sse] connected");
    };

    eventSource.onerror = (err) => {
      console.log("[metrics-sse] error", err);
    };

    const handler = (e: Event) => {
      const event = e as MessageEvent;
      const raw = JSON.parse(event.data);

      const validation = z
        .array(
          containerMetricsSchema.extend({
            id: z.string(),
          })
        )
        .safeParse(raw);
      if (!validation.success) {
        console.error("validation error", validation.error);
        return;
      }

      if (store) {
        store.setContainers(
          containers.map((container) => ({
            ...container,
            metrics:
              validation.data.find((item) => item.id === container.id) ||
              undefined,
          }))
        );
      }
    };

    eventSource.addEventListener("containers-metrics", handler);

    return () => {
      eventSource.removeEventListener("containers-metrics", handler);
      eventSource.close();
    };
  }, []);

  return null;
}
