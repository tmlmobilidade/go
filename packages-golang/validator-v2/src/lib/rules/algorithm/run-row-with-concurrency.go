package algorithm

import (
	"fmt"

	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/rules/algorithm/types"
)

/*
* RunRowWithConcurrency starts rules when their dependencies have all passed and
* a worker slot is available. Failed or skipped prerequisites skip their dependents;
* independent rules continue. Each completion can immediately unlock more work.
*
* Build the manager before calling this function and do not modify it during a run.
* Callbacks share row and must synchronize any writes to shared state. All started
* callbacks finish before this function returns. Scheduling state is local to a run.
 */
func RunRowWithConcurrency[T any](m *types.Manager[T], row T, limit int) (map[string]types.Status, error) {
	
	if limit < 1 {
		return nil, fmt.Errorf("rule concurrency must be positive")
	}
	if m == nil || len(m.Ordered) != len(m.Rules) {
		return nil, fmt.Errorf("build the rule manager before running rows")
	}

	// Validate and prepare the execution graph before starting any callbacks.
	index := make(map[string]int, len(m.Ordered))
	pending := make([]int, len(m.Ordered))
	dependents := make([][]int, len(m.Ordered))
	queue := make([]int, 0, len(m.Ordered))
	for i, rule := range m.Ordered {
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

	statuses := make(map[string]types.Status, len(m.Ordered))
	blocked := make([]bool, len(m.Ordered))
	// Only the coordinator updates statuses, dependency counts, and the queue.
	complete := func(i int, status types.Status) {
		statuses[m.Ordered[i].ID] = status
		for _, child := range dependents[i] {
			if status != types.Passed {
				blocked[child] = true
			}
			pending[child]--
			if pending[child] == 0 {
				queue = append(queue, child)
			}
		}
	}
	type completion struct {
		index  int
		status types.Status
	}
	done := make(chan completion, min(limit, len(m.Ordered)))
	running := 0
	head := 0
	for head < len(queue) || running > 0 {
		for head < len(queue) {
			next := queue[head]
			if !blocked[next] && running == limit {
				break
			}
			head++
			if blocked[next] {
				complete(next, types.Skipped)
				continue
			}
			running++
			go func(i int) {
				done <- completion{index: i, status: m.Ordered[i].Run(row)}
			}(next)
		}
		if running > 0 {
			result := <-done
			running--
			complete(result.index, result.status)
		}
	}
	return statuses, nil
}
