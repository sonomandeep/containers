// Package client
package client

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net"
	"net/url"
	"os"
	"time"

	"github.com/coder/websocket"
	"github.com/coder/websocket/wsjson"
)

const (
	agentAPIURLEnv = "AGENT_API_URL"
	agentIDEnv     = "AGENT_ID"
)

type Client struct {
	Conn *websocket.Conn
	In   <-chan InMsg
	Out  chan<- any
	Errs <-chan error
}

type InMsg struct {
	Type websocket.MessageType
	Data []byte
}

func Connect(ctx context.Context) (*Client, error) {
	dialCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	wsURL, err := buildURL()
	if err != nil {
		return nil, err
	}
	log.Printf("ws: connecting to %s", wsURL)

	c, _, err := websocket.Dial(dialCtx, wsURL, nil)
	if err != nil {
		return nil, err
	}

	log.Printf("ws: connection established")

	inCh := make(chan InMsg, 64)
	outCh := make(chan any, 64)
	errCh := make(chan error, 1)

	go read(ctx, c, inCh, errCh)
	go write(ctx, c, outCh, errCh)

	return &Client{
		Conn: c,
		In:   inCh,
		Out:  outCh,
		Errs: errCh,
	}, nil
}

func (cl *Client) Close(status websocket.StatusCode, reason string) error {
	if cl == nil || cl.Conn == nil {
		return nil
	}
	return cl.Conn.Close(status, reason)
}

func buildURL() (string, error) {
	apiURL := os.Getenv(agentAPIURLEnv)
	if apiURL == "" {
		return "", fmt.Errorf("missing %s", agentAPIURLEnv)
	}

	agentID := os.Getenv(agentIDEnv)
	if agentID == "" {
		return "", fmt.Errorf("missing %s", agentIDEnv)
	}

	parsed, err := url.Parse(apiURL)
	if err != nil {
		return "", fmt.Errorf("invalid %s: %w", agentAPIURLEnv, err)
	}

	switch parsed.Scheme {
	case "http":
		parsed.Scheme = "ws"
	case "https":
		parsed.Scheme = "wss"
	case "ws", "wss":
	default:
		return "", fmt.Errorf("unsupported %s scheme: %s", agentAPIURLEnv, parsed.Scheme)
	}

	parsed.Path = "/agents/socket"
	q := parsed.Query()
	q.Set("id", agentID)
	parsed.RawQuery = q.Encode()

	return parsed.String(), nil
}

func read(ctx context.Context, c *websocket.Conn, out chan<- InMsg, errs chan<- error) {
	defer close(out)

	for {
		typ, payload, err := c.Read(ctx)
		if err != nil {

			switch websocket.CloseStatus(err) {
			case websocket.StatusNormalClosure:
				log.Println("ws: normal closure")
				return

			case websocket.StatusGoingAway:
				log.Println("ws: server going away")
				return
			}

			if ctx.Err() != nil {
				log.Println("ws: context cancelled")
				return
			}

			if errors.Is(err, net.ErrClosed) {
				log.Println("ws: connection closed")
				return
			}

			log.Printf("ws: read error: %v", err)

			select {
			case errs <- err:
			default:
			}
			return
		}

		b := make([]byte, len(payload))
		copy(b, payload)

		select {
		case out <- InMsg{Type: typ, Data: b}:
		case <-ctx.Done():
			return
		}
	}
}

func write(ctx context.Context, c *websocket.Conn, out <-chan any, errs chan<- error) {
	for {
		select {
		case <-ctx.Done():
			return

		case msg, ok := <-out:
			if !ok {
				return
			}
			if err := wsjson.Write(ctx, c, msg); err != nil {

				select {
				case errs <- err:
				default:
				}
				return
			}
		}
	}
}
