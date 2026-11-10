package context_types

import "fmt"

// RowError retains the source location of an operational validation failure.
type RowError struct {
	Table string
	Field string
	Row   int
	Err   error
}

// Error describes the source row and the underlying operational failure.
func (err *RowError) Error() string {
	return fmt.Sprintf("check %s row %d: %v", err.Table, err.Row, err.Err)
}

// Unwrap preserves errors.Is and errors.As traversal of the underlying error.
func (err *RowError) Unwrap() error { return err.Err }
