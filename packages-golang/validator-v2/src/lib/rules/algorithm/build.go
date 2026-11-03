package algorithm

import (
	"fmt"

	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/rules/algorithm/utils"
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/algorithm"
)

/*
* Build sorts the rules by dependency level using Kahn's algorithm.
* Each ready level keeps registration order. This builds a static order;
* RunRowWithConcurrency schedules execution as dependencies finish.
 */
func Build[T any](m *types.Manager[T]) error {
	//

	//
	// 1. Index the rules and reject duplicate IDs

	index := make(map[string]int, len(m.Rules))
	for i, r := range m.Rules {
		if _, exists := index[r.ID]; exists {
			return fmt.Errorf("duplicate rule id %q", r.ID)
		}
		index[r.ID] = i
	}

	//
	// 2. Count dependencies and record the rules each prerequisite unlocks

	inDegree := make([]int, len(m.Rules))
	dependents := make([][]int, len(m.Rules))
	for i, r := range m.Rules {
		for _, dep := range r.DependsOn {
			j, ok := index[dep]
			if !ok {
				return fmt.Errorf("rule %q depends on unknown rule %q", r.ID, dep)
			}
			inDegree[i]++
			dependents[j] = append(dependents[j], i)
		}
	}

	//
	// 3. Collect ready rules in registration order and detect dependency cycles

	// Each iteration collects a complete ready level before unlocking the next one.
	ordered := make([]types.Rule[T], 0, len(m.Rules))
	done := make([]bool, len(m.Rules))
	for len(ordered) < len(m.Rules) {
		ready := []int{}
		for i := range m.Rules {
			if !done[i] && inDegree[i] == 0 {
				ready = append(ready, i)
			}
		}
		if len(ready) == 0 {
			return fmt.Errorf("dependency cycle between rules: %s", utils.Pending(m, done))
		}
		for _, next := range ready {
			done[next] = true
			ordered = append(ordered, m.Rules[next])
			for _, d := range dependents[next] {
				inDegree[d]--
			}
		}
	}

	//
	// 4. Save the validated dependency order

	m.Ordered = ordered
	return nil
}
