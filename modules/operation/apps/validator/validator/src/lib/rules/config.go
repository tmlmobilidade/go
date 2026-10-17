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

// DependenciesFrom reads only the prerequisites supplied in rules.json.
func DependenciesFrom(section any) map[string][]string {
	deps := map[string][]string{}
	forEachRuleConfig(section, func(id string, config types.RuleConfig) {
		deps[id] = slices.Clone(config.DependsOn)
	})
	return deps
}

// ValidateSection checks that every depends_on in a rules section points to a rule
// of the same section (or its file-presence node) and that there are no cycles
func ValidateSection(section any) error {
	deps := DependenciesFrom(section)
	scopes := map[string]string{}
	v := ruleSectionValue(section)
	if v.Kind() == reflect.Struct {
		for i := range v.NumField() {
			field := v.Type().Field(i)
			scopes[field.Tag.Get("json")] = field.Tag.Get("scope")
		}
	}
	for id, prerequisites := range deps {
		scope := scopes[id]
		for _, prerequisite := range prerequisites {
			prerequisiteScope := scopes[prerequisite]
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

func ruleSectionValue(section any) reflect.Value {
	v := reflect.ValueOf(section)
	if v.Kind() == reflect.Ptr {
		if v.IsNil() {
			v = reflect.Zero(v.Type().Elem())
		} else {
			v = v.Elem()
		}
	}
	return v
}

func forEachRuleConfig(section any, fn func(id string, config types.RuleConfig)) {
	v := ruleSectionValue(section)
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

// Severities lists the severity values accepted by the validator.
var Severities = []types.Severity{types.SEVERITY_ERROR, types.SEVERITY_WARNING, types.SEVERITY_INFO, types.SEVERITY_IGNORE, types.SEVERITY_FORBIDDEN}

// DefaultConfig fills omitted settings before JSON decoding; explicit invalid values
// still replace these defaults and are rejected by the parser.
func DefaultConfig() types.GtfsRules {
	result := types.GtfsRules{}
	groups := reflect.ValueOf(&result).Elem()
	for i := range groups.NumField() {
		group := groups.Field(i)
		for j := range group.NumField() {
			field := group.Field(j)
			if field.Type() == ruleConfigType {
				field.Set(reflect.ValueOf(types.RuleConfig{Severity: types.SEVERITY_IGNORE}))
			} else if field.Type() == reflect.TypeOf(types.Severity("")) {
				field.SetString(string(types.SEVERITY_IGNORE))
			}
		}
	}
	return result
}

func FileSeverity(config *types.GtfsRules, groupName string) types.Severity {
	if config == nil {
		return types.SEVERITY_IGNORE
	}
	groups := reflect.ValueOf(config).Elem()
	for i := range groups.NumField() {
		if groups.Type().Field(i).Tag.Get("json") == groupName {
			return types.Severity(groups.Field(i).FieldByName("File").String())
		}
	}
	return types.SEVERITY_IGNORE
}

func FileNode(group string) string { return group + "_file_present" }

func SectionName(section any) string {
	t := reflect.TypeOf(section)
	if t == nil {
		return ""
	}
	if t.Kind() == reflect.Ptr {
		t = t.Elem()
	}
	root := reflect.TypeOf(types.GtfsRules{})
	for i := range root.NumField() {
		if root.Field(i).Type == t {
			return root.Field(i).Tag.Get("json")
		}
	}
	return ""
}
