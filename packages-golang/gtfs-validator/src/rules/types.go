// Package rules contains the built-in GTFS checks and their finding types.
// Each check lives in its own file; the registry and scheduling helpers live alongside the rule functions.
package rules

import "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/dag"

// Severity is a string with named constants, so reports use readable JSON values.
type Severity string

const (
	Error   Severity = "error"
	Warning Severity = "warning"
)

// Finding describes a problem with GTFS data. The json tags control output field
// names; omitempty leaves optional fields out when they have no value.
type Finding struct {
	Severity Severity `json:"severity"`
	Message  string   `json:"message"`
	FileName string   `json:"file_name,omitempty"`
	Field    string   `json:"field,omitempty"`

	// Rows is reserved for source locations; current rules do not populate it.
	Rows []int `json:"rows,omitempty"`
}

// RuleResult includes the findings or the reason a particular rule could not run.
type RuleResult struct {
	ID        string     `json:"rule_id"`
	Status    dag.Status `json:"status"`
	Findings  []Finding  `json:"findings"`
	BlockedBy []string   `json:"blocked_by,omitempty"`
	Reason    string     `json:"reason,omitempty"`
	Error     string     `json:"error,omitempty"`
}

// Report is the complete JSON-compatible result returned to library and CLI callers.
type Report struct {
	Rules         []RuleResult `json:"rules"`
	TotalErrors   int          `json:"total_errors"`
	TotalWarnings int          `json:"total_warnings"`

	// Error describes an operational failure; validation findings are in Rules.
	Error string `json:"error,omitempty"`
}
