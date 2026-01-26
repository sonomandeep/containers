"use client";

import type { Container } from "@containers/shared";
import { FitAddon } from "@xterm/addon-fit";
import { type IDisposable, Terminal } from "@xterm/xterm";
import { useCallback, useEffect, useRef } from "react";
import {
  Dialog,
  DialogCard,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/core/dialog";
import "@xterm/xterm/css/xterm.css";

type Props = {
  container: Container;
  open: boolean;
  setOpen(value: boolean): void;
};

type TerminalClientEvent =
  | {
      type: "input";
      message: string;
    }
  | {
      type: "resize";
      cols: number;
      rows: number;
    };

const decoder = new TextDecoder();

export default function TerminalDialog({ container, open, setOpen }: Props) {
  const termRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const onDataDisposableRef = useRef<IDisposable | null>(null);
  const isInitializedRef = useRef(false);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastResizeRef = useRef(0);

  useEffect(() => {
    if (!open && isInitializedRef.current) {
      isInitializedRef.current = false;

      if (onDataDisposableRef.current) {
        onDataDisposableRef.current.dispose();
        onDataDisposableRef.current = null;
      }

      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }

      if (termRef.current) {
        termRef.current.dispose();
        termRef.current = null;
      }

      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }

      if (resizeTimeoutRef.current !== null) {
        clearTimeout(resizeTimeoutRef.current);
        resizeTimeoutRef.current = null;
      }

      fitRef.current = null;
    }
  }, [open]);

  const handleRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!(node && open) || isInitializedRef.current) {
        return;
      }

      isInitializedRef.current = true;

      const terminal = new Terminal({ cursorBlink: true, convertEol: true });
      const fit = new FitAddon();

      terminal.loadAddon(fit);
      terminal.open(node);
      fit.fit();

      termRef.current = terminal;
      fitRef.current = fit;

      const sendEvent = (event: TerminalClientEvent) => {
        const currentSocket = socketRef.current;
        if (!currentSocket || currentSocket.readyState !== WebSocket.OPEN) {
          return;
        }

        if (event.type === "resize") {
          if (
            !Number.isInteger(event.cols) ||
            !Number.isInteger(event.rows) ||
            event.cols <= 0 ||
            event.rows <= 0
          ) {
            return;
          }
        }

        let payload: string;
        try {
          payload = JSON.stringify(event);
        } catch {
          terminal.writeln("\r\n[client error: invalid message]");
          currentSocket.close();
          return;
        }

        currentSocket.send(payload);
      };

      const sendResize = () => {
        const currentFit = fitRef.current;
        if (!currentFit) {
          return;
        }

        currentFit.fit();
        const dimensions = currentFit.proposeDimensions();
        if (!dimensions) {
          return;
        }

        sendEvent({
          type: "resize",
          cols: dimensions.cols,
          rows: dimensions.rows,
        });
      };

      const scheduleResize = () => {
        const now = Date.now();
        const elapsed = now - lastResizeRef.current;
        const THROTTLE_MS = 100;

        if (elapsed >= THROTTLE_MS) {
          lastResizeRef.current = now;
          sendResize();
          return;
        }

        if (resizeTimeoutRef.current !== null) {
          return;
        }

        resizeTimeoutRef.current = setTimeout(() => {
          resizeTimeoutRef.current = null;
          lastResizeRef.current = Date.now();
          sendResize();
        }, THROTTLE_MS - elapsed);
      };

      requestAnimationFrame(() => {
        fit.fit();
        scheduleResize();
      });

      const dimensions = fit.proposeDimensions();
      const socket = new WebSocket(
        `${process.env.NEXT_PUBLIC_API_URL}/containers/${container.id}/terminal?cols=${dimensions?.cols || 80}&rows=${dimensions?.rows || 24}`
      );

      socket.binaryType = "arraybuffer";
      socketRef.current = socket;

      socket.onmessage = (event) => {
        if (event.data instanceof ArrayBuffer) {
          terminal.write(decoder.decode(event.data));
        }
      };

      const onData = terminal.onData((data) => {
        sendEvent({ type: "input", message: data });
      });

      onDataDisposableRef.current = onData;

      const resizeObserver = new ResizeObserver(() => {
        scheduleResize();
      });

      resizeObserver.observe(node);
      resizeObserverRef.current = resizeObserver;

      socket.onopen = () => {
        terminal.writeln("[connected]");
        scheduleResize();
      };
      socket.onerror = () => terminal.writeln("\r\n[websocket error]");
      socket.onclose = () => terminal.writeln("\r\n[disconnected]");
    },
    [open, container.id]
  );

  return (
    <Dialog
      onOpenChange={(value) => {
        setOpen(value);
      }}
      open={open}
    >
      <DialogContent className="w-min max-w-none! pb-2">
        <DialogHeader>
          <DialogTitle>
            Remote Terminal
            <span>{container.name}</span>
          </DialogTitle>
        </DialogHeader>

        <DialogCard className="aspect-video w-2xl overflow-hidden border-none bg-black p-2">
          <div className="h-full" ref={handleRef} />
        </DialogCard>
      </DialogContent>
    </Dialog>
  );
}
