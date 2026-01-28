package cmd

import "github.com/spf13/cobra"

var authStatusCmd = &cobra.Command{
	Use:   "status",
	Short: "Show current authentication status",
	Args:  cobra.NoArgs,
	Run: func(cmd *cobra.Command, args []string) {
		cmd.Println("auth status: not implemented yet")
	},
}

func init() {
	authCmd.AddCommand(authStatusCmd)
}
