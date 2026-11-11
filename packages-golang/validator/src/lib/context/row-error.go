package context

import (
	"errors"

	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

// RowErrorDetails finds source metadata through any surrounding error wrappers.
func RowErrorDetails(err error) (*types.RowError, bool) {
	//

	//
	// 1. Check if the error is a row error

	var source *types.RowError
	if !errors.As(err, &source) {
		return nil, false
	}

	//
	// 2. Return the row error details

	return source, true
}
