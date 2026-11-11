package validate

import (
	"fmt"
	"slices"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/rules"
	utils "github.com/tmlmobilidade/go/packages-golang/validator/src/utils/validate"
)

// ValidateCycles walks configured dependencies depth-first and rejects cycles,
// including a rule depending on itself. Ignored rules are checked as well.
// The error shows the closed dependency path, for example "A -> B -> A".
// Dependency references are checked separately by ValidateDependencies.
func ValidateCycles(config map[string]rules.RuleConfig) error {
	//

	//
	// 1. Track rules on the active path and rules whose dependencies are fully checked

	const (
		visiting uint8 = 1 // The rule is on the current dependency path.
		visited  uint8 = 2 // The rule and its dependencies contain no cycle.
	)

	// An absent entry means the rule has not been visited yet.
	visitStates := make(map[string]uint8, len(config))
	var path []string

	//
	// 2. Define how each rule's dependencies are visited

	// Declare visit before assigning it so the function can call itself recursively.
	var visit func(string) error
	visit = func(ruleID string) error {
		switch visitStates[ruleID] {
		case visited:
			// Shared dependencies already checked through another rule need no repeat visit.
			return nil
		case visiting:
			// Reaching a rule already on this path closes a cycle.
			// Keep only the cycle itself, then repeat its first rule to show the closing edge.
			cycleStart := slices.Index(path, ruleID)
			cycle := slices.Clone(path[cycleStart:])
			cycle = append(cycle, ruleID)
			return fmt.Errorf("dependency cycle between rules: %s", strings.Join(cycle, " -> "))
		}

		// Add this rule to the active path before following its dependencies in configured order.
		visitStates[ruleID] = visiting
		path = append(path, ruleID)
		for _, dependency := range config[ruleID].DependsOn {
			if err := visit(dependency); err != nil {
				return err
			}
		}

		// All dependencies are safe: remove this rule from the path and mark it fully checked.
		path = path[:len(path)-1]
		visitStates[ruleID] = visited
		return nil
	}

	//
	// 3. Check every configured rule so disconnected cycles are also found
	// Sorted starting IDs make the first reported cycle deterministic.

	for _, ruleID := range utils.SortedIDs(config) {
		if err := visit(ruleID); err != nil {
			return err
		}
	}

	return nil
}
