package cmd

import (
	"errors"
	"fmt"
	"os"

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
		uiKit := ui.New()

		overwrite, err := cmd.Flags().GetBool("overwrite")
		if err != nil {
			return ui.Error{
				Title:   "Invalid flags.",
				Details: []string{err.Error()},
				Cause:   err,
			}
		}

		path, err := config.WriteDefaultConfig(overwrite)
		if err != nil {
			locationFields := func(location string) []ui.Field {
				if location == "" {
					return nil
				}
				return []ui.Field{{Label: "Location", Value: location}}
			}

			if errors.Is(err, os.ErrExist) {
				return ui.Error{
					Title: "Config file already exists.",
					Fields: locationFields(path),
					Hints: []ui.Hint{
						{
							Prefix:  "Run ",
							Command: "agent init --overwrite",
							Suffix:  " to replace it.",
						},
					},
					Cause: err,
				}
			}

			if errors.Is(err, os.ErrPermission) {
				return ui.Error{
					Title: "Permission denied while writing config.",
					Fields: locationFields(path),
					Details: []string{err.Error()},
					Hints: []ui.Hint{
						{Text: "Check directory permissions or run with appropriate privileges."},
					},
					Cause: err,
				}
			}

			return ui.Error{
				Title: "Failed to write config file.",
				Fields: locationFields(path),
				Details: []string{err.Error()},
				Cause:   err,
			}
		}

		title := "Config file created."
		if overwrite {
			title = "Config file written."
		}

		lines := []string{
			uiKit.InfoTitle.Render(title),
			uiKit.KV("Location", path),
			"",
			"Open it with " + uiKit.Emph.Render("cat "+path) + " or edit it in your editor.",
		}
		if !overwrite {
			lines = append(lines, uiKit.Muted.Render("Tip: re-run with --overwrite to regenerate the file."))
		}

		fmt.Println(uiKit.InfoBox(lines...))

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
