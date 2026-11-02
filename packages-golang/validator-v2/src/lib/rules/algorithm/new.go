package algorithm

import "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/rules/algorithm/types"

// NewManager creates a manager and builds the execution order.
// Returns an error on duplicate IDs, unknown dependencies or cycles.
func NewManager[T any](rules ...types.Rule[T]) (*types.Manager[T], error) {
	m := &types.Manager[T]{Rules: rules}
	if err := Build(m); err != nil {
		return nil, err
	}
	return m, nil
}
