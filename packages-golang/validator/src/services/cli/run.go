package cli

import (
	"fmt"
	"os"

	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/cli"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables"
	utils "github.com/tmlmobilidade/go/packages-golang/validator/src/utils/cli"
)

func Run(cli *types.CLI) error {
	//

	//
	// 1. Parse the CLI options

	utils.Parse(cli)

	//
	// 2. Check if the version is requested

	if cli.Options.Version {
		fmt.Printf("GTFS Validator v%s\n", variables.DisplayVersion)
		os.Exit(0)
	}

	//
	// 3. Validate the input

	return Validate(cli)
}
