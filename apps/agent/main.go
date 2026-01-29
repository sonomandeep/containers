package main

import (
	"github.com/sonomandeep/containers/agent/cmd"
	"github.com/sonomandeep/containers/agent/internal/config"
	"github.com/spf13/cobra"
)

func main() {
	cobra.OnInitialize(config.InitConfig)
	cmd.Execute()
}
