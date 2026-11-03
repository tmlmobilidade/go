package validation_context_types

import (
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/messages"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/sqlite"
)

// ValidationContext stores the location, severity, and outcome of one check invocation.
// Create a separate context for each running check; contexts are not shared between workers.
type ValidationContext struct {
	Tables       *sqliteTypes.SQLiteTables // Shared, prepared database metadata for this run
	Config       rules.RuleContext         // Private complete configuration, including options and comparisons
	Source       *sqliteTypes.SQLiteRow    // Current source row; nil on the whole-rule context
	Skipped      bool                      // True when this rule cannot run against its required input data
	Field        string                    // Field being checked, such as shape_id
	FileName     string                    // Source GTFS filename, such as trips.txt
	Row          int                       // Zero-based source row index, or -1 on the whole-rule context
	RuleID       string                    // Default rule ID used for findings and translation keys
	MessageAdder messages.MessageAdder     // Receiver that collects emitted findings
	Failed       bool                      // True after findings or an operational failure
}
