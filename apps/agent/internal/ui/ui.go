// Package ui provides shared helpers and styles for rendering consistent
// terminal output across the CLI, including error boxes, key/value rows,
// and emphasized hints, built on top of lipgloss.
package ui

import (
	"fmt"

	"github.com/charmbracelet/lipgloss"
)

type UI struct {
	Box       lipgloss.Style
	InfoTitle lipgloss.Style
	ErrTitle  lipgloss.Style
	Label     lipgloss.Style
	Value     lipgloss.Style
	Emph      lipgloss.Style
	Muted     lipgloss.Style
}

func New() UI {
	return UI{
		Box:       lipgloss.NewStyle().Padding(1, 0),
		InfoTitle: lipgloss.NewStyle().Foreground(lipgloss.Color("12")).Bold(true),
		ErrTitle:  lipgloss.NewStyle().Foreground(lipgloss.Color("9")).Bold(true),
		Label:     lipgloss.NewStyle().Foreground(lipgloss.Color("244")),
		Value:     lipgloss.NewStyle().Foreground(lipgloss.Color("252")),
		Emph:      lipgloss.NewStyle().Foreground(lipgloss.Color("205")).Bold(true),
		Muted:     lipgloss.NewStyle().Foreground(lipgloss.Color("241")),
	}
}

func (ui UI) KV(k, v string) string {
	return ui.Label.Render(k+": ") + ui.Value.Render(v)
}

func (ui UI) ErrorBox(lines ...string) string {
	return ui.Box.Render(lipgloss.JoinVertical(lipgloss.Left, lines...))
}

func (ui UI) InfoBox(lines ...string) string {
	return ui.Box.Render(lipgloss.JoinVertical(lipgloss.Left, lines...))
}

func (ui UI) Sprintf(format string, args ...any) string {
	return fmt.Sprintf(format, args...)
}
