// Package config provides configuration loading and initialization.
package config

import (
	"errors"

	"github.com/sonomandeep/containers/agent/internal/ui"
	"github.com/spf13/viper"
)

func InitConfig() error {
	viper.Reset()

	configDir, err := GetConfigDirPath()
	if err != nil {
		return ui.Error{
			Title:   "Unable to resolve config directory.",
			Details: []string{err.Error()},
			Cause:   err,
		}
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
			return ui.Error{
				Title: "Config file not found.",
				Fields: []ui.Field{
					{Label: "Searched in", Value: filePath},
				},
				Hints: []ui.Hint{
					{
						Prefix:  "Run ",
						Command: "agent init",
						Suffix:  " to create a new config file.",
					},
				},
				Cause: err,
			}
		}

		return ui.Error{
			Title: "Failed to read config file.",
			Fields: []ui.Field{
				{Label: "Path", Value: filePath},
			},
			Details: []string{err.Error()},
			Hints: []ui.Hint{
				{Text: "Check permissions and YAML syntax."},
			},
			Cause: err,
		}
	}

	return nil
}
