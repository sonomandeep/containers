package cmd

import (
	"fmt"

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
		ui := ui.New()

		overwrite, err := cmd.Flags().GetBool("overwrite")
		if err != nil {
			return err
		}

		path, err := config.WriteDefaultConfig(overwrite)
		if err != nil {
			return err
		}

		title := "Config file created."
		if overwrite {
			title = "Config file written."
		}

		lines := []string{
			ui.InfoTitle.Render(title),
			ui.KV("Location", path),
			"",
			"Open it with " + ui.Emph.Render("cat "+path) + " or edit it in your editor.",
		}
		if !overwrite {
			lines = append(lines, ui.Muted.Render("Tip: re-run with --overwrite to regenerate the file."))
		}

		fmt.Println(ui.InfoBox(lines...))

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
