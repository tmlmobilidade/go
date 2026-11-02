package types

import "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"

// ValidationContext stores the location, severity, and outcome of one check invocation.
// Create a separate context for each running check; contexts are not shared between workers.
type ValidationContext struct {
	Field          string           // Field being checked, such as shape_id
	FileName       string           // Source GTFS filename, such as trips.txt
	Row            int              // Zero-based source row index
	RuleID         string           // Default rule ID used for findings and translation keys
	Severity       rules.Severities // Configured severity; defaults to ignore
	MessageAdder   MessageAdder     // Receiver that collects emitted findings
	Failed         bool             // True after an info, warning, or error finding is emitted
	HasRuleContext bool             // Explicit rule configuration controls findings with this RuleID
}
