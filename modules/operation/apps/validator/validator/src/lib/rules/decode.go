package rules

import (
	"encoding/json"
	"fmt"
	"main/types"
	"reflect"
	"slices"
)

// DecodeConfig defaults absent settings only. Null objects and invalid explicit
// severities are rejected instead of being silently replaced by defaults.
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
	for i := range groups.NumField() {
		group := groups.Field(i)
		name := group.Tag.Get("json")
		sectionData, exists := raw[name]
		if !exists {
			continue
		}
		var section map[string]json.RawMessage
		if err := json.Unmarshal(sectionData, &section); err != nil {
			return result, fmt.Errorf("%s: %w", name, err)
		}
		if section == nil {
			return result, fmt.Errorf("%s: expected a rules object", name)
		}
		for j := range group.Type.NumField() {
			field := group.Type.Field(j)
			key := field.Tag.Get("json")
			value, exists := section[key]
			if !exists {
				continue
			}
			path := name + "." + key
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
					continue
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
	if err := json.Unmarshal(data, &result); err != nil {
		return result, err
	}
	return result, nil
}
