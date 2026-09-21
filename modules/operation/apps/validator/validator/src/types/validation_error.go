package types

import (
	"fmt"
)

// ValidationError represents an error that occurred during validation
type ValidationError struct {
	// Field being validated (e.g., "stop_id")
	Field string

	// File name (e.g., "stops.txt")
	FileName string

	// Row number (0-based index)
	Row int

	// Rule ID (e.g., "stop_id_rule")
	RuleID string

	// Error message
	Message string

	// Underlying error (if any)
	Err error
}

// Error implements the error interface
func (e *ValidationError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s:%d [%s] %s: %v", e.FileName, e.Row, e.RuleID, e.Message, e.Err)
	}
	return fmt.Sprintf("%s:%d [%s] %s", e.FileName, e.Row, e.RuleID, e.Message)
}

// Unwrap returns the underlying error for error wrapping support
func (e *ValidationError) Unwrap() error {
	return e.Err
}

// NewValidationError creates a new ValidationError
func NewValidationError(field, fileName, ruleID, message string, row int) *ValidationError {
	return &ValidationError{
		Field:    field,
		FileName: fileName,
		Row:      row,
		RuleID:   ruleID,
		Message:  message,
	}
}

// WrapValidationError wraps an existing error with validation context
func WrapValidationError(err error, field, fileName, ruleID string, row int) *ValidationError {
	return &ValidationError{
		Field:    field,
		FileName: fileName,
		Row:      row,
		RuleID:   ruleID,
		Message:  err.Error(),
		Err:      err,
	}
}

// DatabaseError represents an error that occurred during database operations
type DatabaseError struct {
	// Operation being performed (e.g., "GetRowsById", "GetTableCount")
	Operation string

	// Table name
	Table string

	// Underlying error
	Err error
}

// Error implements the error interface
func (e *DatabaseError) Error() string {
	return fmt.Sprintf("database error [%s] on table %s: %v", e.Operation, e.Table, e.Err)
}

// Unwrap returns the underlying error
func (e *DatabaseError) Unwrap() error {
	return e.Err
}

// NewDatabaseError creates a new DatabaseError
func NewDatabaseError(operation, table string, err error) *DatabaseError {
	return &DatabaseError{
		Operation: operation,
		Table:     table,
		Err:       err,
	}
}
