package algorithm

import (
	"fmt"

	types "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/algorithm"
)

/*
* RunRules starts every rule whose dependencies have all passed, without a concurrency
* cap. Failed or skipped prerequisites skip their dependents; independent rules
* continue. Each completion can immediately unlock more work.
*
* Build the manager before calling this function and do not modify it during a run.
* Callbacks share row and must synchronize any writes to shared state. All started
* callbacks finish before this function returns. Scheduling state is local to a run.
 */
func RunRules[T any](manager *types.Manager[T], row T) (map[string]types.Status, error) {
	//

	//
	// 1. Validate the manager is ready

	if manager == nil || len(manager.Ordered) != len(manager.Rules) {
		return nil, fmt.Errorf("build the rule manager before running rows")
	}

	//
	// 2. Validate the callbacks and prepare the dependency counts and the initial ready queue

	// No callbacks start until the entire execution graph has been checked.
	index := make(map[string]int, len(manager.Ordered))
	pending := make([]int, len(manager.Ordered))
	dependents := make([][]int, len(manager.Ordered))
	queue := make([]int, 0, len(manager.Ordered))

	//
	// 3. Validate the rules are ready

	for i, rule := range manager.Ordered {
		if _, exists := index[rule.ID]; exists {
			return nil, fmt.Errorf("duplicate rule id %q", rule.ID)
		}

		if rule.Run == nil {
			return nil, fmt.Errorf("rule %q has no run function", rule.ID)
		}

		for _, dependency := range rule.DependsOn {
			parent, exists := index[dependency]
			if !exists {
				return nil, fmt.Errorf("rule %q has unordered or unknown dependency %q; rebuild the manager", rule.ID, dependency)
			}
			dependents[parent] = append(dependents[parent], i)
		}
		index[rule.ID] = i
		pending[i] = len(rule.DependsOn)
		if pending[i] == 0 {
			queue = append(queue, i)
		}
	}

	//
	// 4. Initialize this run's results and dependency-failure flags

	statuses := make(map[string]types.Status, len(manager.Ordered))
	blocked := make([]bool, len(manager.Ordered))

	//
	// 5. Define how a completion releases dependent rules
	// Only the coordinator updates statuses, dependency counts, and the queue.

	complete := func(i int, status types.Status) {
		// Store the final outcome before making dependent rules ready.
		statuses[manager.Ordered[i].ID] = status
		for _, child := range dependents[i] {
			if status != types.Passed {
				blocked[child] = true
			}
			// Even a blocked rule waits until all its prerequisites have finished.
			pending[child]--
			if pending[child] == 0 {
				queue = append(queue, child)
			}
		}
	}

	//
	// 6. Create the worker completion channel and scheduling counters

	done := make(chan types.Completion, len(manager.Ordered))
	running := 0
	head := 0

	//
	// 7. Process ready rules and completions until all started work finishes

	for head < len(queue) || running > 0 {
		// Start every ready rule. Skipped rules do not need a worker.
		for head < len(queue) {
			next := queue[head]
			head++
			if blocked[next] {
				// Propagate the skip to downstream rules without executing the check.
				complete(next, types.Skipped)
				continue
			}
			running++
			go func(i int) {
				done <- types.Completion{Index: i, Status: manager.Ordered[i].Run(row)}
			}(next)
		}
		// Process one completion, then immediately reconsider the ready queue.
		// This lets E start after C finishes while an unrelated rule B is still running.
		if running > 0 {
			result := <- done
			running--
			complete(result.Index, result.Status)
		}
	}

	//
	// 8. Return every rule's final status after all workers finish

	return statuses, nil
}
