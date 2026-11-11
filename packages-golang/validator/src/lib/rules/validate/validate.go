// Package validate checks rules.json before any GTFS validation is executed.
package validate

import (
	"fmt"
	"os"

	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib/rules/discover"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/rules"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/validations"
)

// ValidateRulesJSON reads rules.json and runs every validation step using source-discovered rule IDs.
// An empty path preserves the CLI's optional-rules behavior: all checks are ignored.
func ValidateRulesJSON(path string) (map[string]rules.RuleConfig, error) {
	//

	//
	// 1. Read the supplied rules.json file

	if path == "" {
		return map[string]rules.RuleConfig{}, nil
	}

	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("read rules file %q: %w", path, err)
	}

	//
	// 2. Discover known rule IDs without executing their checks

	ids, err := discover.DiscoverRuleIDs(validations.RuleSources)
	if err != nil {
		return nil, fmt.Errorf("discover rule IDs: %w", err)
	}

	known := make(map[string]bool, len(ids))
	for _, id := range ids {
		known[id] = true
	}

	//
	// 3. Run every validation step

	config, err := Parse(data, known)
	if err != nil {
		return nil, fmt.Errorf("rules file %q: %w", path, err)
	}

	//
	// 4. Return the decoded configuration

	return config, nil
}
