// Package validate checks rules.json before any GTFS validation is executed.
package validate

import (
	"fmt"
	"os"
	"slices"

	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/lib/rules/discover"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/rules"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/validations"
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
	// 3. Run every validation step and return the decoded configuration

	config, err := Parse(data, known)
	if err != nil {
		return nil, fmt.Errorf("rules file %q: %w", path, err)
	}
	return config, nil
}

// Parse runs the configuration validation steps on JSON bytes. It returns settings
// only; building and executing the rule graph belongs to the algorithm package.
func Parse(data []byte, known map[string]bool) (map[string]rules.RuleConfig, error) {
	//

	//
	// 1. Validate JSON syntax

	if err := ValidateJSON(data); err != nil {
		return nil, err
	}

	//
	// 2. Validate the configuration structure and decode each rule

	config, err := ValidateStructure(data)
	if err != nil {
		return nil, err
	}

	//
	// 3. Validate supported severity values

	if err := ValidateSeverities(config); err != nil {
		return nil, err
	}

	//
	// 4. Validate that every configured rule ID exists in the source

	if err := ValidateRuleIDs(config, known); err != nil {
		return nil, err
	}

	//
	// 5. Validate dependency references

	if err := ValidateDependencies(config, known); err != nil {
		return nil, err
	}

	//
	// 6. Validate that dependencies contain no cycles

	if err := ValidateCycles(config); err != nil {
		return nil, err
	}
	return config, nil
}

// sortedIDs keeps validation errors deterministic when configurations contain several problems.
func sortedIDs[T any](entries map[string]T) []string {
	ids := make([]string, 0, len(entries))
	for id := range entries {
		ids = append(ids, id)
	}
	slices.Sort(ids)
	return ids
}
