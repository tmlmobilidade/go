package context

import (
	"errors"
	"fmt"

	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/context"
)

// rowError implements the error behavior while RowError remains a data contract.
type rowError struct {
	details types.RowError
}

func (err *rowError) Error() string {
	return fmt.Sprintf("check %s row %d: %v", err.details.Table, err.details.Row, err.details.Err)
}

func (err *rowError) Unwrap() error { return err.details.Err }

// RowErrorDetails finds source metadata through any surrounding error wrappers.
func RowErrorDetails(err error) (*types.RowError, bool) {
	var source *rowError
	if !errors.As(err, &source) {
		return nil, false
	}
	return &source.details, true
}
