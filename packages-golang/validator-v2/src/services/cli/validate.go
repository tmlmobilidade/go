package cli

import (
	"fmt"
	"slices"

	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/cli/types"
)

// Validate CLI options
func Validate(cli *types.CLI) error {
	if cli.Options.InputPath == "" {
		return fmt.Errorf("input path is required")
	}

	validLangs := []string{"en", "es", "pt"}
	if !slices.Contains(validLangs, cli.Options.RulesLang) {
		return fmt.Errorf("invalid rules language: %q (supported: en, es, pt)", cli.Options.RulesLang)
	}

	return nil
}