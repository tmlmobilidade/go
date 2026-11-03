package algorithm

import (
	"fmt"
	"slices"
	"sort"

	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/rules/algorithm/types"
	ruletypes "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
)

/*
* ManagerRules binds already validated configuration to execution callbacks and
* uses Kahn's algorithm to build their dependency order. It never reads or parses
* rules.json, and no validation checks run while preparing the execution graph.
 */
func ManagerRules[T any](configuration map[string]ruletypes.RuleConfig, checks map[string]func(T, *ruletypes.RuleContext) types.Status) (*types.Manager[T], error) {
	//

	//
	// 1. Include registered rules omitted from configuration as ignored rules

	ids := make([]string, 0, len(configuration)+len(checks))
	for id := range configuration {
		ids = append(ids, id)
	}
	for id := range checks {
		if _, configured := configuration[id]; !configured {
			ids = append(ids, id)
		}
	}
	sort.Strings(ids)

	//
	// 2. Bind each rule's settings without executing its implementation

	rules := make([]types.Rule[T], 0, len(ids))
	for _, id := range ids {
		if id == "" {
			return nil, fmt.Errorf("rule ID must not be empty")
		}
		config, configured := configuration[id]
		if !configured {
			config = ruletypes.RuleConfig{RuleContext: ruletypes.RuleContext{Severity: ruletypes.SEVERITY_IGNORE}}
		}
		check := checks[id]
		if config.Severity != ruletypes.SEVERITY_IGNORE && check == nil {
			return nil, fmt.Errorf("rule %q has no execution callback", id)
		}
		// Bind the configuration and check to this rule without executing it yet.
		rules = append(rules, types.Rule[T]{
			ID:        id,
			DependsOn: slices.Clone(config.DependsOn),
			Run: func(row T) types.Status {
				//
				// 1. Skip ignored rules so their dependents cannot treat them as passed

				if config.Severity == ruletypes.SEVERITY_IGNORE {
					return types.Skipped
				}
				//
				// 2. Copy the configuration for this invocation

				// Pass only validation settings; dependencies remain with the algorithm.
				// Copy slice fields so a check cannot change a later row's configuration.
				context := config.RuleContext
				if config.Options != nil {
					options := slices.Clone(*config.Options)
					context.Options = &options
				}
				if config.Compare != nil {
					compare := slices.Clone(*config.Compare)
					context.Compare = &compare
				}
				//
				// 3. Run the check with its individual configuration

				return check(row, &context)
			},
		})
	}

	//
	// 3. Build the execution dependency order using Kahn's algorithm

	return NewManager(rules...)
}
