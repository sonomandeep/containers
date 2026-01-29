package cmd

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"runtime"
	"strings"
	"sync"
	"time"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

const (
	defaultAuthURL  = "http://paper.sh:9999/api/auth"
	defaultClientID = "containers-agent"
	defaultScope    = ""
	defaultTimeout  = 10 * time.Second
)

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

type deviceTokenRequest struct {
	GrantType  string `json:"grant_type"`
	DeviceCode string `json:"device_code"`
	ClientID   string `json:"client_id"`
}

type deviceTokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token,omitempty"`
	TokenType    string `json:"token_type,omitempty"`
	ExpiresIn    int    `json:"expires_in,omitempty"`
	Scope        string `json:"scope,omitempty"`
}

type deviceTokenError struct {
	Error            string `json:"error"`
	ErrorDescription string `json:"error_description,omitempty"`
	Interval         int    `json:"interval,omitempty"`
}

var authLoginCmd = &cobra.Command{
	Use:   "login",
	Short: "Log in via device code",
	Args:  cobra.NoArgs,
	RunE: func(cmd *cobra.Command, args []string) error {
		useColor := shouldUseColor()
		authURL := strings.TrimSpace(viper.GetString("auth.url"))
		clientID := strings.TrimSpace(viper.GetString("auth.client_id"))
		scope := viper.GetString("auth.scope")
		timeout := viper.GetDuration("auth.timeout")
		if timeout <= 0 {
			timeout = defaultTimeout
		}

		response, err := requestDeviceCode(authURL, clientID, scope, timeout)
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

		cmd.Println("")
		waitingMessage := "Waiting for authorization..."
		if response.ExpiresIn > 0 {
			waitingMessage = fmt.Sprintf("%s (expires in %s)", waitingMessage, formatExpiresIn(response.ExpiresIn))
		}

		stopSpinner := startSpinner(cmd.OutOrStdout(), waitingMessage, useColor)
		token, err := pollForDeviceToken(authURL, clientID, response.DeviceCode, response.Interval, response.ExpiresIn, timeout)
		stopSpinner()
		if err != nil {
			return formatLoginError(err)
		}

		if token.AccessToken == "" {
			return fmt.Errorf("authorization succeeded but no access token was returned")
		}

		if err := saveAuthCredentials(token); err != nil {
			return fmt.Errorf("login succeeded, but failed to save credentials: %w", err)
		}

		cmd.Println(colorize("Login successful.", colorGreen, useColor))

		return nil
	},
}

func init() {
	authLoginCmd.Flags().String("auth-url", defaultAuthURL, "Base URL for the auth API")
	if err := viper.BindPFlag("auth.url", authLoginCmd.Flags().Lookup("auth-url")); err != nil {
		panic(err)
	}
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

func pollForDeviceToken(authURL string, clientID string, deviceCode string, interval int, expiresIn int, timeout time.Duration) (deviceTokenResponse, error) {
	if strings.TrimSpace(deviceCode) == "" {
		return deviceTokenResponse{}, errAuthorizationFailed
	}

	pollInterval := time.Duration(interval) * time.Second
	if pollInterval <= 0 {
		pollInterval = 5 * time.Second
	}

	var deadline time.Time
	if expiresIn > 0 {
		deadline = time.Now().Add(time.Duration(expiresIn) * time.Second)
	}

	for {
		if !deadline.IsZero() && time.Now().After(deadline) {
			return deviceTokenResponse{}, errDeviceCodeExpired
		}

		token, tokenErr, err := requestDeviceToken(authURL, clientID, deviceCode, timeout)
		if err != nil {
			return deviceTokenResponse{}, fmt.Errorf("%w: %s", errAuthorizationRequestFailed, err.Error())
		}

		if tokenErr.Error != "" {
			switch tokenErr.Error {
			case "authorization_pending":
				if tokenErr.Interval > 0 {
					pollInterval = time.Duration(tokenErr.Interval) * time.Second
				}
				time.Sleep(pollInterval)
				continue
			case "slow_down":
				pollInterval += 5 * time.Second
				time.Sleep(pollInterval)
				continue
			case "expired_token":
				return deviceTokenResponse{}, errDeviceCodeExpired
			default:
				if tokenErr.ErrorDescription != "" {
					return deviceTokenResponse{}, fmt.Errorf("%w: %s", errAuthorizationFailed, tokenErr.ErrorDescription)
				}
				return deviceTokenResponse{}, fmt.Errorf("%w: %s", errAuthorizationFailed, tokenErr.Error)
			}
		}

		if token.AccessToken == "" {
			return deviceTokenResponse{}, fmt.Errorf("%w: unexpected response from device token endpoint", errAuthorizationFailed)
		}

		return token, nil
	}
}

func requestDeviceToken(authURL string, clientID string, deviceCode string, timeout time.Duration) (deviceTokenResponse, deviceTokenError, error) {
	endpoint := strings.TrimRight(authURL, "/") + "/device/token"
	requestBody := deviceTokenRequest{
		GrantType:  "urn:ietf:params:oauth:grant-type:device_code",
		DeviceCode: strings.TrimSpace(deviceCode),
		ClientID:   strings.TrimSpace(clientID),
	}

	payload, err := json.Marshal(requestBody)
	if err != nil {
		return deviceTokenResponse{}, deviceTokenError{}, fmt.Errorf("failed to encode request: %w", err)
	}

	request, err := http.NewRequest(http.MethodPost, endpoint, bytes.NewReader(payload))
	if err != nil {
		return deviceTokenResponse{}, deviceTokenError{}, fmt.Errorf("failed to create request: %w", err)
	}
	request.Header.Set("Content-Type", "application/json")

	httpClient := &http.Client{
		Timeout: timeout,
	}

	response, err := httpClient.Do(request)
	if err != nil {
		return deviceTokenResponse{}, deviceTokenError{}, fmt.Errorf("device token request failed: %w", err)
	}
	defer response.Body.Close()

	body, err := io.ReadAll(response.Body)
	if err != nil {
		return deviceTokenResponse{}, deviceTokenError{}, fmt.Errorf("failed to read response: %w", err)
	}

	var tokenErr deviceTokenError
	if err := json.Unmarshal(body, &tokenErr); err == nil && tokenErr.Error != "" {
		return deviceTokenResponse{}, tokenErr, nil
	}

	if response.StatusCode < http.StatusOK || response.StatusCode >= http.StatusMultipleChoices {
		message := strings.TrimSpace(string(body))
		if message == "" {
			message = response.Status
		}
		return deviceTokenResponse{}, deviceTokenError{}, fmt.Errorf("device token request failed: %s", message)
	}

	var token deviceTokenResponse
	if err := json.Unmarshal(body, &token); err != nil {
		return deviceTokenResponse{}, deviceTokenError{}, fmt.Errorf("failed to decode response: %w", err)
	}

	return token, deviceTokenError{}, nil
}

func formatExpiresIn(seconds int) string {
	if seconds <= 0 {
		return "unknown"
	}

	if seconds%60 == 0 {
		minutes := seconds / 60
		if minutes == 1 {
			return "1 minute"
		}
		return fmt.Sprintf("%d minutes", minutes)
	}

	return (time.Duration(seconds) * time.Second).String()
}

func saveAuthCredentials(token deviceTokenResponse) error {
	configPath, err := configFilePathForWrite()
	if err != nil {
		return err
	}

	if err := ensureConfigDir(configPath); err != nil {
		return err
	}

	viper.Set("auth.token", token.AccessToken)
	if token.RefreshToken != "" {
		viper.Set("auth.refresh_token", token.RefreshToken)
	}
	if token.TokenType != "" {
		viper.Set("auth.token_type", token.TokenType)
	}
	if token.ExpiresIn > 0 {
		expiresAt := time.Now().Add(time.Duration(token.ExpiresIn) * time.Second).UTC()
		viper.Set("auth.expires_at", expiresAt.Format(time.RFC3339))
	}

	if err := viper.WriteConfigAs(configPath); err != nil {
		return fmt.Errorf("write config: %w", err)
	}

	if err := os.Chmod(configPath, 0o600); err != nil && runtime.GOOS != "windows" {
		return fmt.Errorf("set config permissions: %w", err)
	}

	return nil
}

var (
	errDeviceCodeExpired          = errors.New("device code expired")
	errAuthorizationFailed        = errors.New("authorization failed")
	errAuthorizationRequestFailed = errors.New("authorization request failed")
)

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

func formatLoginError(err error) error {
	switch {
	case errors.Is(err, errDeviceCodeExpired):
		return fmt.Errorf("Authorization timed out. Run `agent auth login` again to get a new code.")
	case errors.Is(err, errAuthorizationRequestFailed):
		return fmt.Errorf("Unable to reach the auth server. Check the auth URL and try again.")
	case errors.Is(err, errAuthorizationFailed):
		message := strings.TrimPrefix(err.Error(), errAuthorizationFailed.Error())
		message = strings.TrimSpace(strings.TrimPrefix(message, ":"))
		if message != "" {
			return fmt.Errorf("Authorization failed: %s", message)
		}
		return fmt.Errorf("Authorization failed. Please try again.")
	default:
		return err
	}
}

func startSpinner(writer io.Writer, message string, useColor bool) func() {
	stop := make(chan struct{})
	done := make(chan struct{})
	var once sync.Once

	go runSpinner(writer, message, useColor, stop, done)

	return func() {
		once.Do(func() {
			close(stop)
			<-done
		})
	}
}

func runSpinner(writer io.Writer, message string, useColor bool, stop <-chan struct{}, done chan<- struct{}) {
	frames := []string{"|", "/", "-", "\\"}
	ticker := time.NewTicker(120 * time.Millisecond)
	defer ticker.Stop()

	writeSpinnerFrame(writer, frames[0], message, useColor)
	frameIndex := 1

	for {
		select {
		case <-stop:
			clearSpinnerLine(writer)
			close(done)
			return
		case <-ticker.C:
			writeSpinnerFrame(writer, frames[frameIndex%len(frames)], message, useColor)
			frameIndex++
		}
	}
}

func writeSpinnerFrame(writer io.Writer, frame string, message string, useColor bool) {
	line := fmt.Sprintf("%s %s", frame, message)
	fmt.Fprint(writer, "\r"+colorize(line, colorDim, useColor))
}

func clearSpinnerLine(writer io.Writer) {
	fmt.Fprint(writer, "\r\033[2K")
}
