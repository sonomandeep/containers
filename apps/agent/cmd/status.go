package cmd

import (
	"fmt"
	"os"

	"github.com/sonomandeep/containers/agent/internal/auth"
	"github.com/sonomandeep/containers/agent/internal/ui"
	"github.com/spf13/cobra"
)

var statusCmd = &cobra.Command{
	Use:   "status",
	Short: "Show authentication status",
	Long: `Show the current authentication status for the agent.

Use this to verify whether you are logged in and which account is active.`,
	RunE: func(cmd *cobra.Command, args []string) error {
		isLogged, err := auth.GetAuthStatus()
		if err != nil {
			return err
		}

		if !isLogged {
			cmd := ui.Command("agent auth login")

			fmt.Fprintln(os.Stderr, "You are not logged in.")
			fmt.Fprintf(os.Stderr, "Run %s to authenticate.\n", cmd)
			os.Exit(1)
		}

		// TODO: handle logged in with expire in and project name
		fmt.Println("Auth status:", isLogged)
		return nil
	},
}

func init() {
	authCmd.AddCommand(statusCmd)
}
