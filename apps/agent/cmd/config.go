package cmd

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

const (
	defaultConfigFileName = "containers.yaml"
	defaultConfigDirName  = "mando.sh"
)

var cfgFile string

func init() {
	cobra.OnInitialize(initConfig)
	rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", configFlagHelp())
}

func initConfig() {
	setDefaults()
	enableEnvOverrides()

	if cfgFile != "" {
		viper.SetConfigFile(cfgFile)
	} else {
		configPath, err := defaultConfigPath()
		if err != nil {
			fmt.Fprintln(os.Stderr, "Unable to resolve config path:", err)
			os.Exit(1)
		}
		viper.SetConfigFile(configPath)
	}

	if err := viper.ReadInConfig(); err != nil {
		var notFoundError viper.ConfigFileNotFoundError
		if errors.As(err, &notFoundError) {
			return
		}
		if errors.Is(err, os.ErrNotExist) {
			return
		}

		fmt.Fprintln(os.Stderr, "Failed to read config:", err)
		os.Exit(1)
	}
}

func setDefaults() {
	viper.SetDefault("auth.url", defaultAuthURL)
	viper.SetDefault("auth.client_id", defaultClientID)
	viper.SetDefault("auth.scope", defaultScope)
	viper.SetDefault("auth.timeout", defaultTimeout)
}

func enableEnvOverrides() {
	viper.SetEnvPrefix("containers")
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	viper.AutomaticEnv()
}

func defaultConfigPath() (string, error) {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return "", fmt.Errorf("resolve user config directory: %w", err)
	}

	return filepath.Join(configDir, defaultConfigDirName, defaultConfigFileName), nil
}

func configFilePathForWrite() (string, error) {
	if cfgFile != "" {
		return cfgFile, nil
	}

	if configFile := viper.ConfigFileUsed(); configFile != "" {
		return configFile, nil
	}

	return defaultConfigPath()
}

func ensureConfigDir(configPath string) error {
	configDir := filepath.Dir(configPath)
	if configDir == "." || configDir == "" {
		return nil
	}

	if err := os.MkdirAll(configDir, 0o700); err != nil {
		return fmt.Errorf("create config directory: %w", err)
	}

	return nil
}

func configFlagHelp() string {
	configPath, err := defaultConfigPath()
	if err != nil {
		return "config file"
	}

	return fmt.Sprintf("config file (default: %s)", configPath)
}
