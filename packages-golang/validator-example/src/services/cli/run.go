package cli

import (
	"fmt"
	"os"

	types "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/cli"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/variables"
	utils "github.com/tmlmobilidade/go/packages-golang/validator-example/src/utils/cli"
)

func Run(cli *types.CLI) error {
	utils.Parse(cli)

	if cli.Options.Version {
		fmt.Printf("GTFS Validator v%s\n", variables.DisplayVersion)
		os.Exit(0)
	}

	return Validate(cli)
}
