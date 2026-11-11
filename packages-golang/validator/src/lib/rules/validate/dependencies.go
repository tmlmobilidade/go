package validate

import (
	"fmt"

	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/rules"
	utils "github.com/tmlmobilidade/go/packages-golang/validator/src/utils/validate"
)

// ValidateDependencies checks references against configured and source-discovered IDs.
// Known rules omitted from the file remain unconfigured.
func ValidateDependencies(config map[string]rules.RuleConfig, known map[string]bool) error {
	//

	//
	// 1. Reject references absent from both configuration and source discovery

	for _, id := range utils.SortedIDs(config) {
		for _, dependency := range config[id].DependsOn {
			_, configured := config[dependency]
			if !configured && !known[dependency] {
				return fmt.Errorf("rule %q depends on unknown rule %q", id, dependency)
			}
		}
	}

	//
	// 2. Return nil if all dependencies are valid

	return nil
}
