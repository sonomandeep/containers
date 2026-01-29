package cmd

import (
	"github.com/sonomandeep/containers/agent/internal/config"
	"github.com/spf13/cobra"
)

// initCmd represents the init command
var initCmd = &cobra.Command{
	Use:   "init",
	Short: "Create a default configuration file",
	Long: `Create a default configuration file in your user config directory.
Example path: ~/.config/mando.sh/config.yaml
This command is safe to run multiple times and will not overwrite an existing file.`,
	Args:         cobra.NoArgs,
	SilenceUsage: true,
	RunE: func(cmd *cobra.Command, args []string) error {
		err := config.WriteDefaultConfig(false)
		if err != nil {
			return err
		}

		return nil

		// if created {
		// 	fmt.Printf("Created default config at %s\n", path)
		// 	return nil
		// }
		//
		// fmt.Printf("Config already exists at %s\n", path)
		// return nil
	},
}

func init() {
	rootCmd.AddCommand(initCmd)
}
