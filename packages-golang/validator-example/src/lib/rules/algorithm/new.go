package algorithm

import (
	"database/sql"
	"fmt"
	"slices"

	context "github.com/tmlmobilidade/go/packages-golang/validator-example/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/lib/rules/execution"
	types "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/algorithm"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/messages"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/rules"
	validationTypes "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/validations"
)

// NewManager creates the execution nodes from registered validations and configuration,
// then builds their dependency order. It does not execute validations or modify inputs.
func NewManager(db *sql.DB, configuration map[string]rules.RuleConfig, validations validationTypes.RuleChecks, messageService messages.MessageService) (*types.Manager[*validationTypes.Execution], error) {
	//

	//
	// 1. Prepare callbacks, including notices and ignored rules without functions

	callbacks := make(validationTypes.RuleChecks, len(validations))
	for id, validate := range validations {
		callbacks[id] = validate
	}

	for _, id := range []string{"file_validation", "file_not_found_in_rules"} {
		callbacks[id] = nil
	}
	
	//
	// 2. Validate the rules are registered

	for id, config := range configuration {
		if _, exists := callbacks[id]; !exists {
			if config.Severity != "" && config.Severity != rules.SEVERITY_IGNORE {
				return nil, fmt.Errorf("rule %q has no execution callback", id)
			}
			callbacks[id] = nil
		}
	}

	//
	// 3. Include configured rules and their declared prerequisites

	// Unrelated file-presence gates stay outside the graph.
	required := make(map[string]bool, len(configuration))
	for id, config := range configuration {
		required[id] = true
		for _, dependency := range config.DependsOn {
			required[dependency] = true
		}
	}

	//
	// 4. Create each node with its context, dependencies, and validation function

	nodes := make([]types.Rule[*validationTypes.Execution], 0, len(required))
	for id, validate := range callbacks {
		if !required[id] {
			continue
		}

		config := configuration[id]
		ruleContext := context.NewRuleContext(id, db, config.RuleContext, messageService)
		nodes = append(nodes, types.Rule[*validationTypes.Execution]{
			ID:        ruleContext.RuleID,
			DependsOn: slices.Clone(config.DependsOn),
			Run: func(run *validationTypes.Execution) types.Status {
				return execution.ExecuteValidation(run, ruleContext, validate)
			},
		})
	}

	//
	// 5. Store the nodes and validate their dependency order

	m := &types.Manager[*validationTypes.Execution]{Rules: nodes}
	if err := Build(m); err != nil {
		return nil, err
	}
	
	//
	// 6. Return the prepared manager

	return m, nil
}
