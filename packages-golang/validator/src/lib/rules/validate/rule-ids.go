package validate

import (
	"fmt"

	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/rules"
	utils "github.com/tmlmobilidade/go/packages-golang/validator/src/utils/validate"
)

// ValidateRuleIDs rejects unknown IDs, including entries configured as ignore.
// Discovery establishes that an ID exists; the validation runner binds callbacks.
func ValidateRuleIDs(config map[string]rules.RuleConfig, known map[string]bool) error {
	//

	//
	// 1. Check every configured ID against the discovered rule IDs

	for _, id := range utils.SortedIDs(config) {
		if !known[id] {
			return fmt.Errorf("unknown rule %q", id)
		}
	}

	//
	// 2. Return nil if all rule IDs are valid

	return nil
}
