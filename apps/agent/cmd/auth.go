package cmd

import (
	"github.com/spf13/cobra"
)

var authCmd = &cobra.Command{
	Use:   "auth",
	Short: "Manage authentication",
	Long: `Manage authentication for the agent.

This command groups the login, logout, and status subcommands.`,
}

func init() {
	rootCmd.AddCommand(authCmd)
}
