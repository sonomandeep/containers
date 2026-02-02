// Package ui provides shared helpers and styles for rendering consistent
// terminal output across the CLI.
package ui

import (
	"os"
	"strings"

	"github.com/muesli/termenv"
)

var output = termenv.NewOutput(os.Stdout)

func Command(s string) string {
	return termenv.String(s).
		Foreground(output.Color("6")).
		Bold().
		String()
}

func Success(s string) string {
	return termenv.String(s).
		Foreground(output.Color("2")).
		Bold().
		String()
}

func Danger(s string) string {
	return termenv.String(s).
		Foreground(output.Color("1")).
		Bold().
		String()
}

func Muted(s string) string {
	return termenv.String(s).
		Foreground(output.Color("241")).
		String()
}

func Emph(s string) string {
	return termenv.String(s).
		Foreground(output.Color("205")).
		Bold().
		String()
}

func InfoTitle(s string) string {
	return termenv.String(s).
		Foreground(output.Color("12")).
		Bold().
		String()
}

func Label(s string) string {
	return termenv.String(s).
		Foreground(output.Color("244")).
		String()
}

func Value(s string) string {
	return termenv.String(s).
		Foreground(output.Color("252")).
		String()
}

func KV(k, v string) string {
	return Label(k+": ") + Value(v)
}

func InfoBox(lines ...string) string {
	return strings.Join(lines, "\n")
}
