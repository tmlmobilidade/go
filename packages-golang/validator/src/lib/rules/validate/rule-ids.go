package validate

import (
	"fmt"

	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/rules"
)

// ValidateRuleIDs rejects unknown IDs, including entries configured as ignore.
// Discovery establishes that an ID exists; the validation runner binds callbacks.
func ValidateRuleIDs(config map[string]rules.RuleConfig, known map[string]bool) error {
	//

	//
	// 1. Check every configured ID against the discovered rule IDs

	for _, id := range sortedIDs(config) {
		if !known[id] {
			return fmt.Errorf("unknown rule %q", id)
		}
	}
	return nil
}
