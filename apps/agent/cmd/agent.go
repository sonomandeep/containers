package cmd

import (
	"github.com/spf13/cobra"
)

var agentCmd = &cobra.Command{
	Use:   "agent",
	Short: "Manage agent",
	Long:  `Manage agent.`,
}

func init() {
	rootCmd.AddCommand(agentCmd)
}
