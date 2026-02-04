package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/coder/websocket"
	"github.com/sonomandeep/containers/agent/internal/agent"
	"github.com/sonomandeep/containers/agent/internal/client"
)

func main() {
	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	client, err := client.Connect(ctx)
	if err != nil {
		log.Fatal(err)
	}
	defer client.Close(websocket.StatusNormalClosure, "shutdown")

	agent, err := agent.New()
	if err != nil {
		log.Println(err)
		cancel()
		return
	}
	defer agent.Close()

	go agent.Run(ctx)

	for {
		select {
		case <-ctx.Done():
			return

		case msg, ok := <-client.In:
			if !ok {
				return
			}
			log.Printf("recv (%v): %s\n", msg.Type, string(msg.Data))

		case e, ok := <-client.Errs:
			if !ok {
				return
			}
			log.Println(e)
			cancel()

		case e, ok := <-agent.Errors():
			if !ok {
				return
			}
			log.Println(e)
			cancel()

		case e, ok := <-agent.Events():
			if !ok {
				return
			}
			select {
			case client.Out <- e:
			default:
				log.Println("ws: outbound queue full, dropping event")
			}

		}
	}
}
