/** biome-ignore-all lint/suspicious/noConsole: frontend */
"use client";

import { type Container, containerSchema } from "@containers/shared";
import { useEffect } from "react";
import z from "zod";
import { useContainersStore } from "@/lib/store/containers.store";

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
      "http://core.internal:9999/containers/stream"
    );

    eventSource.onerror = (err) => {
      console.log("[metrics-sse] error", err);
    };

    const handler = (e: Event) => {
      const event = e as MessageEvent;
      const raw = JSON.parse(event.data);

      const validation = z.array(containerSchema).safeParse(raw);
      if (!validation.success) {
        console.error("validation error", validation.error);
        return;
      }

      if (store) {
        store.setContainers(validation.data);
      }
    };

    eventSource.addEventListener("containers", handler);

    return () => {
      eventSource.removeEventListener("containers", handler);
      eventSource.close();
    };
  }, []);

  return null;
}
