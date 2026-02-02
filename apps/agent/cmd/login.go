package cmd

import (
	"context"
	"fmt"
	urlpkg "net/url"
	"os"

	"github.com/sonomandeep/containers/agent/internal/auth"
	"github.com/sonomandeep/containers/agent/internal/ui"
	"github.com/spf13/cobra"
	"github.com/yarlson/pin"
)

var loginCmd = &cobra.Command{
	Use:   "login",
	Short: "Sign in to the agent",
	Long:  `Sign in to the agent with your account using device authorization.`,
	RunE: func(cmd *cobra.Command, args []string) error {
		deviceCode, err := auth.GetLoginCode()
		if err != nil {
			return err
		}

		loginURL := deviceCode.VerificationURIComplete
		if loginURL == "" {
			parsedURL, err := urlpkg.Parse(deviceCode.VerificationURI)
			if err == nil {
				query := parsedURL.Query()
				query.Set("user_code", deviceCode.UserCode)
				parsedURL.RawQuery = query.Encode()
				loginURL = parsedURL.String()
			} else {
				loginURL = fmt.Sprintf(
					"%s?user_code=%s",
					deviceCode.VerificationURI,
					urlpkg.QueryEscape(deviceCode.UserCode),
				)
			}
		}

		fmt.Fprintln(os.Stderr, "Agent Login")
		fmt.Fprintln(os.Stderr)
		fmt.Fprintln(os.Stderr, "Open: "+loginURL)
		fmt.Fprintln(os.Stderr, "Code: "+deviceCode.UserCode)
		fmt.Fprintln(os.Stderr)
		spinnerMessage := ui.Muted("Waiting for confirmation...")
		spinner := pin.New(
			spinnerMessage,
			pin.WithSpinnerColor(pin.ColorGray),
			pin.WithWriter(os.Stderr),
		)
		cancel := spinner.Start(context.Background())
		defer cancel()

		_, err = auth.PollDeviceToken(
			deviceCode.DeviceCode,
			deviceCode.Interval,
			deviceCode.ExpiresIn,
		)
		if err != nil {
			return err
		}

		spinner.Stop("Logged in successfully.")

		return nil
	},
}

func init() {
	authCmd.AddCommand(loginCmd)
}
