// Package cmd contains the root command and subcommands for the CLI.
package cmd

import (
	"errors"
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
	uiKit := ui.New()
	if err := rootCmd.Execute(); err != nil {
		var uiErr ui.Error
		if errors.As(err, &uiErr) {
			fmt.Println(uiKit.RenderError(uiErr))
			os.Exit(1)
		}

		fmt.Println(uiKit.RenderError(ui.Error{
			Title:   "Something went wrong.",
			Details: []string{err.Error()},
			Cause:   err,
		}))
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
