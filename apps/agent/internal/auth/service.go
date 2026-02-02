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

const (
	deviceGrantType           = "urn:ietf:params:oauth:grant-type:device_code"
	defaultPollingInterval    = 5 * time.Second
	defaultDeviceCodeExpires  = 30 * time.Minute
	devicePollSlowdownBackoff = 5 * time.Second
)

type DeviceAuthStatus string

const (
	DeviceAuthUnknown    DeviceAuthStatus = "unknown"
	DeviceAuthAuthorized DeviceAuthStatus = "authorized"
	DeviceAuthDenied     DeviceAuthStatus = "denied"
	DeviceAuthExpired    DeviceAuthStatus = "expired"
)

type DeviceCode struct {
	DeviceCode              string `json:"device_code"`
	UserCode                string `json:"user_code"`
	VerificationURI         string `json:"verification_uri"`
	VerificationURIComplete string `json:"verification_uri_complete"`
	ExpiresIn               int    `json:"expires_in"`
	Interval                int    `json:"interval"`
}

type deviceCodeRequest struct {
	ClientID string `json:"client_id"`
}

type deviceTokenRequest struct {
	GrantType  string `json:"grant_type"`
	DeviceCode string `json:"device_code"`
	ClientID   string `json:"client_id"`
}

type deviceTokenResponse struct {
	AccessToken      string `json:"access_token"`
	ExpiresIn        int    `json:"expires_in"`
	TokenType        string `json:"token_type"`
	RefreshToken     string `json:"refresh_token"`
	Scope            string `json:"scope"`
	Error            string `json:"error"`
	ErrorDescription string `json:"error_description"`
	ErrorURI         string `json:"error_uri"`
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

func GetLoginCode() (DeviceCode, error) {
	client := &http.Client{Timeout: 10 * time.Second}
	cfg := config.Get()
	if strings.TrimSpace(cfg.APIURL) == "" {
		return DeviceCode{}, errors.New("missing api url")
	}
	if strings.TrimSpace(cfg.ClientID) == "" {
		return DeviceCode{}, errors.New("missing client id")
	}
	u, err := url.Parse(cfg.APIURL)
	if err != nil {
		return DeviceCode{}, err
	}

	u.Path = "/api/auth/device/code"
	requestURL := u.String()

	payload := deviceCodeRequest{
		ClientID: cfg.ClientID,
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return DeviceCode{}, err
	}

	req, err := http.NewRequest(
		"POST",
		requestURL,
		bytes.NewBuffer(jsonPayload),
	)
	if err != nil {
		return DeviceCode{}, err
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return DeviceCode{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, readErr := io.ReadAll(resp.Body)
		if readErr != nil {
			return DeviceCode{}, fmt.Errorf("status %d", resp.StatusCode)
		}
		return DeviceCode{}, fmt.Errorf("status %d: %s", resp.StatusCode, strings.TrimSpace(string(body)))
	}

	var result DeviceCode
	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		return DeviceCode{}, err
	}

	return result, nil
}

func PollDeviceToken(deviceCode string, initialInterval int, expiresIn int) (DeviceAuthStatus, error) {
	if strings.TrimSpace(deviceCode) == "" {
		return DeviceAuthUnknown, errors.New("missing device code")
	}

	pollingInterval := time.Duration(initialInterval) * time.Second
	if pollingInterval <= 0 {
		pollingInterval = defaultPollingInterval
	}

	deviceCodeTTL := time.Duration(expiresIn) * time.Second
	if deviceCodeTTL <= 0 {
		deviceCodeTTL = defaultDeviceCodeExpires
	}
	deadline := time.Now().Add(deviceCodeTTL)

	for {
		if time.Now().After(deadline) {
			return DeviceAuthExpired, nil
		}

		result, err := requestDeviceToken(deviceCode)
		if err != nil {
			return DeviceAuthUnknown, err
		}

		if result.AccessToken != "" {
			expires := result.ExpiresIn
			if expires <= 0 {
				expires = 1
			}
			if err := saveAuthToken(result.AccessToken, expires); err != nil {
				return DeviceAuthUnknown, err
			}
			return DeviceAuthAuthorized, nil
		}

		if result.Error != "" {
			switch result.Error {
			case "authorization_pending":
			case "slow_down":
				pollingInterval += devicePollSlowdownBackoff
			case "access_denied":
				return DeviceAuthDenied, nil
			case "expired_token":
				return DeviceAuthExpired, nil
			case "invalid_grant":
				return DeviceAuthUnknown, errors.New("invalid device code or client id")
			default:
				if result.ErrorDescription != "" {
					return DeviceAuthUnknown, fmt.Errorf("device token error: %s", result.ErrorDescription)
				}
				return DeviceAuthUnknown, fmt.Errorf("device token error: %s", result.Error)
			}
		} else {
			return DeviceAuthUnknown, errors.New("unexpected device token response")
		}

		time.Sleep(pollingInterval)
	}
}

func requestDeviceToken(deviceCode string) (deviceTokenResponse, error) {
	client := &http.Client{Timeout: 10 * time.Second}
	cfg := config.Get()
	if strings.TrimSpace(cfg.APIURL) == "" {
		return deviceTokenResponse{}, errors.New("missing api url")
	}
	if strings.TrimSpace(cfg.ClientID) == "" {
		return deviceTokenResponse{}, errors.New("missing client id")
	}
	u, err := url.Parse(cfg.APIURL)
	if err != nil {
		return deviceTokenResponse{}, err
	}

	u.Path = "/api/auth/device/token"
	requestURL := u.String()

	payload := deviceTokenRequest{
		GrantType:  deviceGrantType,
		DeviceCode: deviceCode,
		ClientID:   cfg.ClientID,
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return deviceTokenResponse{}, err
	}

	req, err := http.NewRequest(
		"POST",
		requestURL,
		bytes.NewBuffer(jsonPayload),
	)
	if err != nil {
		return deviceTokenResponse{}, err
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return deviceTokenResponse{}, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return deviceTokenResponse{}, err
	}

	var result deviceTokenResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return deviceTokenResponse{}, fmt.Errorf("decode device token response: %w", err)
	}

	if resp.StatusCode != http.StatusOK && result.Error == "" {
		return deviceTokenResponse{}, fmt.Errorf("status %d: %s", resp.StatusCode, strings.TrimSpace(string(body)))
	}

	return result, nil
}

func saveAuthToken(token string, expiresIn int) error {
	if token == "" {
		return errors.New("missing access token")
	}
	if expiresIn <= 0 {
		return errors.New("invalid expires_in")
	}

	path, err := getAuthFilePath()
	if err != nil {
		return err
	}

	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}

	payload := auth{
		Token:     token,
		ExpiresIn: expiresIn,
	}

	data, err := yaml.Marshal(payload)
	if err != nil {
		return err
	}

	return os.WriteFile(path, data, 0o600)
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
	requestURL := u.String()

	req, err := http.NewRequest(
		"GET",
		requestURL,
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
