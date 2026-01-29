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
	ui := newUI()

	var notFound viper.ConfigFileNotFoundError
	if err := viper.ReadInConfig(); err != nil {
		if errors.As(err, &notFound) {
			lines := []string{
				ui.errTitle.Render("Config file not found."),
				ui.kv("Searched in", filePath),
				"",
				"Run " + ui.emph.Render("agent init") + " to create a new config file.",
			}
			fmt.Println(ui.box.Render(lipgloss.JoinVertical(lipgloss.Left, lines...)))
			os.Exit(1)
		}

		lines := []string{
			ui.errTitle.Render("Failed to read config file."),
			ui.kv("Path", filePath),
			"",
			ui.muted.Render(err.Error()),
		}
		fmt.Println(ui.box.Render(lipgloss.JoinVertical(lipgloss.Left, lines...)))
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

type uiStyles struct {
	box      lipgloss.Style
	errTitle lipgloss.Style
	label    lipgloss.Style
	value    lipgloss.Style
	emph     lipgloss.Style
	muted    lipgloss.Style
}

func newUI() uiStyles {
	return uiStyles{
		box:      lipgloss.NewStyle().Padding(1, 2),
		errTitle: lipgloss.NewStyle().Foreground(lipgloss.Color("9")).Bold(true),
		label:    lipgloss.NewStyle().Foreground(lipgloss.Color("244")),
		value:    lipgloss.NewStyle().Foreground(lipgloss.Color("252")),
		emph:     lipgloss.NewStyle().Foreground(lipgloss.Color("205")).Bold(true),
		muted:    lipgloss.NewStyle().Foreground(lipgloss.Color("241")),
	}
}

func (ui uiStyles) kv(k, v string) string {
	return ui.label.Render(k+": ") + ui.value.Render(v)
}
