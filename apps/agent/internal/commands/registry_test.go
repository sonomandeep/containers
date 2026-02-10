package commands

import (
	"context"
	"encoding/json"
	"errors"
	"testing"
	"time"
)

type fakeContainerStopper struct {
	containerIDs []string
	err          error
}

func (f *fakeContainerStopper) StopContainer(_ context.Context, containerID string) error {
	f.containerIDs = append(f.containerIDs, containerID)
	return f.err
}

func TestDispatcherDispatch(t *testing.T) {
	t.Run("dispatches container.stop command", func(t *testing.T) {
		stopper := &fakeContainerStopper{}
		dispatcher := NewDispatcher(stopper)

		err := dispatcher.Dispatch(context.Background(), &Command{
			ID:      "cmd-1",
			TS:      time.Now(),
			Name:    ContainerStopName,
			Payload: json.RawMessage(`{"containerId":"container-1"}`),
		})
		if err != nil {
			t.Fatalf("Dispatch() unexpected error: %v", err)
		}

		if len(stopper.containerIDs) != 1 {
			t.Fatalf("StopContainer() calls = %d", len(stopper.containerIDs))
		}

		if stopper.containerIDs[0] != "container-1" {
			t.Fatalf("StopContainer() containerID = %q", stopper.containerIDs[0])
		}
	})

	t.Run("returns ErrUnhandledCommand for unknown command", func(t *testing.T) {
		dispatcher := NewDispatcher(&fakeContainerStopper{})

		err := dispatcher.Dispatch(context.Background(), &Command{
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
		stopper := &fakeContainerStopper{}
		dispatcher := NewDispatcher(stopper)

		err := dispatcher.Dispatch(context.Background(), &Command{
			ID:      "cmd-1",
			TS:      time.Now(),
			Name:    ContainerStopName,
			Payload: json.RawMessage(`{"containerId":"   "}`),
		})
		if err == nil {
			t.Fatal("Dispatch() expected error")
		}

		if len(stopper.containerIDs) != 0 {
			t.Fatalf("StopContainer() calls = %d", len(stopper.containerIDs))
		}
	})

	t.Run("returns stopper error", func(t *testing.T) {
		stopper := &fakeContainerStopper{err: errors.New("docker unavailable")}
		dispatcher := NewDispatcher(stopper)

		err := dispatcher.Dispatch(context.Background(), &Command{
			ID:      "cmd-1",
			TS:      time.Now(),
			Name:    ContainerStopName,
			Payload: json.RawMessage(`{"containerId":"container-1"}`),
		})
		if err == nil {
			t.Fatal("Dispatch() expected error")
		}

		if len(stopper.containerIDs) != 1 {
			t.Fatalf("StopContainer() calls = %d", len(stopper.containerIDs))
		}
	})
}
