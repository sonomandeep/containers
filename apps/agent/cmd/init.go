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
		overwrite, err := cmd.Flags().GetBool("overwrite")
		if err != nil {
			return err
		}

		path, err := config.WriteDefaultConfig(overwrite)
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
