package services

import (
	"fmt"
	"sort"
	"strings"
	"time"

	"github.com/tmlmobilidade/go/packages-golang/validator/src/config"
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
	config      *types.GtfsRules
	tables      *SQLiteTables
	definitions map[string]RuleDefinition
	order       []string
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
	// Preserve a deterministic preference for row, route, pattern, then shape
	// checks (pattern diagnostics suppress duplicate shape diagnostics). Explicit
	// dependencies always take precedence, including dependencies across scopes.
	rank := func(field string) int {
		switch field {
		case "":
			return 0
		case "route_id":
			return 1
		case "pattern_id":
			return 2
		default:
			return 3
		}
	}
	sort.SliceStable(ids, func(i, j int) bool {
		a, b := r.definitions[ids[i]], r.definitions[ids[j]]
		if a.Table != b.Table {
			return a.Table < b.Table
		}
		if rank(a.GroupField) != rank(b.GroupField) {
			return rank(a.GroupField) < rank(b.GroupField)
		}
		return a.ID < b.ID
	})
	visited := map[string]bool{}
	var visit func(string)
	visit = func(id string) {
		if visited[id] {
			return
		}
		visited[id] = true
		for _, dependency := range config.Rule(id).DependsOn {
			visit(dependency)
		}
		r.order = append(r.order, id)
	}
	for _, id := range ids {
		visit(id)
	}
	return r, nil
}

// Run completes prerequisites before dependents. Same-table dependencies use
// the affected rows (including every member of a group); dependencies on other
// data sources require the prerequisite's complete result to pass. No rows,
// ignored checks, and unavailable implementations produce Skipped, not Passed.
func (r *RuleRunner) Run() (map[string]rules.Status, error) {
	outcomes := map[string]*ruleOutcome{}
	remaining := map[string]int{}
	retainRows := map[string]bool{}
	for _, id := range r.order {
		outcomes[id] = &ruleOutcome{status: rules.Skipped}
		for _, dependency := range r.config.Rule(id).DependsOn {
			remaining[dependency]++
			source, target := r.definitions[dependency], r.definitions[id]
			if source.Table != "" && source.Table == target.Table {
				retainRows[dependency] = true
			}
		}
	}
	for id := range retainRows {
		outcomes[id].rows = map[int]rules.Status{}
	}
	record := func(id string, status rules.Status, members []int) {
		outcome := outcomes[id]
		if !outcome.seen || status == rules.Failed || (status == rules.Skipped && outcome.status == rules.Passed) {
			outcome.status = status
		}
		outcome.seen = true
		if outcome.rows != nil {
			for _, member := range members {
				if status != rules.Passed {
					outcome.rows[member] = status
				}
			}
		}
	}
	ready := func(id string, members []int) bool {
		for _, dependency := range r.config.Rule(id).DependsOn {
			source := r.definitions[dependency]
			outcome := outcomes[dependency]
			if source.Table != "" && source.Table == r.definitions[id].Table && len(members) > 0 {
				if !outcome.seen || outcome.rows == nil {
					return false
				}
				for _, member := range members {
					if status, exists := outcome.rows[member]; exists && status != rules.Passed {
						return false
					}
				}
			} else if outcome.status != rules.Passed {
				return false
			}
		}
		return true
	}
	active := func(id string) bool {
		return r.definitions[id].Always || rules.SeverityFor(r.config, id) != types.SEVERITY_IGNORE
	}
	enabled := 0
	for _, id := range r.order {
		if active(id) {
			enabled++
		}
	}
	lib.AppLogger.Info(fmt.Sprintf("Global validation graph ready: %d rules, %d enabled (including file checks)", len(r.order), enabled))
	rowCounts := map[string]int{}
	finish := func(ids []string) {
		for _, id := range ids {
			for _, dependency := range r.config.Rule(id).DependsOn {
				remaining[dependency]--
				if remaining[dependency] == 0 {
					outcomes[dependency].rows = nil
				}
			}
		}
	}
	for start := 0; start < len(r.order); {
		id := r.order[start]
		definition := r.definitions[id]
		if definition.Check == nil || !active(id) {
			if definition.Run != nil && active(id) && ready(id, nil) {
				record(id, definition.Run(), nil)
			}
			finish([]string{id})
			start++
			continue
		}
		// Adjacent rules using the same rows share bounded reads. This avoids
		// retaining per-row closures or re-reading each field for every rule.
		end := start + 1
		for end < len(r.order) {
			next := r.definitions[r.order[end]]
			if next.Check == nil || next.Table != definition.Table || next.GroupField != definition.GroupField {
				break
			}
			end++
		}
		batch := r.order[start:end]
		if r.tables == nil || !r.tables.Has(definition.Table) {
			finish(batch)
			start = end
			continue
		}
		table, err := r.tables.Table(definition.Table)
		if err != nil {
			return nil, err
		}
		label := batch[0]
		if len(batch) > 1 {
			label += " ... " + batch[len(batch)-1]
		}
		lib.AppLogger.Info(fmt.Sprintf("Validating %s: %s (rules %d-%d/%d)", definition.Table, label, start+1, end, len(r.order)))
		lib.AppLogger.Debug("Batch rule IDs: " + strings.Join(batch, ", "))
		totalRows, counted := rowCounts[definition.Table]
		if !counted {
			totalRows, err = table.Count()
			if err != nil {
				return nil, err
			}
			rowCounts[definition.Table] = totalRows
		}
		progressLabel := fmt.Sprintf("%s [rules %d-%d/%d]", definition.Table, start+1, end, len(r.order))
		progress := lib.NewProgressTracker(progressLabel, totalRows, config.ProgressThresholdLarge)
		started := time.Now()
		lastProgress := started
		processedRows, processedGroups := 0, 0
		run := func(members []int, grouped bool) error {
			rows, err := table.readValidationRows(members)
			if err != nil {
				return err
			}
			for _, id := range batch {
				check := r.definitions[id]
				evaluate := func(row *SQLiteRow, members []int) {
					status := rules.Skipped
					if active(id) && ready(id, members) {
						before := AppMessageService.RuleIssueCount(id)
						if err := check.Check(row.Context(), r.config.Rule(id)); err != nil {
							ctx := lib.NewValidationContext("N/A", check.Table+".txt", id, row.Row, AppMessageService)
							ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
							status = rules.Failed
						} else if AppMessageService.RuleIssueCount(id) != before {
							status = rules.Failed
						} else {
							status = rules.Passed
						}
					}
					record(id, status, members)
				}
				if check.GroupField != "" {
					if grouped {
						evaluate(rows[0], members)
					} else {
						record(id, rules.Skipped, members)
					}
				} else {
					for _, row := range rows {
						evaluate(row, []int{row.Row})
					}
				}
			}
			processedRows += len(members)
			for range members {
				progress.Track()
			}
			if grouped {
				processedGroups++
			}
			if time.Since(lastProgress) >= 5*time.Second {
				lib.AppLogger.Info(fmt.Sprintf("Validating %s [%s]: %d rows, %d groups processed in %s", definition.Table, label, processedRows, processedGroups, time.Since(started).Round(time.Second)))
				lastProgress = time.Now()
			}
			return nil
		}
		if definition.GroupField != "" {
			groups, err := table.rowGroups(definition.GroupField)
			if err != nil {
				return nil, err
			}
			for _, group := range groups {
				if err := run(group.rows, group.grouped); err != nil {
					return nil, err
				}
			}
		} else {
			const batchSize = 500
			members := make([]int, 0, batchSize)
			err := table.ForEachRow(func(row *SQLiteRow) error {
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
			if err != nil {
				return nil, err
			}
			if len(members) > 0 {
				if err := run(members, false); err != nil {
					return nil, err
				}
			}
		}
		progress.Complete()
		lib.AppLogger.Debug(fmt.Sprintf("Completed %s [%s] in %s", definition.Table, label, time.Since(started).Round(time.Millisecond)))
		finish(batch)
		start = end
	}
	statuses := make(map[string]rules.Status, len(outcomes))
	for id, outcome := range outcomes {
		statuses[id] = outcome.status
	}
	return statuses, nil
}
