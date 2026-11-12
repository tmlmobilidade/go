package services

import (
	"context"
	"errors"
	"fmt"
	"sort"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

// DAG is immutable after construction. Each Execute call owns its scheduling state.
// Task functions must be safe for the concurrency and reuse requested by callers.
type DAG[I, T any] struct {
	// Maps are dictionaries keyed by task ID. Reverse edges let a completed
	// prerequisite find the tasks waiting for it without scanning the whole graph.
	tasks      map[string]types.Task[I, T]
	dependents map[string][]string
	ids        []string
}

// NewDAG validates all nodes and edges, including cycles, before any work can run.
func NewDAG[I, T any](tasks []types.Task[I, T]) (*DAG[I, T], error) {
	// First register every task so dependencies can refer to later entries.
	// & creates a pointer to this graph; callers keep using the same graph object.
	d := &DAG[I, T]{
		tasks:      make(map[string]types.Task[I, T]),
		dependents: make(map[string][]string),
	}

	// range visits each element; _ discards the index because only the task is needed.
	for _, task := range tasks {
		if task.ID == "" || task.Run == nil {
			return nil, errors.New("each task needs an ID and Run function")
		}

		// A map lookup can return both the value and whether the key exists.
		if _, exists := d.tasks[task.ID]; exists {
			return nil, fmt.Errorf("duplicate task %q", task.ID)
		}

		// Slices share underlying storage. Copy the dependencies so later caller
		// edits cannot change the graph after it has been validated.
		task.Dependencies = append([]string(nil), task.Dependencies...)
		d.tasks[task.ID] = task
		d.ids = append(d.ids, task.ID)
	}

	// Verify each edge, then store the reverse relationship: prerequisite → child.
	sort.Strings(d.ids)
	for _, id := range d.ids {
		seen := make(map[string]bool)
		for _, dependency := range d.tasks[id].Dependencies {
			if _, exists := d.tasks[dependency]; !exists {
				return nil, fmt.Errorf("task %q: unknown dependency %q", id, dependency)
			}

			if seen[dependency] {
				return nil, fmt.Errorf("task %q: duplicate dependency %q", id, dependency)
			}

			seen[dependency] = true
			d.dependents[dependency] = append(d.dependents[dependency], id)
		}
	}

	// Dry-run Kahn's algorithm without calling task functions. Each completed
	// node removes an incoming edge from its children. Unvisited nodes imply a cycle.
	degrees, ready := d.initial()
	visited := 0
	for len(ready) > 0 {
		id := ready[0]
		ready = ready[1:]
		visited++

		for _, child := range d.dependents[id] {
			degrees[child]--
			if degrees[child] == 0 {
				ready = append(ready, child)
			}
		}
	}

	if visited != len(d.tasks) {
		return nil, errors.New("graph contains a cycle")
	}

	return d, nil
}

// initial makes fresh counters for each run. A degree is the number of unfinished
// prerequisites; zero-degree nodes can be considered immediately.
func (d *DAG[I, T]) initial() (map[string]int, []string) {
	degrees := make(map[string]int, len(d.tasks))
	ready := []string{}

	for _, id := range d.ids {
		degrees[id] = len(d.tasks[id].Dependencies)
		if degrees[id] == 0 {
			ready = append(ready, id)
		}
	}

	return degrees, ready
}

// completion is a worker's message to the scheduler. Workers never edit the
// scheduler's maps directly, so graph bookkeeping needs no shared-memory locks.
type completion[T any] struct {
	id      string
	outcome types.Outcome[T]
	err     error
}

// Execute returns results in ID order, including skipped tasks after an abort.
// Cancellation is cooperative: it cancels and joins all started tasks before returning.
func (d *DAG[I, T]) Execute(parent context.Context, input I, limit int) ([]types.Result[T], error) {
	if limit < 1 {
		return nil, errors.New("concurrency must be >= 1")
	}

	// This child context can stop sibling workers without canceling the caller.
	ctx, cancel := context.WithCancel(parent)
	defer cancel()

	degrees, ready := d.initial()
	results := make(map[string]types.Result[T], len(d.tasks))

	// A channel is a typed message queue between goroutines (concurrent functions).
	// Buffer one message per active slot so finished workers can report immediately.
	done := make(chan completion[T], min(limit, len(d.tasks)))
	running := 0
	var firstErr error

	// Once every prerequisite has finished, put the child in the ready queue.
	// Readiness does not imply success: blockedBy checks that before it can run.
	unlock := func(id string) {
		for _, child := range d.dependents[id] {
			degrees[child]--
			if degrees[child] == 0 {
				ready = append(ready, child)
			}
		}
	}

	blockedBy := func(id string) []string {
		blocked := []string{}
		for _, dep := range d.tasks[id].Dependencies {
			if results[dep].Status != types.Passed {
				blocked = append(blocked, dep)
			}
		}

		sort.Strings(blocked)
		return blocked
	}

	// Only this scheduler loop changes counters and results. Workers return messages.
	for {
		if firstErr == nil && parent.Err() != nil {
			firstErr = parent.Err()
			cancel()
		}

		// Fill available worker slots. Skipped nodes still unlock their children,
		// allowing the skip to propagate through the entire dependent branch.
		for firstErr == nil && ctx.Err() == nil && running < limit && len(ready) > 0 {
			id := ready[0]
			ready = ready[1:]

			task := d.tasks[id]
			blocked := blockedBy(id)
			reason := task.SkipReason
			if len(blocked) > 0 {
				reason = "prerequisite unsuccessful"
			}
			if reason != "" {
				results[id] = types.Result[T]{
					ID:        id,
					Status:    types.Skipped,
					BlockedBy: blocked,
					Reason:    reason,
				}
				unlock(id)
				continue
			}

			// go starts the function concurrently; the scheduler continues immediately.
			running++
			go runTask(ctx, input, task, done)
		}

		if running == 0 {
			break
		}

		var result completion[T]
		if firstErr != nil {
			// After an abort, drain every started worker before returning.
			// <- receives a message, waiting until one is available.
			result = <-done
		} else {
			// select waits for whichever arrives first: completion or cancellation.
			select {
			case result = <-done:
			case <-ctx.Done():
				firstErr = ctx.Err()
				cancel()
				continue
			}
		}

		running--

		// A failed outcome is a normal check result. An error aborts all branches.
		entry := types.Result[T]{
			ID:     result.id,
			Status: types.Passed,
			Value:  result.outcome.Value,
		}
		if result.outcome.Failed {
			entry.Status = types.Failed
		}

		if result.err != nil {
			entry.Status = types.Errored
			entry.Error = result.err.Error()
			if firstErr == nil {
				firstErr = fmt.Errorf("task %s: %w", result.id, result.err)
				cancel()
			}
		}

		results[result.id] = entry
		if firstErr == nil {
			unlock(result.id)
		}
	}

	// Populate every unfinished node before computing abort-related blockers.
	for _, id := range d.ids {
		if _, exists := results[id]; !exists {
			results[id] = types.Result[T]{
				ID:     id,
				Status: types.Skipped,
				Reason: "execution aborted",
			}
		}
	}

	// Completion order can vary with concurrency; report order must not.
	ordered := make([]types.Result[T], 0, len(d.ids))
	for _, id := range d.ids {
		entry := results[id]
		if entry.Status == types.Skipped {
			entry.BlockedBy = blockedBy(id)
		}
		ordered = append(ordered, entry)
	}

	if firstErr == nil {
		firstErr = parent.Err()
	}

	return ordered, firstErr
}

func runTask[I, T any](ctx context.Context, input I, task types.Task[I, T], done chan<- completion[T]) {
	result := completion[T]{id: task.ID}

	// defer always sends one completion, even after a panic (a runtime exception).
	// recover catches that panic here and converts it into an operational error;
	// a panicking rule is reported as an execution failure with a completion message.
	defer func() {
		if value := recover(); value != nil {
			result.err = fmt.Errorf("panic: %v", value)
		}
		done <- result
	}()

	result.outcome, result.err = task.Run(ctx, input)
}
