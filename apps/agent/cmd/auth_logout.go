package cmd

import (
	"errors"
	"fmt"
	"os"
	"runtime"
	"strings"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var authLogoutCmd = &cobra.Command{
	Use:   "logout",
	Short: "Log out and clear local credentials",
	Args:  cobra.NoArgs,
	RunE: func(cmd *cobra.Command, args []string) error {
		useColor := shouldUseColor()
		wasLoggedIn, err := clearAuthCredentials()
		if err != nil {
			return err
		}

		if !wasLoggedIn {
			cmd.Println(colorize("Already logged out.", colorDim, useColor))
			return nil
		}

		cmd.Println(colorize("Logged out.", colorGreen, useColor))
		return nil
	},
}

func init() {
	authCmd.AddCommand(authLogoutCmd)
}

func clearAuthCredentials() (bool, error) {
	token := strings.TrimSpace(viper.GetString("auth.token"))
	refreshToken := strings.TrimSpace(viper.GetString("auth.refresh_token"))
	tokenType := strings.TrimSpace(viper.GetString("auth.token_type"))
	expiresAt := strings.TrimSpace(viper.GetString("auth.expires_at"))
	hasCredentials := token != "" || refreshToken != "" || tokenType != "" || expiresAt != ""

	configPath, err := configFilePathForWrite()
	if err != nil {
		return hasCredentials, err
	}

	configExists := true
	if _, err := os.Stat(configPath); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			configExists = false
		} else {
			return hasCredentials, fmt.Errorf("stat config: %w", err)
		}
	}

	if !hasCredentials && !configExists {
		return false, nil
	}

	if err := ensureConfigDir(configPath); err != nil {
		return hasCredentials, err
	}

	viper.Set("auth.token", "")
	viper.Set("auth.refresh_token", "")
	viper.Set("auth.token_type", "")
	viper.Set("auth.expires_at", "")

	if err := viper.WriteConfigAs(configPath); err != nil {
		return hasCredentials, fmt.Errorf("write config: %w", err)
	}

	if err := os.Chmod(configPath, 0o600); err != nil && runtime.GOOS != "windows" {
		return hasCredentials, fmt.Errorf("set config permissions: %w", err)
	}

	return hasCredentials, nil
}
