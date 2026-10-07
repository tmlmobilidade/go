package rules

import (
	"fmt"
	"strings"
)

// Status is the outcome of a single rule for a single row
type Status int

const (
	// Passed means the rule ran without a warning or error
	Passed Status = iota
	// Failed means the rule emitted at least one warning or error
	Failed
	// Skipped means at least one dependency did not pass, so the rule did not run
	Skipped
)

// Rule is a validation node in the dependency graph.
// ID should match the rule key used in rules.json (e.g. "agency_id_unique").
type Rule[T any] struct {
	ID        string
	DependsOn []string
	Run       func(row T) Status
}

// Manager orders rules by their dependencies (topological sort) and runs them,
// skipping any rule whose dependency did not pass.
type Manager[T any] struct {
	rules   []Rule[T]
	ordered []Rule[T]
}

// NewManager creates a manager and builds the execution order.
// Returns an error on duplicate IDs, unknown dependencies or cycles.
func NewManager[T any](rules ...Rule[T]) (*Manager[T], error) {
	m := &Manager[T]{rules: rules}
	if err := m.Build(); err != nil {
		return nil, err
	}
	return m, nil
}

// MustNewManager is like NewManager but panics on error.
// Dependencies are declared in code, so an error here is a programming mistake.
func MustNewManager[T any](rules ...Rule[T]) *Manager[T] {
	m, err := NewManager(rules...)
	if err != nil {
		panic(err)
	}
	return m
}

// Build sorts the rules using Kahn's algorithm. Ties keep registration order,
// so the execution order is deterministic.
func (m *Manager[T]) Build() error {
	index := make(map[string]int, len(m.rules))
	for i, r := range m.rules {
		if _, exists := index[r.ID]; exists {
			return fmt.Errorf("duplicate rule id %q", r.ID)
		}
		index[r.ID] = i
	}

	inDegree := make([]int, len(m.rules))
	dependents := make([][]int, len(m.rules))
	for i, r := range m.rules {
		for _, dep := range r.DependsOn {
			j, ok := index[dep]
			if !ok {
				return fmt.Errorf("rule %q depends on unknown rule %q", r.ID, dep)
			}
			inDegree[i]++
			dependents[j] = append(dependents[j], i)
		}
	}

	// Process the ready rules in registration order (lowest index first)
	ordered := make([]Rule[T], 0, len(m.rules))
	done := make([]bool, len(m.rules))
	for len(ordered) < len(m.rules) {
		next := -1
		for i := range m.rules {
			if !done[i] && inDegree[i] == 0 {
				next = i
				break
			}
		}
		if next == -1 {
			return fmt.Errorf("dependency cycle between rules: %s", m.pending(done))
		}
		done[next] = true
		ordered = append(ordered, m.rules[next])
		for _, d := range dependents[next] {
			inDegree[d]--
		}
	}

	m.ordered = ordered
	return nil
}

func (m *Manager[T]) pending(done []bool) string {
	ids := []string{}
	for i, r := range m.rules {
		if !done[i] {
			ids = append(ids, r.ID)
		}
	}
	return strings.Join(ids, ", ")
}

// Order returns the rule IDs in execution order
func (m *Manager[T]) Order() []string {
	ids := make([]string, len(m.ordered))
	for i, r := range m.ordered {
		ids[i] = r.ID
	}
	return ids
}

// RunRow runs every rule for one row in dependency order and returns each rule's status.
// A rule is Skipped when any of its dependencies is Failed or Skipped, so skips
// carry down the whole chain.
func (m *Manager[T]) RunRow(row T) map[string]Status {
	status := make(map[string]Status, len(m.ordered))
	for _, r := range m.ordered {
		blocked := false
		for _, dep := range r.DependsOn {
			if outcome, exists := status[dep]; !exists || outcome != Passed {
				blocked = true
				break
			}
		}
		if blocked {
			status[r.ID] = Skipped
			continue
		}
		status[r.ID] = r.Run(row)
	}
	return status
}
