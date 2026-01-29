// Package config
package config

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"

	"github.com/charmbracelet/lipgloss"
	"github.com/spf13/viper"
)

const (
	defaultConfigDirName  = "mando.sh"
	defaultConfigFileName = "config"
	defaultConfigFileType = "yaml"
)

func InitConfig() {
	viper.Reset()

	configDir, err := getConfigDir()
	if err != nil {
		fmt.Printf("unable to resolve config directory: %s", err)
		os.Exit(1)
	}

	viper.SetConfigName(defaultConfigFileName)
	viper.SetConfigType(defaultConfigFileType)
	viper.AddConfigPath(configDir)

	readConfig(configFilePath(configDir))
}

func readConfig(filePath string) {
	containerStyle := lipgloss.NewStyle().Padding(1, 0)

	cmdStyle := lipgloss.NewStyle().
		Foreground(lipgloss.Color("12")).
		Bold(true)

	errorStyle := lipgloss.NewStyle().
		Foreground(lipgloss.Color("9")).
		Bold(true)

	pathStyle := lipgloss.NewStyle().
		Foreground(lipgloss.Color("244")).
		Italic(true)

	detailStyle := lipgloss.NewStyle().
		Foreground(lipgloss.Color("241"))

	var fileLookupError viper.ConfigFileNotFoundError
	if err := viper.ReadInConfig(); err != nil {
		if errors.As(err, &fileLookupError) {
			message := lipgloss.JoinVertical(
				lipgloss.Left,

				errorStyle.Render("Config file not found."),
				pathStyle.Render("Searched in: "+filePath),
				"",
				fmt.Sprintf(
					"Run %s to create a new config file.",
					cmdStyle.Render("agent init"),
				),
			)

			fmt.Println(containerStyle.Render(message))

			os.Exit(1)
		}

		message := lipgloss.JoinVertical(
			lipgloss.Left,

			errorStyle.Render("Failed to read config file."),
			pathStyle.Render("Path: "+filePath),
			"",
			detailStyle.Render(err.Error()),
			"",
			"Check permissions and YAML syntax.",
		)

		fmt.Println(containerStyle.Render(message))

		os.Exit(1)

	}
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
