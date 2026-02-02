// Package config provides configuration loading and initialization.
package config

import (
	"errors"
	"fmt"

	"github.com/spf13/viper"
)

type Config struct {
	APIURL   string `yaml:"api_url"`
	ClientID string `yaml:"client_id"`
}

func New(apiURL string, clientID string) *Config {
	return &Config{
		APIURL:   apiURL,
		ClientID: clientID,
	}
}

func Get() *Config {
	return &Config{
		APIURL:   viper.GetString("api_url"),
		ClientID: viper.GetString("client_id"),
	}
}

func InitConfig() error {
	viper.Reset()

	configDir, err := GetConfigDirPath()
	if err != nil {
		return fmt.Errorf("unable to resolve config directory: %w", err)
	}

	viper.SetConfigName(defaultConfigFileName)
	viper.SetConfigType(defaultConfigFileType)
	viper.AddConfigPath(configDir)

	return readConfig(getConfigFilePath(configDir))
}

func readConfig(filePath string) error {
	var notFound viper.ConfigFileNotFoundError
	if err := viper.ReadInConfig(); err != nil {
		if errors.As(err, &notFound) {
			return fmt.Errorf("config file not found at %s (run `agent init`)", filePath)
		}

		return fmt.Errorf("failed to read config file at %s: %w", filePath, err)
	}

	return nil
}
