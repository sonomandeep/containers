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

func WriteDefaultConfig(overwrite bool) error {
	configDirPath, err := getConfigDirPath()
	if err != nil {
		return err
	}
	if err = os.MkdirAll(configDirPath, 0o755); err != nil {
		return err
	}
	cfg := NewConfig("https://api.paper.sh", "agent")
	data, err := yaml.Marshal(cfg)
	if err != nil {
		return err
	}
	configFilePath := getConfigFilePath(configDirPath)

	flags := os.O_RDWR | os.O_CREATE
	if !overwrite {
		flags |= os.O_EXCL
	} else {
		flags |= os.O_TRUNC
	}

	file, err := os.OpenFile(configFilePath, flags, 0666)
	if err != nil {
		return err
	}
	defer file.Close()

	if _, err := file.Write(data); err != nil {
		return err
	}

	return nil
}

func getConfigDirPath() (string, error) {
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

// func WriteDefaultConfig() (string, bool, error) {
// 	configDir, err := getConfigDir()
// 	if err != nil {
// 		return "", false, err
// 	}
//
// 	if err := os.MkdirAll(configDir, 0o700); err != nil {
// 		return "", false, err
// 	}
//
// 	path := configFilePath(configDir)
// 	file, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0o600)
// 	if err != nil {
// 		if errors.Is(err, os.ErrExist) {
// 			return path, false, nil
// 		}
//
// 		return path, false, err
// 	}
//
// 	if _, err := file.WriteString(""); err != nil {
// 		_ = file.Close()
// 		_ = os.Remove(path)
// 		return path, false, err
// 	}
//
// 	if err := file.Close(); err != nil {
// 		return path, false, err
// 	}
//
// 	return path, true, nil
// }
