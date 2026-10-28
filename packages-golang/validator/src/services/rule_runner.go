package services

import (
	"fmt"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib/rules"
	"main/types"
)

// RuleActions bind validator functions to configuration keys. The DAG, rather
// than the order of these bindings, determines execution.
type RuleActions map[string]func()

type ruleInput struct {
	actions RuleActions
	seed    map[string]rules.Status
}

type RuleRunner struct {
	manager      *rules.Manager[ruleInput]
	known        map[string]bool
	section      *types.GtfsRules
	dependencies map[string][]string
	fileNode     string
	filePresent  bool
}

// NewRuleRunner builds a plan once per file. Rows get independent statuses;
// grouped checks can seed the same plan with their members' row outcomes.
func NewRuleRunner(gtfs types.Gtfs, config *types.GtfsRules, group string) (*RuleRunner, error) {
	section := rules.ForFile(config, group)
	if err := rules.ValidateDependencies(section, group); err != nil {
		return nil, fmt.Errorf("%s: %w", group, err)
	}
	dependencies := rules.DependenciesFrom(section)
	filePresent := gtfs.HasTable(group)
	list := []rules.Rule[ruleInput]{{ID: rules.FileNode(group), Run: func(ruleInput) rules.Status {
		if filePresent {
			return rules.Passed
		}
		return rules.Failed
	}}}
	for _, id := range rules.RuleIDs(section) {
		list = append(list, rules.Rule[ruleInput]{ID: id, DependsOn: dependencies[id], Run: func(input ruleInput) rules.Status {
			run, exists := input.actions[id]
			if !exists {
				if status, ok := input.seed[id]; ok {
					return status
				}
				return rules.Skipped // An unimplemented or out-of-phase rule never passes.
			}
			if rules.SeverityFor(section, id) == types.SEVERITY_IGNORE {
				return rules.Skipped
			}
			before := AppMessageService.RuleIssueCount(id)
			run()
			if AppMessageService.RuleIssueCount(id) != before {
				return rules.Failed
			}
			return rules.Passed
		}})
	}
	manager, err := rules.NewManager(list...)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", group, err)
	}
	known := make(map[string]bool)
	for _, id := range rules.RuleIDs(section) {
		known[id] = true
	}
	return &RuleRunner{manager: manager, known: known, section: section, dependencies: dependencies, fileNode: rules.FileNode(group), filePresent: filePresent}, nil
}

// RunTable executes all rules in dependency order for each independent group.
// Row prerequisites are checked independently. A grouped rule requires every
// member's prerequisites to pass and runs once using the group's first row.
// Empty group keys still receive row checks, but do not form a group.
// onRow reports completed validation, including grouped rules and their dependents.
func (r *RuleRunner) RunTable(table *SQLiteTable, scope, groupField string, actions func(*SQLiteContext) RuleActions, onRow func()) error {
	if scope == "" || groupField == "" {
		return fmt.Errorf("table validation requires a group scope and field")
	}
	order := r.manager.Order()
	for _, id := range order {
		if ruleScope := rules.ExecutionScope(id); ruleScope != "" && ruleScope != scope {
			return fmt.Errorf("rule %q uses %s scope, not %s", id, ruleScope, scope)
		}
	}

	groups, err := table.rowGroups(groupField)
	if err != nil {
		return err
	}

	for _, group := range groups {
		// Register once per row, rather than rebuilding every rule's closures
		// and SQLite context for every rule on every row. Keep only this group's
		// actions and outcomes in memory, sharing its SQLite reads across rules.
		rows, err := table.readValidationRows(group.rows)
		if err != nil {
			return err
		}
		rowActions := make([]RuleActions, len(group.rows))
		for i, row := range rows {
			rowActions[i] = actions(row.Context())
		}
		statuses := make(map[string][]rules.Status, len(order))
		for _, id := range order {
			outcomes := make([]rules.Status, len(group.rows))
			for i := range outcomes {
				outcomes[i] = rules.Skipped
			}
			statuses[id] = outcomes
			if id == r.fileNode {
				for i := range outcomes {
					outcomes[i] = rules.Failed
					if r.filePresent {
						outcomes[i] = rules.Passed
					}
				}
				continue
			}
			if rules.SeverityFor(r.section, id) == types.SEVERITY_IGNORE {
				continue
			}
			run := func(first, end int) {
				for _, dependency := range r.dependencies[id] {
					for member := first; member < end; member++ {
						if statuses[dependency][member] != rules.Passed {
							return
						}
					}
				}
				action, exists := rowActions[first][id]
				if !exists {
					return
				}
				before := AppMessageService.RuleIssueCount(id)
				action()
				status := rules.Passed
				if AppMessageService.RuleIssueCount(id) != before {
					status = rules.Failed
				}
				for member := first; member < end; member++ {
					outcomes[member] = status
				}
			}
			if rules.ExecutionScope(id) == scope {
				if group.grouped {
					run(0, len(group.rows))
				}
			} else {
				for i := range group.rows {
					run(i, i+1)
				}
			}
		}
		if onRow != nil {
			for range group.rows {
				onRow()
			}
		}
	}
	return nil
}

func (r *RuleRunner) Run(actions RuleActions, seed map[string]rules.Status) map[string]rules.Status {
	statuses := r.manager.RunRow(ruleInput{actions: actions, seed: seed})
	for id := range actions {
		if !r.known[id] {
			statuses[id] = rules.Skipped
		}
	}
	return statuses
}

// MergeRuleStatuses aggregates only the rows belonging to one trip/pattern/shape.
// A group prerequisite passes only when it passed for every member.
func MergeRuleStatuses(target map[string]rules.Status, row map[string]rules.Status) map[string]rules.Status {
	if target == nil {
		target = make(map[string]rules.Status, len(row))
	}
	for id, status := range row {
		if previous, exists := target[id]; !exists || previous == rules.Passed {
			target[id] = status
		}
	}
	return target
}
