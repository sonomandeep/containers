// Package ui provides shared helpers and styles for rendering consistent
// terminal output across the CLI.
package ui

import (
	"os"

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
