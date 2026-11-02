package cli

import (
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/cli/types"
)

func NewCLI(title string) *types.CLI {
	return &types.CLI{
		Title: title,
		Options: types.CliOptions{
			OutputPath: "",
			LogLevel:   "info",
		},
	}
}