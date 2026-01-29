// Package config
package config

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"

	"github.com/spf13/viper"
)

const (
	defaultConfigDirName  = "mando.sh"
	defaultConfigFileName = "config"
	defaultConfigFileType = "yaml"
)

func InitConfig() error {
	viper.Reset()

	configDir, err := getConfigDir()
	if err != nil {
		return fmt.Errorf("unable to resolve config directory: %w", err)
	}

	viper.SetConfigName(defaultConfigFileName)
	viper.SetConfigType(defaultConfigFileType)
	viper.AddConfigPath(configDir)

	return readConfig(configFilePath(configDir))
}

func readConfig(filePath string) error {
	var fileLookupError viper.ConfigFileNotFoundError
	if err := viper.ReadInConfig(); err != nil {
		if errors.As(err, &fileLookupError) {
			return fmt.Errorf(
				"config file not found at %s. You likely haven't run `agent init` yet",
				filePath,
			)
		}

		return fmt.Errorf(
			"failed to read config file at %s: %w. Check permissions and YAML syntax",
			filePath,
			err,
		)
	}

	return nil
}

func getConfigDir() (string, error) {
	defaultDir, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}

	dir := filepath.Join(defaultDir, defaultConfigDirName)

	return dir, nil
}

func configFilePath(configDir string) string {
	return filepath.Join(configDir, defaultConfigFileName+"."+defaultConfigFileType)
}
