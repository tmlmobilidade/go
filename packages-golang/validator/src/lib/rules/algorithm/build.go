package algorithm

import (
	"fmt"

	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/algorithm"
	utils "github.com/tmlmobilidade/go/packages-golang/validator/src/utils/algorithm"
)

/*
* Build sorts the rules by dependency level using Kahn's algorithm.
* Each ready level keeps registration order. This builds a static order;
* RunRules schedules execution as dependencies finish.
 */
func Build[T any](manager *types.Manager[T]) error {
	//

	//
	// 1. Index the rules and reject duplicate IDs

	index := make(map[string]int, len(manager.Rules))
	for i, r := range manager.Rules {
		if _, exists := index[r.ID]; exists {
			return fmt.Errorf("duplicate rule id %q", r.ID)
		}
		index[r.ID] = i
	}

	//
	// 2. Count dependencies and record the rules each prerequisite unlocks

	inDegree := make([]int, len(manager.Rules))
	dependents := make([][]int, len(manager.Rules))
	for i, r := range manager.Rules {
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
	ordered := make([]types.Rule[T], 0, len(manager.Rules))
	done := make([]bool, len(manager.Rules))
	for len(ordered) < len(manager.Rules) {
		ready := []int{}

		for i := range manager.Rules {
			if !done[i] && inDegree[i] == 0 {
				ready = append(ready, i)
			}
		}

		if len(ready) == 0 {
			return fmt.Errorf("dependency cycle between rules: %s", utils.Pending(manager, done))
		}

		for _, next := range ready {
			done[next] = true
			ordered = append(ordered, manager.Rules[next])
			for _, d := range dependents[next] {
				inDegree[d]--
			}
		}
	}

	//
	// 4. Save the validated dependency order

	manager.Ordered = ordered
	return nil
}
