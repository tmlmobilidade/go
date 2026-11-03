package types

// Status is the final outcome of one rule invocation, including a whole-table scan.
// The scheduler uses prerequisite outcomes to decide whether dependent rules can run.
type Status int

const (
	// Passed means the rule ran without an info, warning, or error finding.
	Passed Status = iota
	// Failed means the rule emitted at least one info, warning, or error finding.
	Failed
	// Skipped means the rule was ignored or a dependency did not pass, so its check did not run.
	Skipped
)
