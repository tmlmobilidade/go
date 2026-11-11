package cli

import (
	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/cli"
)

func NewCLI(title string) *types.CLI {
	//

	//
	// 1. Create a new CLI instance

	return &types.CLI{
		Title: title,
		Options: types.CliOptions{
			OutputPath: "",
			LogLevel:   "info",
		},
	}
}
