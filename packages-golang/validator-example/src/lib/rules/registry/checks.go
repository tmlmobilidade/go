package registry

import (
	"maps"

	validationTypes "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/validations"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/variables"
)

// Checks returns a private callback map; execution never mutates registrations.
func Checks() map[string]validationTypes.Check {
	//

	//
	// 1. Return a clone of the registered checks

	variables.RegisteredRules.RLock()
	defer variables.RegisteredRules.RUnlock()
	return maps.Clone(variables.RegisteredRules.Checks)
}