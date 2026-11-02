package types

// Status is the outcome of a single rule for a single row
type Status int

const (
	// Passed means the rule ran without an info, warning, or error finding
	Passed Status = iota
	// Failed means the rule emitted at least one info, warning, or error finding
	Failed
	// Skipped means at least one dependency did not pass, so the rule did not run
	Skipped
)
