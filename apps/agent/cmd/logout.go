package cmd

import (
	"fmt"
	"os"

	"github.com/sonomandeep/containers/agent/internal/auth"
	"github.com/sonomandeep/containers/agent/internal/ui"
	"github.com/spf13/cobra"
)

var logoutCmd = &cobra.Command{
	Use:   "logout",
	Short: "Sign out of the agent",
	Long: `Sign out of the agent by removing the local auth session.

Use this to switch accounts or reset authentication.`,
	RunE: func(cmd *cobra.Command, args []string) error {
		didLogout, err := auth.Logout()
		if err != nil {
			return err
		}

		fmt.Fprintln(os.Stderr, "Agent Logout")
		fmt.Fprintln(os.Stderr)

		if !didLogout {
			fmt.Fprintln(os.Stderr, ui.Danger("✕")+" You are not logged in.")
			fmt.Fprintln(os.Stderr, ui.Muted("Nothing to do."))
			os.Exit(1)
		}

		fmt.Fprintln(os.Stderr, ui.Success("✓")+" You are logged out.")
		return nil
	},
}

func init() {
	authCmd.AddCommand(logoutCmd)
}
