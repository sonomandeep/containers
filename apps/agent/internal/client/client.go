// Package client
package client

import (
	"context"
	"errors"
	"log"
	"net"
	"net/url"
	"time"

	"github.com/coder/websocket"
	"github.com/coder/websocket/wsjson"
)

const (
	host    = "paper.sh:9999"
	agentID = "go-cli"
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

	url := buildURL()
	log.Printf("ws: connecting to %s", url)

	c, _, err := websocket.Dial(dialCtx, url, nil)
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

func buildURL() string {
	u := url.URL{
		Scheme: "ws",
		Host:   host,
		Path:   "/agents/socket",
	}

	q := url.Values{}
	q.Add("id", agentID)

	u.RawQuery = q.Encode()

	return u.String()
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
