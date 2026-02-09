package commands

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"strings"
)

type containerStopPayload struct {
	ContainerID string `json:"containerId"`
}

func (d *Dispatcher) registerContainerHandlers() {
	d.register(ContainerStopName, d.handleContainerStop)
}

func (d *Dispatcher) handleContainerStop(ctx context.Context, command *Command) error {
	if command == nil {
		return errors.New("command is nil")
	}

	if d.containerStopper == nil {
		return errors.New("container stopper not configured")
	}

	var payload containerStopPayload
	if err := json.Unmarshal(command.Payload, &payload); err != nil {
		return fmt.Errorf("invalid %s payload: %w", ContainerStopName, err)
	}

	payload.ContainerID = strings.TrimSpace(payload.ContainerID)
	if payload.ContainerID == "" {
		return errors.New("container.stop payload missing containerId")
	}

	if err := d.containerStopper.StopContainer(ctx, payload.ContainerID); err != nil {
		return fmt.Errorf("stop container %q: %w", payload.ContainerID, err)
	}

	log.Printf(
		"command %q (%s) stopped container %q",
		command.Name,
		command.ID,
		payload.ContainerID,
	)

	return nil
}
