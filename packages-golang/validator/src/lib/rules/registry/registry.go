// Package registry stores executable validations indexed by their rule IDs.
package registry

import (
	"fmt"
	"maps"
	"slices"
	"strings"

	validationTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/validations"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables"
)

// Register binds a batch of rule IDs to their validation functions.
// The whole batch is validated before any callback is stored.
func Register(checks validationTypes.RuleChecks) {
	//

	//
	// 1. Lock shared registrations and validate the entire batch in rule-ID order

	variables.RegisteredRules.Lock()
	defer variables.RegisteredRules.Unlock()
	ids := slices.Sorted(maps.Keys(checks))
	for _, id := range ids {
		if strings.TrimSpace(id) == "" || checks[id] == nil {
			panic("register validation: a rule ID and callback are required")
		}
		if _, exists := variables.RegisteredRules.Checks[id]; exists {
			panic(fmt.Sprintf("validation %q is already registered", id))
		}
	}

	//
	// 2. Store every validated callback while holding the same lock

	for _, id := range ids {
		variables.RegisteredRules.Checks[id] = checks[id]
	}
}

// Checks returns a private callback map; execution never mutates registrations.
func Checks() map[string]validationTypes.Check {
	variables.RegisteredRules.RLock()
	defer variables.RegisteredRules.RUnlock()
	return maps.Clone(variables.RegisteredRules.Checks)
}
