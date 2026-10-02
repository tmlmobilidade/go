package services

import (
	"fmt"
	"main/lib/rules"
	"main/types"
	"reflect"
)

// RuleActions bind validator functions to configuration keys. The DAG, rather
// than the order of these bindings, determines execution.
type RuleActions map[string]func()

type ruleInput struct {
	actions RuleActions
	seed    map[string]rules.Status
}

type RuleRunner struct {
	manager *rules.Manager[ruleInput]
	known   map[string]bool
}

// NewRuleRunner builds a plan once per file. Rows get independent statuses;
// grouped checks can seed the same plan with their members' row outcomes.
func NewRuleRunner(gtfs types.Gtfs, section any) (*RuleRunner, error) {
	group := rules.SectionName(section)
	if group == "" {
		return nil, fmt.Errorf("unknown rule section %T", section)
	}
	if err := rules.ValidateSection(section); err != nil {
		return nil, fmt.Errorf("%s: %w", group, err)
	}
	dependencies := rules.DependenciesFrom(section)
	configured := reflect.ValueOf(section)
	if configured.Kind() == reflect.Ptr && !configured.IsNil() {
		configured = configured.Elem()
	}
	severities := map[string]types.Severity{}
	if configured.Kind() == reflect.Struct {
		for i := range configured.NumField() {
			if config, ok := configured.Field(i).Interface().(types.RuleConfig); ok {
				severities[configured.Type().Field(i).Tag.Get("json")] = config.Severity
			}
		}
	}
	entries := map[string]rules.CatalogueEntry{}
	for _, entry := range rules.Catalogue() {
		if entry.Group == group && entry.Editable {
			entries[entry.ConfigKey] = entry
		}
	}
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
			if severity, explicit := severities[id]; explicit && (severity == "" || severity == types.SEVERITY_IGNORE) {
				return rules.Skipped
			}
			before := AppMessageService.RuleIssueCount(entries[id])
			run()
			if AppMessageService.RuleIssueCount(entries[id]) != before {
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
	return &RuleRunner{manager: manager, known: known}, nil
}

func (r *RuleRunner) Run(actions RuleActions, seed map[string]rules.Status) map[string]rules.Status {
	for id := range actions {
		if !r.known[id] {
			panic(fmt.Sprintf("validator binds unknown rule %q", id))
		}
	}
	return r.manager.RunRow(ruleInput{actions: actions, seed: seed})
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
