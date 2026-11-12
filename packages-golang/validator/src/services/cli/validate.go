package cli

import (
	"fmt"
	"slices"

	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/cli"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables"
)

// Validate CLI options
func Validate(cli *types.CLI) error {
	//

	//
	// 1. Check if the input path is required

	if cli.Options.InputPath == "" {
		return fmt.Errorf("input path is required")
	}

	//
	// 2. Check if the rules language is supported

	if !slices.Contains(variables.SupportedTranslationLanguages, cli.Options.RulesLang) {
		return fmt.Errorf("invalid rules language: %q (supported: en, es, pt)", cli.Options.RulesLang)
	}

	//
	// 3. Return nil if the CLI options are valid

	return nil
}
