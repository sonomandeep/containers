package cmd

import (
	"strings"
	"time"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var authStatusCmd = &cobra.Command{
	Use:   "status",
	Short: "Show current authentication status",
	Args:  cobra.NoArgs,
	Run: func(cmd *cobra.Command, args []string) {
		useColor := shouldUseColor()
		token := strings.TrimSpace(viper.GetString("auth.token"))
		expiresAtRaw := strings.TrimSpace(viper.GetString("auth.expires_at"))

		cmd.Println(colorize("Containers Agent - Auth Status", colorBold, useColor))
		cmd.Println("")

		if token == "" {
			cmd.Println(colorize("Status: Not logged in", colorDim, useColor))
			cmd.Println("Run `agent auth login` to connect this device.")
			return
		}

		cmd.Printf("Status: %s\n", colorize("Logged in", colorGreen, useColor))

		if expiresAtRaw == "" {
			cmd.Println("Expires: unknown")
			return
		}

		expiresAt, err := time.Parse(time.RFC3339, expiresAtRaw)
		if err != nil {
			cmd.Printf("Expires: invalid value (%s)\n", expiresAtRaw)
			return
		}

		expiresAt = expiresAt.Local()
		remaining := time.Until(expiresAt).Truncate(time.Second)
		if remaining <= 0 {
			cmd.Printf("Expires: %s (expired)\n", expiresAt.Format(time.RFC1123))
			return
		}

		cmd.Printf("Expires: %s (in %s)\n", expiresAt.Format(time.RFC1123), remaining)
	},
}

func init() {
	authCmd.AddCommand(authStatusCmd)
}
