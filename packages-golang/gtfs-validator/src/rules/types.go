// Package rules contains the built-in GTFS checks and their finding types.
package rules

// Severities are the possible severity levels for a validation rule.
type Severities string

const (
	SEVERITY_IGNORE    Severities = "ignore"
	SEVERITY_INFO      Severities = "info"
	SEVERITY_WARNING   Severities = "warning"
	SEVERITY_ERROR     Severities = "error"
	SEVERITY_FORBIDDEN Severities = "forbidden"
)

// Finding is a diagnostic produced by a rule. Rows are zero-based input rows.
type Finding struct {
	Description string // Generic description used by the report group.
	Severity    Severities
	Message     string
	FileName    string
	Field       string
	Rows        []int
}
