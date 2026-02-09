package commands

import (
	"context"
	"encoding/json"
	"errors"
	"testing"
	"time"

	"github.com/sonomandeep/containers/agent/internal/protocol"
)

func TestDispatcherDispatch(t *testing.T) {
	t.Run("dispatches container.stop command", func(t *testing.T) {
		dispatcher := NewDispatcher()

		err := dispatcher.Dispatch(context.Background(), &protocol.Command{
			ID:      "cmd-1",
			TS:      time.Now(),
			Name:    protocol.ContainerStopName,
			Payload: json.RawMessage(`{"containerId":"container-1"}`),
		})
		if err != nil {
			t.Fatalf("Dispatch() unexpected error: %v", err)
		}
	})

	t.Run("returns ErrUnhandledCommand for unknown command", func(t *testing.T) {
		dispatcher := NewDispatcher()

		err := dispatcher.Dispatch(context.Background(), &protocol.Command{
			ID:      "cmd-1",
			TS:      time.Now(),
			Name:    "container.start",
			Payload: json.RawMessage(`{"containerId":"container-1"}`),
		})
		if !errors.Is(err, ErrUnhandledCommand) {
			t.Fatalf("Dispatch() expected ErrUnhandledCommand, got %v", err)
		}
	})

	t.Run("returns error for invalid container.stop payload", func(t *testing.T) {
		dispatcher := NewDispatcher()

		err := dispatcher.Dispatch(context.Background(), &protocol.Command{
			ID:      "cmd-1",
			TS:      time.Now(),
			Name:    protocol.ContainerStopName,
			Payload: json.RawMessage(`{"containerId":"   "}`),
		})
		if err == nil {
			t.Fatal("Dispatch() expected error")
		}
	})
}
