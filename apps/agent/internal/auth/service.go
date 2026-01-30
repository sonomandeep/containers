// Package auth provides services for login, logout, and status.
package auth

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/sonomandeep/containers/agent/internal/config"
	"go.yaml.in/yaml/v3"
)

type auth struct {
	Token     string `yaml:"token"`
	ExpiresIn int    `yaml:"expires_in"`
}

func GetAuthStatus() (bool, error) {
	// [x] 1. leggere il file di auth
	// [x] 2. se non presente uscire con false
	// [x] 3. se errore uscire con errore
	// [ ] 4. se presente il file controllare la validita del token
	// [ ] 5. se valido ritorno true
	// [ ] 6. se non valido cancello e ritorno false

	path, err := getAuthFilePath()
	if err != nil {
		return false, err
	}

	data, err := os.ReadFile(path)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return false, nil
		}

		return false, err
	}

	auth := auth{}
	if err = yaml.Unmarshal([]byte(data), &auth); err != nil {
		return false, err
	}
	if err := auth.validate(); err != nil {
		return false, err
	}

	isValid, err := auth.getSession()
	if err != nil {
		return false, err
	}
	if !isValid {
		if err := deleteAuthFile(path); err != nil {
			return false, err
		}

		return false, nil
	}

	return true, nil
}

func getAuthFilePath() (string, error) {
	configDir, err := config.GetConfigDirPath()
	if err != nil {
		return "", err
	}

	path := filepath.Join(configDir, "auth.yaml")

	return path, nil
}

func deleteAuthFile(path string) error {
	return os.Remove(path)
}

func (a auth) validate() error {
	if a.Token == "" {
		return errors.New("missing token")
	}
	if a.ExpiresIn <= 0 {
		return errors.New("invalid expires_in")
	}

	return nil
}

func (a auth) getSession() (bool, error) {
	client := &http.Client{Timeout: 10 * time.Second}

	req, err := http.NewRequest(
		"GET",
		"http://paper.sh:9999/api/auth/get-session",
		nil,
	)
	if err != nil {
		return false, err
	}

	req.Header.Set("Authorization", "Bearer "+a.Token)

	resp, err := client.Do(req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return false, fmt.Errorf("status %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return false, err
	}

	if strings.TrimSpace(string(body)) == "null" {
		return false, nil
	}

	var tmp map[string]any
	if err := json.Unmarshal(body, &tmp); err != nil {
		return false, err
	}

	return true, nil
}
