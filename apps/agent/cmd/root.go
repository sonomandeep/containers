// Package cmd contains the root command and subcommands for the CLI.
package cmd

import (
	"fmt"
	"os"

	"github.com/sonomandeep/containers/agent/internal/config"
	"github.com/sonomandeep/containers/agent/internal/ui"
	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:           "agent",
	Short:         "Containers agent CLI",
	Long:          "CLI agent for authentication and connectivity tasks.",
	SilenceUsage:  true,
	SilenceErrors: true,
	PersistentPreRunE: func(cmd *cobra.Command, args []string) error {
		if shouldSkipConfig(cmd) {
			return nil
		}

		return config.InitConfig()
	},
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, ui.Danger("✕")+" "+err.Error())
		os.Exit(1)
	}
}

func shouldSkipConfig(cmd *cobra.Command) bool {
	for current := cmd; current != nil; current = current.Parent() {
		if current.Name() == "init" {
			return true
		}
	}

	return false
}
