// Package agent
package agent

import (
	"context"
	"sync"
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

	const snapshotInterval = 30 * time.Second
	var wg sync.WaitGroup
	wg.Add(1)
	go func() {
		defer wg.Done()
		a.runSnapshots(ctx, snapshotInterval)
	}()

loop:
	for {
		select {
		case <-ctx.Done():
			break loop

		case m, ok := <-msgs:
			if !ok {
				break loop
			}
			event, err := a.parseDockerEvent(ctx, m)
			if err != nil {
				a.emitError(ctx, err)
				continue
			}
			if event != nil {
				a.emitEvent(ctx, *event)
			}

		case e, ok := <-errs:
			if !ok {
				break loop
			}
			a.emitError(ctx, e)
		}
	}

	wg.Wait()
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
	f.Add("type", "container")
	f.Add("type", "image")

	msgs, errs := a.cli.Events(ctx, events.ListOptions{Filters: f})

	return msgs, errs
}

func (a *Agent) runSnapshots(ctx context.Context, interval time.Duration) {
	if interval <= 0 {
		return
	}

	if err := a.emitSnapshot(ctx); err != nil {
		a.emitError(ctx, err)
	}

	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			if err := a.emitSnapshot(ctx); err != nil {
				a.emitError(ctx, err)
			}
		}
	}
}

func (a *Agent) emitSnapshot(ctx context.Context) error {
	event, err := a.buildSnapshotEvent(ctx)
	if err != nil {
		return err
	}

	a.emitEvent(ctx, *event)
	return nil
}

func (a *Agent) emitEvent(ctx context.Context, event Event) {
	select {
	case a.events <- event:
	case <-ctx.Done():
	}
}

func (a *Agent) emitError(ctx context.Context, err error) {
	if err == nil {
		return
	}

	select {
	case a.errors <- err:
	case <-ctx.Done():
	}
}
