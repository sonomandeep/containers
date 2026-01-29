// Package config provides configuration loading and initialization.
package config

import (
	"errors"
	"fmt"
	"os"

	"github.com/sonomandeep/containers/agent/internal/ui"
	"github.com/spf13/viper"
)

func InitConfig() {
	viper.Reset()

	configDir, err := getConfigDirPath()
	if err != nil {
		fmt.Printf("unable to resolve config directory: %s", err)
		os.Exit(1)
	}

	viper.SetConfigName(defaultConfigFileName)
	viper.SetConfigType(defaultConfigFileType)
	viper.AddConfigPath(configDir)

	readConfig(getConfigFilePath(configDir))
}

func readConfig(filePath string) {
	ui := ui.New()

	var notFound viper.ConfigFileNotFoundError
	if err := viper.ReadInConfig(); err != nil {
		if errors.As(err, &notFound) {
			fmt.Println(ui.ErrorBox(
				ui.ErrTitle.Render("Config file not found."),
				ui.KV("Searched in", filePath),
				"",
				"Run "+ui.Emph.Render("agent init")+" to create a new config file.",
			))
			os.Exit(1)
		}

		fmt.Println(ui.ErrorBox(
			ui.ErrTitle.Render("Failed to read config file."),
			ui.KV("Path", filePath),
			"",
			ui.Muted.Render(err.Error()),
			"",
			"Check permissions and YAML syntax.",
		))
		os.Exit(1)
	}
}
