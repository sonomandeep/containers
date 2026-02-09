package protocol

import (
	"encoding/json"
	"errors"
	"testing"
	"time"
)

func TestParseCommand(t *testing.T) {
	t.Run("parses command envelope", func(t *testing.T) {
		command, err := ParseCommand([]byte(`{"type":"command","ts":"2026-01-01T00:00:00.000Z","data":{"id":"11111111-1111-4111-8111-111111111111","name":"container.stop","payload":{"containerId":"container-1"}}}`))
		if err != nil {
			t.Fatalf("ParseCommand() unexpected error: %v", err)
		}

		if command == nil {
			t.Fatal("ParseCommand() returned nil command")
		}

		if command.ID != "11111111-1111-4111-8111-111111111111" {
			t.Fatalf("ParseCommand() command.ID = %q", command.ID)
		}

		if command.Name != ContainerStopName {
			t.Fatalf("ParseCommand() command.Name = %q", command.Name)
		}

		expectedTS := time.Date(2026, time.January, 1, 0, 0, 0, 0, time.UTC)
		if !command.TS.Equal(expectedTS) {
			t.Fatalf("ParseCommand() command.TS = %v", command.TS)
		}

		var payload struct {
			ContainerID string `json:"containerId"`
		}

		if err := json.Unmarshal(command.Payload, &payload); err != nil {
			t.Fatalf("json.Unmarshal() unexpected error: %v", err)
		}

		if payload.ContainerID != "container-1" {
			t.Fatalf("ParseCommand() payload.ContainerID = %q", payload.ContainerID)
		}
	})

	t.Run("returns ErrNotCommand for non-command message", func(t *testing.T) {
		command, err := ParseCommand([]byte(`{"type":"welcome","id":"go-cli"}`))
		if !errors.Is(err, ErrNotCommand) {
			t.Fatalf("ParseCommand() expected ErrNotCommand, got %v", err)
		}

		if command != nil {
			t.Fatalf("ParseCommand() command = %v", command)
		}
	})

	t.Run("returns error for malformed json", func(t *testing.T) {
		command, err := ParseCommand([]byte(`{"type":"command"`))
		if err == nil {
			t.Fatal("ParseCommand() expected error")
		}

		if command != nil {
			t.Fatalf("ParseCommand() command = %v", command)
		}
	})

	t.Run("parses unknown command name", func(t *testing.T) {
		command, err := ParseCommand([]byte(`{"type":"command","ts":"2026-01-01T00:00:00.000Z","data":{"id":"11111111-1111-4111-8111-111111111111","name":"container.start","payload":{"containerId":"container-1"}}}`))
		if err != nil {
			t.Fatalf("ParseCommand() unexpected error: %v", err)
		}

		if command == nil {
			t.Fatal("ParseCommand() returned nil command")
		}

		if command.Name != "container.start" {
			t.Fatalf("ParseCommand() command.Name = %q", command.Name)
		}
	})

	t.Run("returns error when ts is missing", func(t *testing.T) {
		command, err := ParseCommand([]byte(`{"type":"command","data":{"id":"11111111-1111-4111-8111-111111111111","name":"container.stop","payload":{"containerId":"container-1"}}}`))
		if err == nil {
			t.Fatal("ParseCommand() expected error")
		}

		if command != nil {
			t.Fatalf("ParseCommand() command = %v", command)
		}
	})

	t.Run("returns error when payload is missing", func(t *testing.T) {
		command, err := ParseCommand([]byte(`{"type":"command","ts":"2026-01-01T00:00:00.000Z","data":{"id":"11111111-1111-4111-8111-111111111111","name":"container.stop"}}`))
		if err == nil {
			t.Fatal("ParseCommand() expected error")
		}

		if command != nil {
			t.Fatalf("ParseCommand() command = %v", command)
		}
	})
}
