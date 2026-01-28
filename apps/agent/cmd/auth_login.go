package cmd

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/spf13/cobra"
)

const (
	defaultAuthURL  = "http://paper.sh:9999/api/auth"
	defaultClientID = "containers-agent"
	defaultScope    = ""
	defaultTimeout  = 10 * time.Second
)

var authLoginAuthURL string

type deviceCodeRequest struct {
	ClientID string `json:"client_id"`
	Scope    string `json:"scope,omitempty"`
}

type deviceCodeResponse struct {
	DeviceCode              string `json:"device_code"`
	UserCode                string `json:"user_code"`
	VerificationURI         string `json:"verification_uri"`
	VerificationURIComplete string `json:"verification_uri_complete"`
	ExpiresIn               int    `json:"expires_in"`
	Interval                int    `json:"interval"`
}

var authLoginCmd = &cobra.Command{
	Use:   "login",
	Short: "Log in via device code",
	Args:  cobra.NoArgs,
	RunE: func(cmd *cobra.Command, args []string) error {
		useColor := shouldUseColor()
		response, err := requestDeviceCode(authLoginAuthURL, defaultClientID, defaultScope, defaultTimeout)
		if err != nil {
			return err
		}

		loginURL := response.VerificationURIComplete
		if loginURL == "" {
			loginURL = response.VerificationURI
		}

		if loginURL == "" || response.UserCode == "" {
			return fmt.Errorf("invalid device code response from server")
		}

		cmd.Println(colorize("Containers Agent - Device Login", colorBold, useColor))
		cmd.Println("")
		cmd.Println(colorize("Open your browser and authorize this device with the code.", colorDim, useColor))
		cmd.Println("")
		cmd.Printf("Please visit: %s\n", colorize(loginURL, colorBlue, useColor))
		cmd.Printf("Code: %s\n", colorize(response.UserCode, colorGreen, useColor))

		return nil
	},
}

func init() {
	authLoginCmd.Flags().StringVar(&authLoginAuthURL, "auth-url", defaultAuthURL, "Base URL for the auth API")
	authCmd.AddCommand(authLoginCmd)
}

func requestDeviceCode(authURL string, clientID string, scope string, timeout time.Duration) (deviceCodeResponse, error) {
	authURL = strings.TrimSpace(authURL)
	if authURL == "" {
		return deviceCodeResponse{}, fmt.Errorf("auth URL is required")
	}

	clientID = strings.TrimSpace(clientID)
	if clientID == "" {
		return deviceCodeResponse{}, fmt.Errorf("client ID is required")
	}

	endpoint := strings.TrimRight(authURL, "/") + "/device/code"
	requestBody := deviceCodeRequest{
		ClientID: clientID,
		Scope:    strings.TrimSpace(scope),
	}

	payload, err := json.Marshal(requestBody)
	if err != nil {
		return deviceCodeResponse{}, fmt.Errorf("failed to encode request: %w", err)
	}

	request, err := http.NewRequest(http.MethodPost, endpoint, bytes.NewReader(payload))
	if err != nil {
		return deviceCodeResponse{}, fmt.Errorf("failed to create request: %w", err)
	}
	request.Header.Set("Content-Type", "application/json")

	httpClient := &http.Client{
		Timeout: timeout,
	}

	response, err := httpClient.Do(request)
	if err != nil {
		return deviceCodeResponse{}, fmt.Errorf("device code request failed: %w", err)
	}
	defer response.Body.Close()

	body, err := io.ReadAll(response.Body)
	if err != nil {
		return deviceCodeResponse{}, fmt.Errorf("failed to read response: %w", err)
	}

	if response.StatusCode < http.StatusOK || response.StatusCode >= http.StatusMultipleChoices {
		message := strings.TrimSpace(string(body))
		if message == "" {
			message = response.Status
		}
		return deviceCodeResponse{}, fmt.Errorf("device code request failed: %s", message)
	}

	var decoded deviceCodeResponse
	if err := json.Unmarshal(body, &decoded); err != nil {
		return deviceCodeResponse{}, fmt.Errorf("failed to decode response: %w", err)
	}

	return decoded, nil
}

const (
	colorBold  = "\033[1m"
	colorDim   = "\033[90m"
	colorBlue  = "\033[34m"
	colorGreen = "\033[32m"
	colorReset = "\033[0m"
)

func shouldUseColor() bool {
	_, disabled := os.LookupEnv("NO_COLOR")
	return !disabled
}

func colorize(value string, color string, enabled bool) string {
	if !enabled {
		return value
	}
	return color + value + colorReset
}
