package agent

import "time"

type Event struct {
	Type string    `json:"type"`
	TS   time.Time `json:"ts"`
	Data any       `json:"data"`
}
