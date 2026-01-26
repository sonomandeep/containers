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

const terminal = new Terminal();
const fitAddon = new FitAddon();
terminal.loadAddon(fitAddon);

export default function TerminalDialog({ container, open, setOpen }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  function onOpen() {
    terminal.clear();
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: need to react to ref.current updates
  useEffect(() => {
    let socket: WebSocket | null = null;

    if (ref.current && terminal) {
      fitAddon.fit();
      terminal.open(ref.current);
      terminal.write(`Connecting to ${container.name}...`);
      const dimensions = fitAddon.proposeDimensions();

      terminal.onData((data) => {
        if (socket) {
          socket.send(JSON.stringify({ type: "input", message: data }));
        }
      });

      socket = new WebSocket(
        `http://paper.sh:9999/containers/${container.id}/terminal?cols=${dimensions?.cols || 80}&rows=${dimensions?.rows || 24}`
      );
    }

    if (socket) {
      socket.addEventListener("open", onOpen);
      socket.addEventListener("message", async (event) => {
        if (event.data instanceof Blob) {
          terminal.write(await event.data.text());
        }
      });
    }

    return () => {
      if (socket) {
        socket.removeEventListener("open", onOpen);
        socket.close();
      }
    };
  }, [ref.current]);

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
          <div ref={ref} />
        </DialogCard>
      </DialogContent>
    </Dialog>
  );
}
