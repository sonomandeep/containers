package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/sonomandeep/containers/agent/internal/agent"
)

func main() {
	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

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
			log.Printf("client: `%s` at %s with %s", e.Type, e.TS, e.Data)
		}
	}
}
