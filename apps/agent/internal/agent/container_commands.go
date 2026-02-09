package agent

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/errdefs"
)

const defaultContainerStopTimeoutSeconds = 10

func (a *Agent) StopContainer(ctx context.Context, containerID string) error {
	if a == nil {
		return errors.New("agent is nil")
	}

	id := strings.TrimSpace(containerID)
	if id == "" {
		return errors.New("container id is required")
	}

	timeout := defaultContainerStopTimeoutSeconds
	err := a.cli.ContainerStop(ctx, id, container.StopOptions{Timeout: &timeout})
	if err != nil {
		if errdefs.IsNotModified(err) {
			return nil
		}

		return fmt.Errorf("docker stop container: %w", err)
	}

	return nil
}
