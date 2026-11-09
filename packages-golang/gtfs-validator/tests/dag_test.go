package gtfsvalidator_test

import (
	"context"

	"errors"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/dag"
	"reflect"
	"sync/atomic"
	"testing"
	"time"
)

// task builds a passing test node; deps ...string accepts any number of prerequisite IDs.
func task(id string, deps ...string) dag.Task[int] {
	return dag.Task[int]{
		ID:           id,
		Dependencies: deps,
		Run: func(context.Context) (dag.Outcome[int], error) {
			return dag.Outcome[int]{Value: 1}, nil
		},
	}
}

// Table-driven tests run the same assertion against several named input cases.
func TestMalformedGraphs(t *testing.T) {
	for name, tasks := range map[string][]dag.Task[int]{
		"empty id":           {task("")},
		"nil function":       {{ID: "a"}},
		"duplicate id":       {task("a"), task("a")},
		"unknown dependency": {task("a", "b")},
		"duplicate edge":     {task("a"), task("b", "a", "a")},
		"cycle":              {task("a", "b"), task("b", "a")},
		"self cycle":         {task("a", "a")},
	} {
		t.Run(name, func(t *testing.T) {
			if _, err := dag.New(tasks); err == nil {
				t.Fatal("accepted malformed graph")
			}
		})
	}
}

// A failed root must skip its entire branch without blocking the independent z node.
func TestBranchFailureAndReuse(t *testing.T) {
	var ran atomic.Int32
	a := task("a")
	a.Run = func(context.Context) (dag.Outcome[int], error) {
		return dag.Outcome[int]{Failed: true}, nil
	}
	b := task("b", "a")
	b.Run = func(context.Context) (dag.Outcome[int], error) {
		t.Error("blocked task ran")
		return dag.Outcome[int]{}, nil
	}

	z := task("z")
	z.Run = func(context.Context) (dag.Outcome[int], error) {
		ran.Add(1)
		return dag.Outcome[int]{Value: 42}, nil
	}

	input := []dag.Task[int]{task("d", "b", "c"), task("c", "a"), b, z, a}
	graph, err := dag.New(input)
	if err != nil {
		t.Fatal(err)
	}

	// Mutating the original slice must not affect the graph's copied dependencies.
	input[0].Dependencies[0] = "unknown"

	for range 2 {
		results, err := graph.Execute(context.Background(), 3)
		if err != nil {
			t.Fatal(err)
		}

		statuses := []dag.Status{}
		for _, r := range results {
			statuses = append(statuses, r.Status)
		}

		if !reflect.DeepEqual(statuses, []dag.Status{dag.Failed, dag.Skipped, dag.Skipped, dag.Skipped, dag.Passed}) {
			t.Fatal(results)
		}

		if !reflect.DeepEqual(results[3].BlockedBy, []string{"b", "c"}) || results[4].Value != 42 {
			t.Fatal(results)
		}
	}

	if ran.Load() != 2 {
		t.Fatal("independent branch did not run twice")
	}
}

// Hold workers at a channel barrier to prove parallelism without relying on sleeps.
func TestBoundedParallelDiamond(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Empty struct messages carry a signal without any data. Closing release
	// wakes every worker waiting on that channel. Atomic counters are safe to
	// read/write from multiple goroutines without data races.
	started := make(chan struct{}, 3)
	release := make(chan struct{})
	var active, peak atomic.Int32
	tasks := []dag.Task[int]{}
	for _, id := range []string{"a", "b", "c"} {
		node := task(id)
		node.Run = func(ctx context.Context) (dag.Outcome[int], error) {
			n := active.Add(1)
			defer active.Add(-1)
			for old := peak.Load(); n > old; old = peak.Load() {
				if peak.CompareAndSwap(old, n) {
					break
				}
			}
			started <- struct{}{}
			select {
			case <-release:
				return dag.Outcome[int]{}, nil
			case <-ctx.Done():
				return dag.Outcome[int]{}, ctx.Err()
			}
		}
		tasks = append(tasks, node)
	}

	child := task("d", "a", "b", "c")
	child.Run = func(context.Context) (dag.Outcome[int], error) {
		if active.Load() != 0 {
			t.Error("dependent started early")
		}

		return dag.Outcome[int]{}, nil
	}

	graph, _ := dag.New(append(tasks, child))
	finished := make(chan error, 1)
	go func() {
		_, err := graph.Execute(ctx, 2)
		finished <- err
	}()
	for range 2 {
		select {
		case <-started:
		case <-ctx.Done():
			t.Fatal(ctx.Err())
		}
	}

	if active.Load() != 2 {
		t.Error("ready tasks did not run concurrently")
	}

	close(release)
	if err := <-finished; err != nil {
		t.Fatal(err)
	}

	if peak.Load() != 2 {
		t.Fatal(peak.Load())
	}
}

// Force one task to fail while another is active; Execute must wait for both.
func TestAbortCancelsAndJoins(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	running := make(chan struct{})
	var joined atomic.Bool
	failure := errors.New("database unavailable")
	a := task("a")
	a.Run = func(ctx context.Context) (dag.Outcome[int], error) {
		select {
		case <-running:
			return dag.Outcome[int]{}, failure
		case <-ctx.Done():
			return dag.Outcome[int]{}, ctx.Err()
		}
	}

	b := task("b")
	b.Run = func(ctx context.Context) (dag.Outcome[int], error) {
		close(running)
		<-ctx.Done()
		joined.Store(true)
		return dag.Outcome[int]{}, ctx.Err()
	}

	graph, _ := dag.New([]dag.Task[int]{a, b, task("c", "a")})
	results, err := graph.Execute(ctx, 2)
	if !errors.Is(err, failure) || !joined.Load() || results[2].Status != dag.Skipped || results[0].Status != dag.Errored {
		t.Fatal(results, err)
	}
}

// Check the exceptional paths that must terminate without leaving work behind.
func TestPanicCancellationAndEmptyGraph(t *testing.T) {
	a := task("a")
	a.Run = func(context.Context) (dag.Outcome[int], error) { panic("broken rule") }
	graph, _ := dag.New([]dag.Task[int]{a})
	results, err := graph.Execute(context.Background(), 1)
	if err == nil || results[0].Status != dag.Errored {
		t.Fatal(results, err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	results, err = graph.Execute(ctx, 1)
	if !errors.Is(err, context.Canceled) || results[0].Status != dag.Skipped {
		t.Fatal(results, err)
	}

	if _, err := graph.Execute(context.Background(), 0); err == nil {
		t.Fatal("accepted invalid limit")
	}

	empty, _ := dag.New([]dag.Task[int]{})
	results, err = empty.Execute(context.Background(), 1)
	if err != nil || len(results) != 0 {
		t.Fatal(results, err)
	}
}
