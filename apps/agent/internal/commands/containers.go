package commands

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"strings"

	"github.com/sonomandeep/containers/agent/internal/protocol"
)

type containerStopPayload struct {
	ContainerID string `json:"containerId"`
}

func (d *Dispatcher) registerContainerHandlers() {
	d.register(protocol.ContainerStopName, handleContainerStop)
}

func handleContainerStop(_ context.Context, command *protocol.Command) error {
	if command == nil {
		return errors.New("command is nil")
	}

	var payload containerStopPayload
	if err := json.Unmarshal(command.Payload, &payload); err != nil {
		return fmt.Errorf("invalid %s payload: %w", protocol.ContainerStopName, err)
	}

	payload.ContainerID = strings.TrimSpace(payload.ContainerID)
	if payload.ContainerID == "" {
		return errors.New("container.stop payload missing containerId")
	}

	log.Printf(
		"command %q (%s) parsed for container %q",
		command.Name,
		command.ID,
		payload.ContainerID,
	)

	return nil
}
