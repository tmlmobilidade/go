package context

import (
	"database/sql"

	types "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/context"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/messages"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/rules"
)

// NewRuleContext creates a private context while its rule waits in the graph.
// Kahn invokes the callback only when its configured dependencies have passed.
// Options and comparisons are shared and remain read-only during the run.
func NewRuleContext(ruleID string, db *sql.DB, config rules.RuleContext, adder messages.MessageAdder) *types.ValidationContext {
	//

	//
	// 1. Resolve an omitted severity to ignore in this local configuration copy

	if config.Severity == "" {
		config.Severity = rules.SEVERITY_IGNORE
	}

	//
	// 2. Attach the rule identity, database connection, and synchronized message receiver

	return &types.ValidationContext{RuleID: ruleID, DB: db, Config: config, MessageAdder: adder, Row: -1}
}
