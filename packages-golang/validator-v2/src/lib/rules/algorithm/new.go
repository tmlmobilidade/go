package algorithm

import types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules/algorithm"

// NewManager creates a manager and builds the execution order.
// Returns an error on duplicate IDs, unknown dependencies or cycles.
func NewManager[T any](rules ...types.Rule[T]) (*types.Manager[T], error) {
	//

	//
	// 1. Store the registered rules

	m := &types.Manager[T]{Rules: rules}

	//
	// 2. Validate dependencies and build their order

	if err := Build(m); err != nil {
		return nil, err
	}
	//
	// 3. Return the prepared manager

	return m, nil
}
