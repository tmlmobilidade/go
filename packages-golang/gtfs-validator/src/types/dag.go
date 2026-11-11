package types

import "context"

// Status is the final state of a task; pending/running states stay internal.
type Status string

const (
	Passed  Status = "passed"
	Failed  Status = "failed"
	Skipped Status = "skipped"
	Errored Status = "errored"
)

// Outcome separates an unsuccessful check from an operational error.
// Failed outcomes block descendants; returned errors abort the entire run.
// [T any] makes this type generic: callers choose the value type, such as []Finding.
type Outcome[T any] struct {
	Value  T
	Failed bool
}

// Task is a graph node. Run is a function stored as a field, called only after
// all prerequisites pass. Its error return is separate from a failed outcome.
type Task[T any] struct {
	ID           string
	Dependencies []string
	Run          func(context.Context) (Outcome[T], error)
}

// Result keeps the task output and an explanation when it failed or was skipped.
type Result[T any] struct {
	ID        string
	Status    Status
	Value     T
	BlockedBy []string // Direct prerequisites that did not pass.
	Reason    string
	Error     string
}
