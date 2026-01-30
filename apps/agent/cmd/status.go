package cmd

import (
	"fmt"

	"github.com/sonomandeep/containers/agent/internal/auth"
	"github.com/spf13/cobra"
)

var statusCmd = &cobra.Command{
	Use:   "status",
	Short: "Show authentication status",
	Long: `Show the current authentication status for the agent.

Use this to verify whether you are logged in and which account is active.`,
	Run: func(cmd *cobra.Command, args []string) {
		isLogged, err := auth.GetAuthStatus()
		if err != nil {
			fmt.Println("Error checking auth status:", err)
		}

		fmt.Println("Auth status:", isLogged)
	},
}

func init() {
	authCmd.AddCommand(statusCmd)
}
