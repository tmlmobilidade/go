package validate

import (
	"fmt"

	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/rules"
)

// ValidateSeverities accepts only the severities supported in rules.json.
func ValidateSeverities(config map[string]rules.RuleConfig) error {
	//

	//
	// 1. Accept every severity defined by the validation rule type

	for _, id := range sortedIDs(config) {
		switch config[id].Severity {
		case rules.SEVERITY_IGNORE, rules.SEVERITY_INFO, rules.SEVERITY_WARNING, rules.SEVERITY_ERROR, rules.SEVERITY_FORBIDDEN:
		default:
			return fmt.Errorf("rule %q: invalid severity %q", id, config[id].Severity)
		}
	}
	return nil
}
