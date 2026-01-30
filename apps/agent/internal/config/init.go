package config

import (
	"os"
	"path/filepath"

	"go.yaml.in/yaml/v3"
)

const (
	defaultConfigDirName  = "mando.sh"
	defaultConfigFileName = "config"
	defaultConfigFileType = "yaml"
)

type Config struct {
	APIURL   string `yaml:"api_url"`
	ClientID string `yaml:"client_id"`
}

func NewConfig(apiURL string, clientID string) *Config {
	return &Config{
		APIURL:   apiURL,
		ClientID: clientID,
	}
}

func WriteDefaultConfig(overwrite bool) (string, error) {
	configDirPath, err := GetConfigDirPath()
	if err != nil {
		return "", err
	}
	configFilePath := getConfigFilePath(configDirPath)

	if err = os.MkdirAll(configDirPath, 0o755); err != nil {
		return configFilePath, err
	}
	cfg := NewConfig("https://api.paper.sh", "agent")
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
