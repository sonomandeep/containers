"use client";

import type { Container } from "@containers/shared";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import { useEffect, useRef } from "react";
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

type WsMsg =
  | { type: "data"; data: string }
  | { type: "resize"; cols: number; rows: number }
  | { type: "ping" };

export default function TerminalDialog({ container, open, setOpen }: Props) {
  const divRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: need to react to ref.current updates
  useEffect(() => {
    console.log({ message: "ENTRATO", ref: divRef.current });
    if (!divRef.current) {
      return;
    }

    if (!open) {
      return;
    }

    const terminal = new Terminal({ cursorBlink: true, convertEol: true });
    const fit = new FitAddon();
    terminal.loadAddon(fit);

    terminal.open(divRef.current);
    fit.fit();

    requestAnimationFrame(() => {
      fit.fit(); // secondo tentativo, con layout stabile
    });
    const dimensions = fit.proposeDimensions();

    termRef.current = terminal;
    fitRef.current = fit;

    const socket = new WebSocket(
      `${process.env.NEXT_PUBLIC_API_URL}/containers/${container.id}/terminal?cols=${dimensions?.cols || 80}&rows=${dimensions?.rows || 24}`
    );
    socket.binaryType = "arraybuffer";
    socketRef.current = socket;

    socket.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        terminal.write(new TextDecoder().decode(event.data));
      }
    };

    const onData = terminal.onData((data) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "input", message: data }));
      }
    });

    socket.onopen = () => terminal.writeln("[connected]");
    socket.onerror = () => terminal.writeln("\r\n[websocket error]");
    socket.onclose = () => terminal.writeln("\r\n[disconnected]");

    return () => {
      onData.dispose();
      socket.close();
      terminal.dispose();
    };
  }, [open]);

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
          <div className="h-full" ref={divRef} />
        </DialogCard>
      </DialogContent>
    </Dialog>
  );
}
