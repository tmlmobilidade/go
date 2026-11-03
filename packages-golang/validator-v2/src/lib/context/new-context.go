package context

import (
	"slices"

	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/messages"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/sqlite"
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/context"
)

// ValidationContext is the single input supplied to an executable rule.
type ValidationContext = types.ValidationContext

// NewRuleContext creates a private context while its rule waits in the graph.
// Kahn invokes the callback only when its configured dependencies have passed.
func NewRuleContext(ruleID string, tables *sqliteTypes.SQLiteTables, config rules.RuleContext, adder messages.MessageAdder) *ValidationContext {
	//

	//
	// 1. Copy mutable settings and resolve an omitted severity to ignore

	config = cloneConfig(config)
	if config.Severity == "" {
		config.Severity = rules.SEVERITY_IGNORE
	}

	//
	// 2. Attach the rule identity, shared tables, and synchronized message receiver

	return &ValidationContext{RuleID: ruleID, Tables: tables, Config: config, MessageAdder: adder, Row: -1}
}

func cloneConfig(config rules.RuleContext) rules.RuleContext {
	if config.Options != nil {
		options := slices.Clone(*config.Options)
		config.Options = &options
	}
	if config.Compare != nil {
		compare := slices.Clone(*config.Compare)
		config.Compare = &compare
	}
	return config
}
