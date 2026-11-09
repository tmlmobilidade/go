package context

import (
	"database/sql"
	"slices"

	types "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/context"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/messages"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/rules"
)

// NewRuleContext creates a private context while its rule waits in the graph.
// Kahn invokes the callback only when its configured dependencies have passed.
func NewRuleContext(ruleID string, db *sql.DB, config rules.RuleContext, adder messages.MessageAdder) *types.ValidationContext {
	//

	//
	// 1. Copy mutable settings and resolve an omitted severity to ignore

	config = cloneConfig(config)
	if config.Severity == "" {
		config.Severity = rules.SEVERITY_IGNORE
	}

	//
	// 2. Attach the rule identity, database connection, and synchronized message receiver

	return &types.ValidationContext{RuleID: ruleID, DB: db, Config: config, MessageAdder: adder, Row: -1}
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
