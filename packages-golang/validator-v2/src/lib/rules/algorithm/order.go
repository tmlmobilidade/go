package algorithm

import "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/rules/algorithm/types"

/*
* Order returns a valid dependency order for inspection. Concurrent execution
* starts each rule when its own dependencies finish and a worker slot is available.
 */
func Order[T any](m *types.Manager[T]) []string {
	ids := make([]string, len(m.Ordered))
	for i, r := range m.Ordered {
		ids[i] = r.ID
	}
	return ids
}
