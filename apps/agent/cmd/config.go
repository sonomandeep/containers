package cmd

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"

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

		fmt.Fprintln(os.Stderr, "Failed to read config:", err)
		os.Exit(1)
	}
}

func defaultConfigPath() (string, error) {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return "", fmt.Errorf("resolve user config directory: %w", err)
	}

	return filepath.Join(configDir, defaultConfigDirName, defaultConfigFileName), nil
}

func configFlagHelp() string {
	configPath, err := defaultConfigPath()
	if err != nil {
		return "config file"
	}

	return fmt.Sprintf("config file (default: %s)", configPath)
}
