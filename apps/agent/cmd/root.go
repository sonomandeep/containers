// Package cmd contains the root command and subcommands for the CLI.
package cmd

import (
	"os"

	"github.com/sonomandeep/containers/agent/internal/config"
	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "agent",
	Short: "Containers agent CLI",
	Long:  "CLI agent for authentication and connectivity tasks.",
	PersistentPreRunE: func(cmd *cobra.Command, args []string) error {
		if shouldSkipConfig(cmd) {
			return nil
		}

		config.InitConfig()

		return nil
	},
}

func Execute() {
	err := rootCmd.Execute()
	if err != nil {
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
