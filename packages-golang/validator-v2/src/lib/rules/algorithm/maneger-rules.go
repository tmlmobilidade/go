package algorithm

import (
	"bytes"
	"encoding/json"
	"fmt"
	"slices"
	"sort"

	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/rules/algorithm/types"
	ruletypes "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
)

/*
* ManagerRules builds an executable dependency graph from rules.json contents.
* It accepts a flat rule-ID object, optionally wrapped in validation_rules.
* Checks are Go implementations keyed by those same IDs. JSON supplies configuration,
* not executable functions. Omitted or ignored rules are skipped during execution.
* Enabled rules require a check; unknown dependencies and cycles are rejected by Build.
* This function prepares the manager without running any checks.
 */
func ManagerRules[T any](data []byte, checks map[string]func(T, *ruletypes.RuleContext) types.Status) (*types.Manager[T], error) {
	//

	//
	// 1. Decode the rules.json object

	var entries map[string]json.RawMessage
	if err := json.Unmarshal(data, &entries); err != nil {
		return nil, fmt.Errorf("parse rules JSON: %w", err)
	}
	if entries == nil {
		return nil, fmt.Errorf("rules must be an object")
	}

	//
	// 2. Read the optional validation_rules wrapper

	if wrapped, exists := entries["validation_rules"]; exists {
		entries = nil
		if err := json.Unmarshal(wrapped, &entries); err != nil {
			return nil, fmt.Errorf("validation_rules: %w", err)
		}
		if entries == nil {
			return nil, fmt.Errorf("validation_rules: expected a rules object")
		}
	}

	//
	// 3. Collect configured and registered rule IDs

	// JSON object order is not significant. IDs only break ties between ready rules.
	ids := make([]string, 0, len(entries)+len(checks))
	for id := range entries {
		ids = append(ids, id)
	}
	for id := range checks {
		if _, configured := entries[id]; !configured {
			ids = append(ids, id)
		}
	}

	//
	// 4. Sort IDs to keep graph construction deterministic

	sort.Strings(ids)

	//
	// 5. Decode each rule's configuration and validate its implementation

	rules := make([]types.Rule[T], 0, len(ids))
	for _, id := range ids {
		if id == "" {
			return nil, fmt.Errorf("rule ID must not be empty")
		}
		// Registered rules omitted from the JSON remain in the graph as skipped rules.
		config := ruletypes.RuleConfig{
			RuleContext: ruletypes.RuleContext{Severity: ruletypes.SEVERITY_IGNORE},
		}
		if raw, configured := entries[id]; configured {
			raw = bytes.TrimSpace(raw)
			if len(raw) == 0 || raw[0] != '{' {
				return nil, fmt.Errorf("rule %q: expected a rule object", id)
			}
			decoder := json.NewDecoder(bytes.NewReader(raw))
			decoder.DisallowUnknownFields()
			if err := decoder.Decode(&config); err != nil {
				return nil, fmt.Errorf("rule %q: %w", id, err)
			}
		}
		switch config.Severity {
		case ruletypes.SEVERITY_IGNORE, ruletypes.SEVERITY_INFO, ruletypes.SEVERITY_WARNING,
			ruletypes.SEVERITY_ERROR, ruletypes.SEVERITY_FORBIDDEN:
		default:
			return nil, fmt.Errorf("rule %q: invalid severity %q", id, config.Severity)
		}
		check := checks[id]
		if config.Severity != ruletypes.SEVERITY_IGNORE && check == nil {
			return nil, fmt.Errorf("rule %q has no implementation", id)
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
	// 6. Validate the dependency graph and return the prepared manager

	return NewManager(rules...)
}
