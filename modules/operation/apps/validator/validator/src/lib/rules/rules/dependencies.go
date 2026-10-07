package rules

import (
	_ "embed"
	"encoding/json"
	"fmt"
	"main/types"
	"reflect"
	"slices"
)

// dependencyJSON is the single source of structural prerequisites. Agency JSON
// may add edges through depends_on; it cannot remove these prerequisites.
//
//go:embed dependencies.json
var dependencyJSON []byte

type dependencyDefinition struct {
	DependsOn []string `json:"depends_on"`
	Scope     string   `json:"scope,omitempty"`
}

var defaultDependencies = func() map[string]map[string]dependencyDefinition {
	var result map[string]map[string]dependencyDefinition
	if err := json.Unmarshal(dependencyJSON, &result); err != nil {
		panic(err)
	}
	return result
}()

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

func DefaultDependencies(group, key string) []string {
	return slices.Clone(defaultDependencies[group][key].DependsOn)
}

// ValidateDependencyContract makes omissions and stale names fail explicitly.
func ValidateDependencyContract() error {
	root := reflect.TypeOf(types.GtfsRules{})
	if len(defaultDependencies) != root.NumField() {
		return fmt.Errorf("dependency section count does not match GtfsRules")
	}
	for i := range root.NumField() {
		section := reflect.New(root.Field(i).Type).Elem().Interface()
		group := root.Field(i).Tag.Get("json")
		if len(defaultDependencies[group]) != len(RuleIDs(section)) {
			return fmt.Errorf("incomplete dependency contract for %s", group)
		}
		for _, id := range RuleIDs(section) {
			if _, ok := defaultDependencies[group][id]; !ok {
				return fmt.Errorf("missing dependency declaration for %s.%s", group, id)
			}
		}
		if err := ValidateSection(section); err != nil {
			return fmt.Errorf("%s: %w", group, err)
		}
	}
	return nil
}
