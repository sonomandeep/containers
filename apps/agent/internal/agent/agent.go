// Package agent
package agent

import (
	"context"
	"time"

	"github.com/docker/docker/api/types/events"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/client"
)

type Agent struct {
	cli    *client.Client
	events chan Event
	errors chan error
}

func New() (*Agent, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, err
	}

	return &Agent{
		cli: cli, events: make(chan Event), errors: make(chan error),
	}, nil
}

func (a *Agent) Run(ctx context.Context) {
	defer close(a.events)
	defer close(a.errors)

	msgs, errs := a.getEvents(ctx)

	for {
		select {
		case <-ctx.Done():
			return

		case m, ok := <-msgs:
			if !ok {
				return
			}
			a.events <- Event{
				Type: "docker.event",
				TS:   time.Unix(0, m.TimeNano),
				Data: m,
			}

		case e, ok := <-errs:
			if !ok {
				return
			}
			a.errors <- e
		}
	}
}

func (a *Agent) Events() <-chan Event {
	return a.events
}

func (a *Agent) Errors() <-chan error {
	return a.errors
}

func (a *Agent) Close() error {
	return a.cli.Close()
}

func (a *Agent) getEvents(ctx context.Context) (<-chan events.Message, <-chan error) {
	f := filters.NewArgs()

	msgs, errs := a.cli.Events(ctx, events.ListOptions{Filters: f})

	return msgs, errs
}
