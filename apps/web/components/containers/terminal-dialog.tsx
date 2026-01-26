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

const decoder = new TextDecoder();

export default function TerminalDialog({ container, open, setOpen }: Props) {
  const termRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const onDataDisposableRef = useRef<IDisposable | null>(null);
  const isInitializedRef = useRef(false);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

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

      const sendResize = () => {
        const currentFit = fitRef.current;
        const currentSocket = socketRef.current;

        if (!currentFit || currentSocket?.readyState !== WebSocket.OPEN) {
          return;
        }

        currentFit.fit();
        const dimensions = currentFit.proposeDimensions();
        if (!dimensions) {
          return;
        }

        currentSocket.send(
          JSON.stringify({
            type: "resize",
            cols: dimensions.cols,
            rows: dimensions.rows,
          })
        );
      };

      requestAnimationFrame(() => {
        fit.fit();
        sendResize();
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
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "input", message: data }));
        }
      });

      onDataDisposableRef.current = onData;

      const resizeObserver = new ResizeObserver(() => {
        sendResize();
      });

      resizeObserver.observe(node);
      resizeObserverRef.current = resizeObserver;

      socket.onopen = () => {
        terminal.writeln("[connected]");
        sendResize();
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
