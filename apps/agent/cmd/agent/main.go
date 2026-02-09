package main

import (
	"context"
	"errors"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/coder/websocket"
	"github.com/sonomandeep/containers/agent/internal/agent"
	"github.com/sonomandeep/containers/agent/internal/client"
	agentcommands "github.com/sonomandeep/containers/agent/internal/commands"
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
	dispatcher := agentcommands.NewDispatcher()

	for {
		select {
		case <-ctx.Done():
			return

		case msg, ok := <-client.Incoming():
			if !ok {
				return
			}

			if msg.Type != websocket.MessageText {
				log.Printf("recv: ignoring non-text message (%v)", msg.Type)
				continue
			}

			command, err := agentcommands.ParseCommand(msg.Data)
			if err != nil {
				if errors.Is(err, agentcommands.ErrNotCommand) {
					continue
				}

				log.Printf("recv: invalid command message: %v", err)
				continue
			}

			if err := dispatcher.Dispatch(ctx, command); err != nil {
				if errors.Is(err, agentcommands.ErrUnhandledCommand) {
					log.Printf("recv: command %q (%s) is not handled yet", command.Name, command.ID)
					continue
				}

				log.Printf("recv: command %q (%s) failed: %v", command.Name, command.ID, err)
			}

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
			client.Write(e)

		}
	}
}
