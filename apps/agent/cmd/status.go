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

		fmt.Fprintln(os.Stderr, "Agent Status")
		fmt.Fprintln(os.Stderr)

		if !isLogged {
			loginCmd := ui.Command("agent auth login")

			fmt.Fprintln(os.Stderr, ui.Danger("✕")+" You are not logged in.")
			fmt.Fprintln(
				os.Stderr,
				ui.Muted("Run ")+loginCmd+ui.Muted(" to authenticate."),
			)
			os.Exit(1)
		}

		// TODO: handle logged in with expire in and project name
		fmt.Fprintln(os.Stderr, ui.Success("✓")+" You are logged in.")
		return nil
	},
}

func init() {
	authCmd.AddCommand(statusCmd)
}
