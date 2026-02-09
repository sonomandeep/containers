package protocol

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"
)

const ContainerStopName = "container.stop"

var (
	ErrNotCommand = errors.New("message is not a command")
)

type Command struct {
	ID      string
	TS      time.Time
	Name    string
	Payload json.RawMessage
}

type commandEnvelope struct {
	Type string      `json:"type"`
	TS   string      `json:"ts"`
	Data commandData `json:"data"`
}

type commandData struct {
	ID      string          `json:"id"`
	Name    string          `json:"name"`
	Payload json.RawMessage `json:"payload"`
}

func ParseCommand(data []byte) (*Command, error) {
	var envelope commandEnvelope
	if err := json.Unmarshal(data, &envelope); err != nil {
		return nil, fmt.Errorf("invalid message json: %w", err)
	}

	if envelope.Type != "command" {
		return nil, ErrNotCommand
	}

	if strings.TrimSpace(envelope.TS) == "" {
		return nil, errors.New("command message missing ts")
	}

	ts, err := time.Parse(time.RFC3339Nano, envelope.TS)
	if err != nil {
		return nil, fmt.Errorf("invalid command ts: %w", err)
	}

	if strings.TrimSpace(envelope.Data.ID) == "" {
		return nil, errors.New("command message missing id")
	}

	if strings.TrimSpace(envelope.Data.Name) == "" {
		return nil, errors.New("command message missing name")
	}

	if len(envelope.Data.Payload) == 0 {
		return nil, errors.New("command message missing payload")
	}

	return &Command{
		ID:      envelope.Data.ID,
		TS:      ts,
		Name:    envelope.Data.Name,
		Payload: envelope.Data.Payload,
	}, nil
}
