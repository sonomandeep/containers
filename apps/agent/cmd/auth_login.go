package cmd

import "github.com/spf13/cobra"

var authLoginCmd = &cobra.Command{
	Use:   "login",
	Short: "Log in via device code",
	Args:  cobra.NoArgs,
	Run: func(cmd *cobra.Command, args []string) {
		cmd.Println("auth login: not implemented yet")
	},
}

func init() {
	authCmd.AddCommand(authLoginCmd)
}
