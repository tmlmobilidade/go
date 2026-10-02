package rules

import (
	"encoding/json"
	"fmt"
	"main/types"
	"reflect"
	"slices"
	"strings"
)

// DecodeConfig requires every supported rule and an explicit severity.
// Unsupported sections and keys are ignored; they cannot replace required rules.
func DecodeConfig(data []byte) (types.GtfsRules, error) {
	result := DefaultConfig()
	var raw map[string]json.RawMessage
	if err := json.Unmarshal(data, &raw); err != nil {
		return result, err
	}
	if raw == nil {
		return result, fmt.Errorf("rules must be an object")
	}
	groups := reflect.TypeOf(result)
	missing := []string{}
	for i := range groups.NumField() {
		group := groups.Field(i)
		name := group.Tag.Get("json")
		section := map[string]json.RawMessage{}
		if sectionData, exists := raw[name]; exists {
			if err := json.Unmarshal(sectionData, &section); err != nil {
				return result, fmt.Errorf("%s: %w", name, err)
			}
			if section == nil {
				return result, fmt.Errorf("%s: expected a rules object", name)
			}
		}
		for j := range group.Type.NumField() {
			field := group.Type.Field(j)
			key := field.Tag.Get("json")
			path := name + "." + key
			value, exists := section[key]
			if !exists {
				// The meta-section's _file setting is not a configurable rule.
				if name != "file_validation" || key != "_file" {
					missing = append(missing, path)
				}
				continue
			}
			if field.Type == ruleConfigType {
				var rule map[string]json.RawMessage
				if err := json.Unmarshal(value, &rule); err != nil {
					return result, fmt.Errorf("%s: %w", path, err)
				}
				if rule == nil {
					return result, fmt.Errorf("%s: expected a rule object", path)
				}
				value, exists = rule["severity"]
				if !exists {
					return result, fmt.Errorf("%s.severity: required (use ignore to disable the rule)", path)
				}
				path += ".severity"
			}
			var severity types.Severity
			if err := json.Unmarshal(value, &severity); err != nil {
				return result, fmt.Errorf("%s: %w", path, err)
			}
			if !slices.Contains(Severities, severity) {
				return result, fmt.Errorf("%s: invalid severity %q", path, severity)
			}
		}
	}
	if len(missing) > 0 {
		return result, fmt.Errorf("missing rules: %s", strings.Join(missing, ", "))
	}
	if err := json.Unmarshal(data, &result); err != nil {
		return result, err
	}
	return result, nil
}
