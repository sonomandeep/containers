package config

import (
	"os"
	"path/filepath"
	"strings"

	"go.yaml.in/yaml/v3"
)

const (
	defaultConfigDirName  = "mando.sh"
	defaultConfigFileName = "config"
	defaultConfigFileType = "yaml"
	defaultApiUrl         = "https://paper.mando.sh/api"
	defaultClientID       = "sh.mando.paper.cli"
)

func DefaultAPIURL() string {
	return defaultApiUrl
}

func WriteDefaultConfig(overwrite bool, apiURL string) (string, error) {
	configDirPath, err := GetConfigDirPath()
	if err != nil {
		return "", err
	}
	configFilePath := getConfigFilePath(configDirPath)

	if err = os.MkdirAll(configDirPath, 0o755); err != nil {
		return configFilePath, err
	}
	normalizedAPIURL := strings.TrimSpace(apiURL)
	if normalizedAPIURL == "" {
		normalizedAPIURL = defaultApiUrl
	}

	cfg := New(normalizedAPIURL)
	data, err := yaml.Marshal(cfg)
	if err != nil {
		return configFilePath, err
	}

	flags := os.O_RDWR | os.O_CREATE
	if !overwrite {
		flags |= os.O_EXCL
	} else {
		flags |= os.O_TRUNC
	}

	file, err := os.OpenFile(configFilePath, flags, 0666)
	if err != nil {
		return configFilePath, err
	}
	defer file.Close()

	if _, err := file.Write(data); err != nil {
		return configFilePath, err
	}

	return configFilePath, nil
}

func GetConfigDirPath() (string, error) {
	defaultDir, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}

	dir := filepath.Join(defaultDir, defaultConfigDirName)

	return dir, nil
}

func getConfigFilePath(configDirPath string) string {
	return filepath.Join(configDirPath, defaultConfigFileName+"."+defaultConfigFileType)
}
