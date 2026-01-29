// Package config
package config

import (
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/spf13/viper"
)

const (
	defaultConfigDirName  = "mando.sh"
	defaultConfigFileName = "config"
	defaultConfigFileType = "yaml"
)

func InitConfig() {
	configDir, err := getConfigDir()
	if err != nil {
		log.Fatalf("error reading default dir path: %s", err)
	}

	viper.SetConfigName(defaultConfigFileName)
	viper.SetConfigType(defaultConfigFileType)
	viper.AddConfigPath(configDir)

	readConfig()
}

func readConfig() {
	var fileLookupError viper.ConfigFileNotFoundError
	if err := viper.ReadInConfig(); err != nil {
		if errors.As(err, &fileLookupError) {
			fmt.Fprintln(os.Stderr, "config file not found")
			os.Exit(1)
		} else {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
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
