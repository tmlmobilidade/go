package validation_context_types

import "fmt"

// RowError retains the source location of an operational validation failure.
type RowError struct {
	Table string
	Field string
	Row   int
	Err   error
}

func (err *RowError) Error() string {
	return fmt.Sprintf("check %s row %d: %v", err.Table, err.Row, err.Err)
}
func (err *RowError) Unwrap() error { return err.Err }
