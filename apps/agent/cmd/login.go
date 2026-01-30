package cmd

import (
	"fmt"
	urlpkg "net/url"
	"os"

	"github.com/sonomandeep/containers/agent/internal/auth"
	"github.com/spf13/cobra"
)

var loginCmd = &cobra.Command{
	Use:   "login",
	Short: "Sign in to the agent",
	Long: `Sign in to the agent with your account.

This command is a placeholder for the login flow.`,
	RunE: func(cmd *cobra.Command, args []string) error {
		url, code, err := auth.GetLoginCode()
		if err != nil {
			return err
		}

		loginURL := ""
		parsedURL, err := urlpkg.Parse(url)
		if err == nil {
			query := parsedURL.Query()
			query.Set("user_code", code)
			parsedURL.RawQuery = query.Encode()
			loginURL = parsedURL.String()
		} else {
			loginURL = fmt.Sprintf("%s?user_code=%s", url, urlpkg.QueryEscape(code))
		}

		fmt.Fprintln(os.Stderr, "Agent Login")
		fmt.Fprintln(os.Stderr)
		fmt.Fprintln(os.Stderr, "Open: "+loginURL)
		fmt.Fprintln(os.Stderr, "Code: "+code)

		return nil
	},
}

func init() {
	authCmd.AddCommand(loginCmd)
}
