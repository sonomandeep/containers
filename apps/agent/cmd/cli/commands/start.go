package commands

import (
	"fmt"
	"os"

	"github.com/sonomandeep/containers/agent/internal/ui"
	"github.com/spf13/cobra"
)

var startCmd = &cobra.Command{
	Use:   "start",
	Short: "Show authentication status",
	Long: `Show the current authentication status for the agent.

Use this to verify whether you are logged in and which account is active.`,
	RunE: func(cmd *cobra.Command, args []string) error {
		fmt.Fprintln(os.Stderr, ui.Success("✓")+" Paper agent started.")
		return nil
	},
}

func init() {
	agentCmd.AddCommand(startCmd)
}
