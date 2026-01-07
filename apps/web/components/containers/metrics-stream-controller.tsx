/** biome-ignore-all lint/suspicious/noConsole: frontend */
"use client";

import { useEffect } from "react";

export function MetricsStreamController() {
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
      const evt = e as MessageEvent;
      const data = JSON.parse(evt.data);
      console.log("[metrics-sse]", data);
    };

    eventSource.addEventListener("containers-metrics", handler);

    return () => {
      eventSource.removeEventListener("containers-metrics", handler);
      eventSource.close();
    };
  }, []);

  return null;
}
