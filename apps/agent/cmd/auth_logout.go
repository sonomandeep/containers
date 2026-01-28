package cmd

import "github.com/spf13/cobra"

var authLogoutCmd = &cobra.Command{
	Use:   "logout",
	Short: "Log out and clear local credentials",
	Args:  cobra.NoArgs,
	Run: func(cmd *cobra.Command, args []string) {
		cmd.Println("auth logout: not implemented yet")
	},
}

func init() {
	authCmd.AddCommand(authLogoutCmd)
}
