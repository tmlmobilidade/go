package rules

import (
	"fmt"
	"main/types"
	"reflect"
	"slices"
	"strings"
)

var ruleConfigType = reflect.TypeOf(types.RuleConfig{})

// RuleIDs returns the rule ids (json tags of RuleConfig fields) of a rules section,
// e.g. types.AgencyRules, in declaration order
func RuleIDs(section any) []string {
	ids := []string{}
	forEachRuleConfig(section, func(id string, _ types.RuleConfig) {
		ids = append(ids, id)
	})
	return ids
}

// DependenciesFrom combines structural prerequisites from dependencies.json
// with additional depends_on edges saved in the file's rule configuration.
func DependenciesFrom(section any) map[string][]string {
	deps := map[string][]string{}
	group := SectionName(section)
	forEachRuleConfig(section, func(id string, config types.RuleConfig) {
		deps[id] = DefaultDependencies(group, id)
		for _, dependency := range config.DependsOn {
			if !slices.Contains(deps[id], dependency) {
				deps[id] = append(deps[id], dependency)
			}
		}
	})
	return deps
}

// WithDependencies returns a copy of list where each rule's DependsOn is taken from deps
func WithDependencies[T any](list []Rule[T], deps map[string][]string) []Rule[T] {
	result := make([]Rule[T], len(list))
	for i, r := range list {
		if d, ok := deps[r.ID]; ok {
			r.DependsOn = d
		}
		result[i] = r
	}
	return result
}

// ValidateSection checks that every depends_on in a rules section points to a rule
// of the same section (or its file-presence node) and that there are no cycles
func ValidateSection(section any) error {
	deps := DependenciesFrom(section)
	group := SectionName(section)
	for id, prerequisites := range deps {
		scope := defaultDependencies[group][id].Scope
		for _, prerequisite := range prerequisites {
			prerequisiteScope := defaultDependencies[group][prerequisite].Scope
			if prerequisiteScope != "" && scope != prerequisiteScope {
				return fmt.Errorf("rule %q cannot depend on %q in %s scope", id, prerequisite, prerequisiteScope)
			}
		}
	}
	list := []Rule[struct{}]{{ID: FileNode(SectionName(section))}}
	for _, id := range RuleIDs(section) {
		list = append(list, Rule[struct{}]{ID: id, DependsOn: deps[id]})
	}
	_, err := NewManager(list...)
	return err
}

func forEachRuleConfig(section any, fn func(id string, config types.RuleConfig)) {
	v := reflect.ValueOf(section)
	if v.Kind() == reflect.Ptr {
		if v.IsNil() {
			v = reflect.Zero(v.Type().Elem())
		} else {
			v = v.Elem()
		}
	}
	if v.Kind() != reflect.Struct {
		return
	}
	t := v.Type()
	for i := range v.NumField() {
		field := t.Field(i)
		if field.Type != ruleConfigType {
			continue
		}
		id, _, _ := strings.Cut(field.Tag.Get("json"), ",")
		if id == "" || id == "-" {
			continue
		}
		fn(id, v.Field(i).Interface().(types.RuleConfig))
	}
}
