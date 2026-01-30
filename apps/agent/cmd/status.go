package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

var statusCmd = &cobra.Command{
	Use:   "status",
	Short: "Show authentication status",
	Long: `Show the current authentication status for the agent.

Use this to verify whether you are logged in and which account is active.`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("status called")
	},
}

func init() {
	authCmd.AddCommand(statusCmd)
}
