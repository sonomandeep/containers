// Package auth provides services for login, logout, and status.
package auth

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
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

type codeResponse struct {
	DeviceCode              string `json:"device_code"`
	UserCode                string `json:"user_code"`
	VerificationURI         string `json:"verification_uri"`
	VerificationURIComplete string `json:"verification_uri_complete"`
	ExpiresIn               int    `json:"expires_in"`
	Interval                int    `json:"interval"`
}

func GetAuthStatus() (bool, error) {
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

func GetLoginCode() (string, string, error) {
	client := &http.Client{Timeout: 10 * time.Second}
	u, err := url.Parse(config.Get().APIURL)
	if err != nil {
		return "", "", err
	}

	u.Path = "/api/auth/device/code"
	requestURL := u.String()

	payload := map[string]any{
		"client_id": config.Get().ClientID,
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return "", "", err
	}

	req, err := http.NewRequest(
		"POST",
		requestURL,
		bytes.NewBuffer(jsonPayload),
	)
	if err != nil {
		return "", "", err
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return "", "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", "", fmt.Errorf("status %d", resp.StatusCode)
	}

	var result codeResponse
	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		return "", "", err
	}

	return result.VerificationURI, result.UserCode, nil
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
	u, err := url.Parse(config.Get().APIURL)
	if err != nil {
		return false, err
	}

	u.Path = "/api/auth/get-session"
	getSessionUrl := u.String()

	req, err := http.NewRequest(
		"GET",
		getSessionUrl,
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
