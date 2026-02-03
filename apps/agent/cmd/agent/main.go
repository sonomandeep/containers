package main

import (
	"context"
	"log/slog"
	"os"
	"time"

	"github.com/coder/websocket"
	"github.com/coder/websocket/wsjson"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stderr, nil))

	dialCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	conn, _, err := websocket.Dial(dialCtx, "ws://paper.sh:9999/agents/socket", nil)
	if err != nil {
		logger.Error("failed to dial", "err", err)
		os.Exit(1)
	}
	defer conn.CloseNow()

	ctx := conn.CloseRead(context.Background())

	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			logger.Info("connection closed", "err", ctx.Err())
			return

		case <-ticker.C:
			// 3) Timeout per singola write (NON riusare lo stesso context)
			writeCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			err := wsjson.Write(writeCtx, conn, map[string]string{
				"type": "ping",
			})
			cancel()

			if err != nil {
				logger.Error("failed to send ping", "err", err)
				return
			}
		}
	}
}
