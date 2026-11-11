package utils

import (
	"strings"

	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/algorithm"
)

// Pending lists rules not yet ordered by Build, for dependency-cycle errors.
// Each done entry corresponds to the rule at the same index in m.Rules.
func Pending[T any](m *types.Manager[T], done []bool) string {
	//

	//
	// 1. Collect the IDs still waiting to be ordered

	ids := []string{}
	for i, r := range m.Rules {
		if !done[i] {
			ids = append(ids, r.ID)
		}
	}
	//
	// 2. Format the IDs for the error message

	return strings.Join(ids, ", ")
}
