package cli

import (
	"fmt"
	"slices"

	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/cli"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables"
)

// Validate CLI options
func Validate(cli *types.CLI) error {
	if cli.Options.InputPath == "" {
		return fmt.Errorf("input path is required")
	}

	if !slices.Contains(variables.SupportedTranslationLanguages, cli.Options.RulesLang) {
		return fmt.Errorf("invalid rules language: %q (supported: en, es, pt)", cli.Options.RulesLang)
	}

	return nil
}
