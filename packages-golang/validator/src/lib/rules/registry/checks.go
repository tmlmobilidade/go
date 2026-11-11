package registry

import (
	"maps"

	validationTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/validations"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables"
)

// Checks returns a private callback map; execution never mutates registrations.
func Checks() map[string]validationTypes.Check {
	//

	//
	// 1. Acquire a read lock on the registered rules

	variables.RegisteredRules.RLock()
	defer variables.RegisteredRules.RUnlock()

	//
	// 2. Return a clone of the registered checks

	return maps.Clone(variables.RegisteredRules.Checks)
}
