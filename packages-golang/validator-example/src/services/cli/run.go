package cli

import (
	"fmt"
	"os"

	utils "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/cli/utils"
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/cli"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/variables"
)

func Run(cli *types.CLI) error {
	utils.Parse(cli)

	if cli.Options.Version {
		fmt.Printf("GTFS Validator v%s\n", variables.DisplayVersion)
		os.Exit(0)
	}

	return Validate(cli)
}
