package cli

import (
	"fmt"
	"os"

	utils "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/cli/utils"
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/cli"
)

func Run(cli *types.CLI) error {
	utils.Parse(cli)

	if cli.Options.Version {
		fmt.Printf("GTFS Validator v%s\n", displayVersion)
		os.Exit(0)
	}

	return Validate(cli)
}
