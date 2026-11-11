// Package rules contains the built-in GTFS checks and their finding types.
package rules

import "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"

// Severities are the possible severity levels for a validation rule.
type Severities = types.Severities

const (
	SEVERITY_IGNORE    = types.SEVERITY_IGNORE
	SEVERITY_INFO      = types.SEVERITY_INFO
	SEVERITY_WARNING   = types.SEVERITY_WARNING
	SEVERITY_ERROR     = types.SEVERITY_ERROR
	SEVERITY_FORBIDDEN = types.SEVERITY_FORBIDDEN
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
