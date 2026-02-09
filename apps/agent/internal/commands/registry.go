package commands

import (
	"context"
	"errors"
	"fmt"
	"strings"
)

var ErrUnhandledCommand = errors.New("command not handled")

type Handler func(context.Context, *Command) error

type Dispatcher struct {
	handlers map[string]Handler
}

func NewDispatcher() *Dispatcher {
	dispatcher := &Dispatcher{
		handlers: make(map[string]Handler),
	}

	dispatcher.registerContainerHandlers()

	return dispatcher
}

func (d *Dispatcher) Dispatch(ctx context.Context, command *Command) error {
	if command == nil {
		return errors.New("command is nil")
	}

	handler, ok := d.handlers[command.Name]
	if !ok {
		return fmt.Errorf("%w: %s", ErrUnhandledCommand, command.Name)
	}

	return handler(ctx, command)
}

func (d *Dispatcher) register(name string, handler Handler) {
	if strings.TrimSpace(name) == "" {
		panic("command handler name cannot be empty")
	}

	if handler == nil {
		panic("command handler cannot be nil")
	}

	if _, exists := d.handlers[name]; exists {
		panic(fmt.Sprintf("command handler already registered: %s", name))
	}

	d.handlers[name] = handler
}
