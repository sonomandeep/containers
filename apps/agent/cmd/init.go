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
		printHeader := func() {
			fmt.Fprintln(os.Stderr, "Agent Init")
			fmt.Fprintln(os.Stderr)
		}
		printLocation := func(path string) {
			if path == "" {
				return
			}
			fmt.Fprintln(os.Stderr, ui.KV("Location", path))
		}

		overwrite, err := cmd.Flags().GetBool("overwrite")
		if err != nil {
			printHeader()
			fmt.Fprintln(os.Stderr, ui.Danger("✕")+" Invalid flags.")
			fmt.Fprintln(os.Stderr, ui.Muted(err.Error()))
			os.Exit(1)
		}

		path, err := config.WriteDefaultConfig(overwrite)
		if err != nil {
			printHeader()
			if errors.Is(err, os.ErrExist) {
				fmt.Fprintln(os.Stderr, ui.Danger("✕")+" Config file already exists.")
				printLocation(path)
				fmt.Fprintln(
					os.Stderr,
					ui.Muted("Run ")+ui.Command("agent init --overwrite")+ui.Muted(" to replace it."),
				)
				os.Exit(1)
			}

			if errors.Is(err, os.ErrPermission) {
				fmt.Fprintln(os.Stderr, ui.Danger("✕")+" Permission denied while writing config.")
				printLocation(path)
				fmt.Fprintln(os.Stderr, ui.Muted("Check directory permissions or run with appropriate privileges."))
				fmt.Fprintln(os.Stderr, ui.Muted(err.Error()))
				os.Exit(1)
			}

			fmt.Fprintln(os.Stderr, ui.Danger("✕")+" Failed to write config file.")
			printLocation(path)
			fmt.Fprintln(os.Stderr, ui.Muted(err.Error()))
			os.Exit(1)
		}

		title := "Config file created."
		if overwrite {
			title = "Config file written."
		}

		lines := []string{
			ui.InfoTitle(title),
			ui.KV("Location", path),
			"",
			"Open it with " + ui.Emph("cat "+path) + " or edit it in your editor.",
		}
		if !overwrite {
			lines = append(lines, ui.Muted("Tip: re-run with --overwrite to regenerate the file."))
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
