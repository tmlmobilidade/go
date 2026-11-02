package cli

import (
	"fmt"
	"os"

	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/cli/types"
	utils "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/cli/utils"
)

func Run(cli *types.CLI) {
	utils.Parse(cli)

	if cli.Options.Version {
		fmt.Printf("GTFS Validator v%s\n", types.DisplayVersion)
		os.Exit(0)
	}

	Validate(cli)
}