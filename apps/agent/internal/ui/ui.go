// Package ui provides shared helpers and styles for rendering consistent
// terminal output across the CLI, including error boxes, key/value rows,
// and emphasized hints, built on top of lipgloss.
package ui

import (
	"fmt"
	"os"

	"github.com/charmbracelet/lipgloss"
	"github.com/muesli/termenv"
)

var output = termenv.NewOutput(os.Stdout)

func Command(s string) string {
	return termenv.String(s).
		Foreground(output.Color("6")).
		Bold().
		String()
}

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

func (ui UI) RenderError(err Error) string {
	title := err.Title
	if title == "" {
		title = "Something went wrong."
	}

	lines := []string{ui.ErrTitle.Render(title)}

	for _, field := range err.Fields {
		lines = append(lines, ui.KV(field.Label, field.Value))
	}

	if len(err.Details) > 0 {
		if len(err.Fields) > 0 {
			lines = append(lines, "")
		}
		for _, detail := range err.Details {
			lines = append(lines, ui.Muted.Render(detail))
		}
	}

	if len(err.Hints) > 0 {
		lines = append(lines, "")
		for _, hint := range err.Hints {
			if hint.Command != "" {
				lines = append(lines, hint.Prefix+ui.Emph.Render(hint.Command)+hint.Suffix)
				continue
			}
			if hint.Text != "" {
				lines = append(lines, hint.Text)
			}
		}
	}

	return ui.ErrorBox(lines...)
}

func (ui UI) Sprintf(format string, args ...any) string {
	return fmt.Sprintf(format, args...)
}
