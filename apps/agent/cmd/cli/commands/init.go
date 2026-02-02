package commands

import (
	"bufio"
	"errors"
	"fmt"
	"net/url"
	"os"
	"strings"

	"github.com/sonomandeep/containers/agent/internal/config"
	"github.com/sonomandeep/containers/agent/internal/ui"
	"github.com/spf13/cobra"
)

var initCmd = &cobra.Command{
	Use:   "init",
	Short: "Create the default configuration file",
	Long: `Create a default configuration file in your user config directory.
Example: ~/.config/mando.sh/config.yaml
This command is safe to run multiple times; use --overwrite to replace an existing file.`,
	Args:         cobra.NoArgs,
	SilenceUsage: true,
	RunE: func(cmd *cobra.Command, args []string) error {
		reader := bufio.NewReader(os.Stdin)
		defaultAPIURL := config.DefaultAPIURL()
		useHosted, err := promptYesNo(
			reader,
			fmt.Sprintf("Use hosted API? (%s) [Y/n]: ", defaultAPIURL),
			true,
		)
		if err != nil {
			return err
		}

		apiURL := defaultAPIURL
		if !useHosted {
			apiURL, err = promptURL(reader, "Enter API URL: ")
			if err != nil {
				return err
			}
		}

		overwrite, err := cmd.Flags().GetBool("overwrite")
		if err != nil {
			return err
		}

		path, err := config.WriteDefaultConfig(overwrite, apiURL)
		if err != nil {
			if errors.Is(err, os.ErrExist) {
				fmt.Fprintln(os.Stderr, "Agent Init")
				fmt.Fprintln(os.Stderr)
				fmt.Fprintln(os.Stderr, ui.Danger("✕")+" Config file already exists.")
				fmt.Fprintln(os.Stderr, ui.Muted("Location: "+path))
				fmt.Fprintln(
					os.Stderr,
					ui.Muted("Run ")+ui.Command("agent init --overwrite")+ui.Muted(" to replace it."),
				)
				os.Exit(1)
			}
			return err
		}

		title := "Config file created."
		if overwrite {
			title = "Config file written."
		}

		fmt.Fprintln(os.Stderr, "Agent Init")
		fmt.Fprintln(os.Stderr)
		fmt.Fprintln(os.Stderr, ui.Success("✓")+" "+title)
		fmt.Fprintln(os.Stderr, ui.Muted("Location: "+path))

		return nil
	},
}

func init() {
	initCmd.Flags().BoolP(
		"overwrite",
		"o",
		false,
		"Overwrite existing config",
	)

	rootCmd.AddCommand(initCmd)
}

func promptYesNo(reader *bufio.Reader, prompt string, defaultYes bool) (bool, error) {
	for {
		fmt.Fprint(os.Stderr, prompt)
		input, err := reader.ReadString('\n')
		if err != nil {
			return false, err
		}

		answer := strings.TrimSpace(strings.ToLower(input))
		if answer == "" {
			return defaultYes, nil
		}
		if answer == "y" || answer == "yes" {
			return true, nil
		}
		if answer == "n" || answer == "no" {
			return false, nil
		}

		fmt.Fprintln(os.Stderr, ui.Muted("Please answer with y or n."))
	}
}

func promptURL(reader *bufio.Reader, prompt string) (string, error) {
	for {
		fmt.Fprint(os.Stderr, prompt)
		input, err := reader.ReadString('\n')
		if err != nil {
			return "", err
		}

		trimmed := strings.TrimSpace(input)
		if trimmed == "" {
			fmt.Fprintln(os.Stderr, ui.Muted("URL cannot be empty."))
			continue
		}

		parsed, err := url.ParseRequestURI(trimmed)
		if err != nil || parsed.Scheme == "" || parsed.Host == "" {
			fmt.Fprintln(os.Stderr, ui.Muted("Enter a valid URL (including http/https)."))
			continue
		}

		return trimmed, nil
	}
}
