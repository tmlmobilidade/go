package services

import (
	"fmt"
	"runtime"
	"slices"
	"sort"
	"time"

	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib/rules"
	"main/types"
)

// RuleChecks bind implementations to IDs. A rule's table is data metadata,
// never a boundary on which other rules it may depend on.
type RuleChecks map[string]func(*SQLiteContext, *types.RuleContext) error

type RuleDefinition struct {
	ID         string
	Table      string
	GroupField string
	Check      func(*SQLiteContext, *types.RuleContext) error
	Run        func() rules.Status // Feed-level checks have no row context.
	After      []string            // Completion-only ordering for shared intermediate results.
	Always     bool                // Presence checks also run when their diagnostic is ignored.
}

type ruleOutcome struct {
	status rules.Status
	seen   bool
	// Successful rows are implicit once execution has started. Dependencies
	// are visited after their source rows, so only blocked rows need storage.
	rows map[int]rules.Status
}

type RuleRunner struct {
	config       *types.GtfsRules
	tables       *SQLiteTables
	definitions  map[string]RuleDefinition
	order        []string
	dependencies map[string][]string
}

// NewRuleRunner creates a single graph for the entire validation run. Execution
// scopes only determine the rows checked by an action, not allowed dependencies.
func NewRuleRunner(config *types.GtfsRules, tables *SQLiteTables, definitions []RuleDefinition) (*RuleRunner, error) {
	r := &RuleRunner{config: config, tables: tables, definitions: map[string]RuleDefinition{}}
	ids := make([]string, 0, len(definitions))
	for _, definition := range definitions {
		if _, exists := r.definitions[definition.ID]; exists {
			return nil, fmt.Errorf("duplicate rule id %q", definition.ID)
		}
		r.definitions[definition.ID] = definition
		ids = append(ids, definition.ID)
	}
	if err := rules.ValidateDependencies(config, ids...); err != nil {
		return nil, err
	}
	// Configuration also includes runtime notices without executable checks.
	// These stay Skipped, so they cannot silently pass as prerequisites.
	for _, id := range rules.RuleIDs(config) {
		if _, exists := r.definitions[id]; !exists {
			r.definitions[id] = RuleDefinition{ID: id}
			ids = append(ids, id)
		}
	}
	// Implicit presence nodes must be executable, not invented passing states.
	for _, id := range ids {
		for _, dependency := range config.Rule(id).DependsOn {
			if _, exists := r.definitions[dependency]; !exists {
				return nil, fmt.Errorf("rule %q depends on unregistered rule %q", id, dependency)
			}
		}
	}
	// IDs only break ties in the ready queue. Tables never determine scheduling.
	sort.Strings(ids)
	r.order = ids
	r.dependencies = make(map[string][]string, len(ids))
	graph := make([]rules.Rule[struct{}], 0, len(ids))
	for _, id := range ids {
		deps := slices.Clone(config.Rule(id).DependsOn)
		for _, dependency := range r.definitions[id].After {
			if _, exists := r.definitions[dependency]; !exists {
				return nil, fmt.Errorf("rule %q waits for unregistered rule %q", id, dependency)
			}
			if !slices.Contains(deps, dependency) {
				deps = append(deps, dependency)
			}
		}
		r.dependencies[id] = deps
		graph = append(graph, rules.Rule[struct{}]{ID: id, DependsOn: deps})
	}
	if _, err := rules.NewManager(graph...); err != nil {
		return nil, err
	}
	return r, nil
}

// Run uses a bounded worker pool over the global dependency graph.
func (r *RuleRunner) Run() (map[string]rules.Status, error) {
	return r.RunWithConcurrency(min(4, runtime.GOMAXPROCS(0)))
}

// RunWithConcurrency starts ready rules as slots become available, without a
// table or level barrier. A completion immediately releases its dependents.
// Same-table dependencies retain per-row results; cross-table dependencies must
// pass as a whole. Only the coordinator publishes outcomes and manages the DAG.
func (r *RuleRunner) RunWithConcurrency(limit int) (map[string]rules.Status, error) {
	if limit < 1 {
		return nil, fmt.Errorf("rule concurrency must be positive")
	}
	outcomes := map[string]*ruleOutcome{}
	pending := map[string]int{}
	consumers := map[string]int{}
	dependents := map[string][]string{}
	retainRows := map[string]bool{}
	queue := []string{}
	for _, id := range r.order {
		pending[id] = len(r.dependencies[id])
		if pending[id] == 0 {
			queue = append(queue, id)
		}
		for _, dependency := range r.dependencies[id] {
			dependents[dependency] = append(dependents[dependency], id)
		}
		for _, dependency := range r.config.Rule(id).DependsOn {
			consumers[dependency]++
			source, target := r.definitions[dependency], r.definitions[id]
			if source.Table != "" && source.Table == target.Table {
				retainRows[dependency] = true
			}
		}
	}
	type completion struct {
		id      string
		outcome *ruleOutcome
		err     error
	}
	done := make(chan completion, limit)
	running := 0
	var firstError error
	lib.AppLogger.Info(fmt.Sprintf("Global validation graph ready: %d rules, concurrency %d", len(r.order), limit))
	for len(queue) > 0 || running > 0 {
		for firstError == nil && len(queue) > 0 && running < limit {
			id := queue[0]
			queue = queue[1:]
			// Published prerequisite results are immutable. Workers never access
			// the coordinator's maps or each other's in-progress outcomes.
			prerequisites := map[string]*ruleOutcome{}
			for _, dependency := range r.config.Rule(id).DependsOn {
				prerequisites[dependency] = outcomes[dependency]
			}
			running++
			go func() {
				outcome, err := r.execute(id, prerequisites, retainRows[id])
				done <- completion{id, outcome, err}
			}()
		}
		if running == 0 {
			break
		}
		result := <-done
		running--
		outcomes[result.id] = result.outcome
		if result.err != nil && firstError == nil {
			firstError = fmt.Errorf("rule %s: %w", result.id, result.err)
		}
		for _, dependency := range r.config.Rule(result.id).DependsOn {
			consumers[dependency]--
			if consumers[dependency] == 0 {
				// Replace, rather than mutate, an outcome that workers may hold.
				previous := outcomes[dependency]
				outcomes[dependency] = &ruleOutcome{status: previous.status, seen: previous.seen}
			}
		}
		for _, id := range dependents[result.id] {
			pending[id]--
			if pending[id] == 0 {
				queue = append(queue, id)
			}
		}
	}
	// Running workers are drained before an error returns, so callers may safely
	// close SQLite and read/clear messages. No further work starts after an error.
	if firstError != nil {
		return nil, firstError
	}
	if len(outcomes) != len(r.order) {
		return nil, fmt.Errorf("rule graph stalled: completed %d of %d rules", len(outcomes), len(r.order))
	}
	statuses := make(map[string]rules.Status, len(outcomes))
	for id, outcome := range outcomes {
		statuses[id] = outcome.status
	}
	return statuses, nil
}

// execute owns one rule's row buffers, progress, and outcome for its entire run.
func (r *RuleRunner) execute(id string, prerequisites map[string]*ruleOutcome, retainRows bool) (*ruleOutcome, error) {
	definition := r.definitions[id]
	outcome := &ruleOutcome{status: rules.Skipped}
	if retainRows {
		outcome.rows = map[int]rules.Status{}
	}
	record := func(status rules.Status, members []int) {
		if !outcome.seen || status == rules.Failed || (status == rules.Skipped && outcome.status == rules.Passed) {
			outcome.status = status
		}
		outcome.seen = true
		if outcome.rows != nil && status != rules.Passed {
			for _, member := range members {
				outcome.rows[member] = status
			}
		}
	}
	ready := func(members []int) bool {
		for dependency, result := range prerequisites {
			source := r.definitions[dependency]
			if source.Table != "" && source.Table == definition.Table && len(members) > 0 {
				if !result.seen || result.rows == nil {
					return false
				}
				for _, member := range members {
					if status, exists := result.rows[member]; exists && status != rules.Passed {
						return false
					}
				}
			} else if result.status != rules.Passed {
				return false
			}
		}
		return true
	}
	if !definition.Always && rules.SeverityFor(r.config, id) == types.SEVERITY_IGNORE {
		lib.AppLogger.Debug("Skipped " + id + ": ignored")
		return outcome, nil
	}
	if definition.Run == nil && definition.Check == nil {
		lib.AppLogger.Info("Skipped " + id + ": no implementation")
		return outcome, nil
	}
	if definition.Check != nil && !r.tables.Has(definition.Table) {
		lib.AppLogger.Info("Skipped " + id + ": source table missing")
		return outcome, nil
	}
	// Avoid scanning a table when no row can be eligible. A partially failed
	// same-table prerequisite still allows its successful rows to continue.
	for dependency, result := range prerequisites {
		rowDependency := definition.Check != nil && definition.Table != "" && r.definitions[dependency].Table == definition.Table
		if (rowDependency && (!result.seen || result.rows == nil)) || (!rowDependency && result.status != rules.Passed) {
			lib.AppLogger.Info("Skipped " + id + ": prerequisite " + dependency + " did not pass")
			return outcome, nil
		}
	}
	started := time.Now()
	lib.AppLogger.Info("Running " + id)
	defer func() {
		status := map[rules.Status]string{rules.Passed: "passed", rules.Failed: "failed", rules.Skipped: "skipped"}[outcome.status]
		lib.AppLogger.Info(fmt.Sprintf("Completed %s: %s (%s)", id, status, time.Since(started).Round(time.Millisecond)))
	}()
	if definition.Run != nil {
		if ready(nil) {
			record(definition.Run(), nil)
		}
		return outcome, nil
	}
	table, err := r.tables.Table(definition.Table)
	if err != nil {
		outcome.status = rules.Failed
		return outcome, err
	}
	checkedRows, checkedGroups := 0, 0
	lastProgress := started
	evaluate := func(row *SQLiteRow, members []int) {
		status := rules.Skipped
		if ready(members) {
			before := AppMessageService.RuleIssueCount(id)
			if err := definition.Check(row.Context(), r.config.Rule(id)); err != nil {
				ctx := lib.NewValidationContext("N/A", definition.Table+".txt", id, row.Row, AppMessageService)
				ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
				status = rules.Failed
			} else if AppMessageService.RuleIssueCount(id) != before {
				status = rules.Failed
			} else {
				status = rules.Passed
			}
			checkedRows += len(members)
			if definition.GroupField != "" {
				checkedGroups++
			}
			if time.Since(lastProgress) >= 5*time.Second {
				lib.AppLogger.Info(fmt.Sprintf("Running %s: %d rows, %d groups checked (%s)", id, checkedRows, checkedGroups, time.Since(started).Round(time.Second)))
				lastProgress = time.Now()
			}
		}
		record(status, members)
	}
	run := func(members []int, grouped bool) error {
		if definition.GroupField != "" && !grouped {
			record(rules.Skipped, members)
			return nil
		}
		rows, err := table.readValidationRows(members)
		if err != nil {
			return err
		}
		if definition.GroupField != "" {
			evaluate(rows[0], members)
		} else {
			for _, row := range rows {
				evaluate(row, []int{row.Row})
			}
		}
		return nil
	}
	if definition.GroupField != "" {
		var groups []sqliteRowGroup
		groups, err = table.rowGroups(definition.GroupField)
		if err == nil {
			for _, group := range groups {
				if err = run(group.rows, group.grouped); err != nil {
					break
				}
			}
		}
	} else {
		const batchSize = 500
		members := make([]int, 0, batchSize)
		err = table.ForEachRow(func(row *SQLiteRow) error {
			members = append(members, row.Row)
			if len(members) < batchSize {
				return nil
			}
			if err := run(members, false); err != nil {
				return err
			}
			members = members[:0]
			return nil
		})
		if err == nil && len(members) > 0 {
			err = run(members, false)
		}
	}
	if err != nil {
		outcome.status = rules.Failed
	}
	return outcome, err
}
