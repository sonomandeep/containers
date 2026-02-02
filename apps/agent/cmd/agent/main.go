package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/coder/websocket"
	"github.com/sonomandeep/containers/agent/internal/config"
)

const (
	authorizationToken = "VIAmM5YBDDjAMDytTPvUlgBi3VHkLhL3"
	dialTimeout        = 15 * time.Second
	tickInterval       = 2 * time.Second
)

func main() {
	logger := slog.New(slog.NewTextHandler(os.Stderr, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	if err := run(ctx, logger); err != nil {
		logger.Error("agent stopped", "err", err)
		os.Exit(1)
	}
}

func run(ctx context.Context, logger *slog.Logger) error {
	if err := config.InitConfig(); err != nil {
		return err
	}

	cfg := config.Get()
	socketURL, err := buildSocketURL(cfg.APIURL)
	if err != nil {
		return err
	}

	logger.Info("connecting websocket", "socket_url", socketURL)
	conn, resp, err := dialSocket(ctx, socketURL)
	if err != nil {
		if resp != nil {
			return fmt.Errorf("dial websocket (%s): %w", resp.Status, err)
		}
		return fmt.Errorf("dial websocket: %w", err)
	}
	defer conn.Close(websocket.StatusGoingAway, "")

	ctx = conn.CloseRead(ctx)

	ticker := time.NewTicker(tickInterval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
			if err := conn.Write(ctx, websocket.MessageText, []byte("ping")); err != nil {
				return fmt.Errorf("write heartbeat: %w", err)
			}
		}
	}
}

func buildSocketURL(apiURL string) (string, error) {
	if strings.TrimSpace(apiURL) == "" {
		return "", errors.New("missing api url")
	}

	base, err := url.Parse(apiURL)
	if err != nil {
		return "", fmt.Errorf("parse api url: %w", err)
	}
	if strings.TrimSpace(base.Scheme) == "" || strings.TrimSpace(base.Host) == "" {
		return "", errors.New("api url must include scheme and host")
	}

	socketURL := base.JoinPath("agents", "socket")
	if socketURL == nil {
		return "", errors.New("failed to join socket path")
	}

	switch strings.ToLower(socketURL.Scheme) {
	case "http":
		socketURL.Scheme = "ws"
	case "https":
		socketURL.Scheme = "wss"
	case "ws", "wss":
	default:
		return "", fmt.Errorf("unsupported api url scheme %q", socketURL.Scheme)
	}

	return socketURL.String(), nil
}

func dialSocket(ctx context.Context, socketURL string) (*websocket.Conn, *http.Response, error) {
	dialCtx, cancel := context.WithTimeout(ctx, dialTimeout)
	defer cancel()

	headers := make(http.Header)
	headers.Set("Authorization", "Bearer "+authorizationToken)

	conn, resp, err := websocket.Dial(dialCtx, socketURL, &websocket.DialOptions{
		HTTPHeader: headers,
	})
	if err != nil {
		return nil, resp, err
	}

	return conn, resp, nil
}
