package algorithm

import types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/algorithm"

/*
* Order returns a valid dependency order for inspection. Concurrent execution
* starts each rule as soon as its own dependencies have passed.
 */
func Order[T any](m *types.Manager[T]) []string {
	//

	//
	// 1. Copy the rule IDs from the validated dependency order

	ids := make([]string, len(m.Ordered))
	for i, r := range m.Ordered {
		ids[i] = r.ID
	}
	//
	// 2. Return the IDs for inspection

	return ids
}
