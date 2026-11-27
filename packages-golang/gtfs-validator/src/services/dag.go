package services

import (
	"context"
	"errors"
	"fmt"
	"sort"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

// DAG runs a set of tasks in dependency order, optionally in parallel.
//
// Think of it as a to-do list with prerequisites: task B can only start after
// task A finishes, and several independent tasks can run at the same time.
//
// Type parameters (the [I, T any] part):
//   - I is the shared input every task receives (e.g. *sql.DB for the feed)
//   - T is the value each task returns (e.g. []Finding)
//
// The graph is immutable after NewDAG. Each Execute call keeps its own
// scheduling state, so the same DAG can be executed more than once.
// Task Run functions must be safe for the concurrency level the caller requests.
type DAG[I, T any] struct {
	// tasks: task ID → task definition (lookup by name).
	tasks map[string]types.Task[I, T]
	// dependents: prerequisite ID → IDs of tasks that wait on it.
	// Reverse of Dependencies, so finishing A can find B,C without scanning all tasks.
	dependents map[string][]string
	// ids: all task IDs in sorted order (stable report order).
	ids []string
}

// NewDAG validates the task list and builds the graph. Nothing runs yet.
//
// Checks: every task has an ID and Run function, no duplicate IDs, every
// DependsOn target exists, no duplicate edges, and no cycles.
//
// Cycle detection uses a dry run of Kahn's algorithm (see Execute): walk nodes
// with zero remaining prerequisites; if some nodes are never visited, there is
// a cycle and construction fails.
func NewDAG[I, T any](tasks []types.Task[I, T]) (*DAG[I, T], error) {
	// &DAG{...} allocates the graph and returns a pointer. Callers share one object.
	d := &DAG[I, T]{
		tasks:      make(map[string]types.Task[I, T]),
		dependents: make(map[string][]string),
	}

	// Register every task first so a dependency can point at a later list entry.
	// range over a slice: _, task discards the index; only the value is used.
	for _, task := range tasks {
		if task.ID == "" || task.Run == nil {
			return nil, errors.New("each task needs an ID and Run function")
		}

		// Map lookup returns (value, ok). ok is false when the key is missing.
		if _, exists := d.tasks[task.ID]; exists {
			return nil, fmt.Errorf("duplicate task %q", task.ID)
		}

		// Slices are references to shared backing arrays. Copy Dependencies so
		// later edits by the caller cannot change the validated graph.
		task.Dependencies = append([]string(nil), task.Dependencies...)
		d.tasks[task.ID] = task
		d.ids = append(d.ids, task.ID)
	}

	// Build reverse edges: for each "B depends on A", record A → B in dependents.
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

	// Dry-run Kahn's algorithm (no task functions called). Each "completed" node
	// decrements its children's remaining-prerequisite count. If we cannot visit
	// every node, some are stuck in a cycle.
	degrees, ready := d.initial()
	visited := 0
	for len(ready) > 0 {
		id := ready[0]
		ready = ready[1:] // pop front of the queue
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

// initial builds fresh scheduling counters for one Execute (or the cycle check).
//
// degrees[id] = how many prerequisites of id are still unfinished.
// ready = IDs whose degree is already 0 (nothing to wait for).
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

// completion is one worker's report back to the scheduler.
// Workers never mutate the scheduler's maps; they only send this message.
// That way the main loop alone owns degrees/results and needs no locks.
type completion[T any] struct {
	result types.Result[T]
	err    error
}

// Execute runs the graph and returns one Result per task, sorted by task ID.
//
// limit is the max number of tasks running at once (worker pool size).
//
// Behavior summary:
//   - Prerequisites must finish before a dependent is considered.
//   - A dependent only runs if every prerequisite Passed; otherwise it is Skipped.
//   - Outcome.Failed marks the task Failed but does not abort the run (siblings continue).
//   - A returned error (or panic) aborts: cancel workers, skip the rest.
//   - Cancellation is cooperative: cancel the child context, wait for started
//     workers to finish, then return — never leave orphaned work.
func (d *DAG[I, T]) Execute(parent context.Context, input I, limit int) ([]types.Result[T], error) {
	return d.ExecuteWithObserver(parent, input, limit, nil)
}

// ExecuteWithObserver also reports live transitions. The observer may be called
// concurrently from the scheduler and its workers. It must return promptly and
// treat the event and its result as read-only.
func (d *DAG[I, T]) ExecuteWithObserver(parent context.Context, input I, limit int, observe func(types.TaskEvent[T])) ([]types.Result[T], error) {
	if limit < 1 {
		return nil, errors.New("concurrency must be >= 1")
	}

	// Child context: cancel() stops workers without canceling the caller's context.
	// defer cancel() runs when Execute returns, so we always clean up.
	ctx, cancel := context.WithCancel(parent)
	defer cancel()

	degrees, ready := d.initial()
	results := make(map[string]types.Result[T], len(d.tasks))

	// Channel = typed message queue between goroutines (lightweight threads).
	// Buffered so a finishing worker can send without blocking if the scheduler
	// is briefly busy. Size = number of slots that can be in flight.
	done := make(chan completion[T], min(limit, len(d.tasks)))
	running := 0
	var firstErr error

	emit := func(kind types.TaskEventKind, result types.Result[T]) {
		if observe != nil {
			observe(types.TaskEvent[T]{Kind: kind, Result: result})
		}
	}
	abort := func(err error) {
		firstErr = err
		if observe != nil {
			cause := err
			if parent.Err() != nil && errors.Is(err, parent.Err()) {
				cause = context.Cause(parent)
			}
			observe(types.TaskEvent[T]{Kind: types.TaskCancelled, Cause: cause})
		}
		cancel()
	}

	// Direct prerequisites that did not Pass (Failed / Skipped / Errored).
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

	markReady := func(id string) {
		if observe != nil && ctx.Err() == nil && d.tasks[id].SkipReason == "" && len(blockedBy(id)) == 0 {
			emit(types.TaskReady, types.Result[T]{ID: id})
		}
	}
	for _, id := range ready {
		markReady(id)
	}

	// An item can enter the scheduler queue to be skipped. Only emit a ready
	// event when it can actually run and is waiting for a worker slot.
	unlock := func(id string) {
		for _, child := range d.dependents[id] {
			degrees[child]--
			if degrees[child] == 0 {
				ready = append(ready, child)
				markReady(child)
			}
		}
	}

	// Single-threaded scheduler: only this loop mutates degrees, ready, results.
	// Workers only send completion messages on done.
	for {
		if firstErr == nil && parent.Err() != nil {
			abort(parent.Err())
		}

		// Fill free worker slots from the ready queue.
		// Skipped nodes still unlock children so the skip can cascade down the branch.
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
				entry := types.Result[T]{
					ID:        id,
					Status:    types.Skipped,
					BlockedBy: blocked,
					Reason:    reason,
				}
				results[id] = entry
				emit(types.TaskSkipped, entry)
				unlock(id)
				continue
			}

			// go starts the function in parallel; the scheduler does not wait here.
			running++
			go runTask(ctx, input, task, done, emit)
		}

		if running == 0 {
			break
		}

		var result completion[T]
		if firstErr != nil {
			// Abort path: drain every in-flight worker before returning.
			// <-done blocks until a completion message arrives.
			result = <-done
		} else {
			// select waits for the first event: a worker finished, or cancel fired.
			select {
			case result = <-done:
			case <-ctx.Done():
				abort(ctx.Err())
				continue
			}
		}

		running--

		if result.err != nil && firstErr == nil {
			abort(fmt.Errorf("task %s: %w", result.result.ID, result.err))
		}

		results[result.result.ID] = result.result
		if firstErr == nil {
			unlock(result.result.ID)
		}
	}

	// Tasks never started (e.g. after abort) still get a Skipped result.
	const abortedReason = "execution aborted"
	for _, id := range d.ids {
		if _, exists := results[id]; !exists {
			results[id] = types.Result[T]{
				ID:     id,
				Status: types.Skipped,
				Reason: abortedReason,
			}
		}
	}

	// Concurrent completion order varies; callers always get sorted-by-ID order.
	ordered := make([]types.Result[T], 0, len(d.ids))
	for _, id := range d.ids {
		entry := results[id]
		if entry.Status == types.Skipped {
			entry.BlockedBy = blockedBy(id)
			if entry.Reason == abortedReason {
				emit(types.TaskSkipped, entry)
			}
		}
		ordered = append(ordered, entry)
	}

	if firstErr == nil && parent.Err() != nil {
		abort(parent.Err())
	}

	return ordered, firstErr
}

// runTask is the worker body. It always sends exactly one completion on done,
// including when the task panics (Go's equivalent of an uncaught exception).
func runTask[I, T any](ctx context.Context, input I, task types.Task[I, T], done chan<- completion[T], emit func(types.TaskEventKind, types.Result[T])) {
	entry := types.Result[T]{ID: task.ID, Status: types.Passed}
	var err error

	// defer runs when the function returns (or panics). recover() catches a panic
	// and turns it into a normal error so the scheduler still gets a message.
	defer func() {
		if value := recover(); value != nil {
			err = fmt.Errorf("panic: %v", value)
		}
		if err != nil {
			entry.Status = types.Errored
			entry.Error = err.Error()
		}
		emit(types.TaskFinished, entry)
		done <- completion[T]{result: entry, err: err}
	}()

	emit(types.TaskStarted, types.Result[T]{ID: task.ID})
	outcome, runErr := task.Run(ctx, input)
	err = runErr
	entry.Value = outcome.Value
	if outcome.Failed {
		entry.Status = types.Failed
	}
}
