package rules

import (
	"encoding/json"
	"fmt"
	"main/types"
	"reflect"
	"slices"
	"strings"
)

// DecodeConfig accepts a flat rule-ID map, optionally wrapped in validation_rules,
// or the legacy file sections. Every supported rule needs an explicit severity.
// Unsupported keys are ignored; they cannot replace required rules.
func DecodeConfig(data []byte) (types.GtfsRules, error) {
	result := DefaultConfig()
	var raw map[string]json.RawMessage
	if err := json.Unmarshal(data, &raw); err != nil {
		return result, err
	}
	if raw == nil {
		return result, fmt.Errorf("rules must be an object")
	}
	flat := false
	if wrapped, exists := raw["validation_rules"]; exists {
		raw = nil
		if err := json.Unmarshal(wrapped, &raw); err != nil {
			return result, fmt.Errorf("validation_rules: %w", err)
		}
		if raw == nil {
			return result, fmt.Errorf("validation_rules: expected a rules object")
		}
		flat = true
	} else {
		groups := reflect.TypeOf(result)
		for i := range groups.NumField() {
			group := groups.Field(i)
			if _, exists := raw[group.Tag.Get("json")+"_file_missing"]; exists {
				flat = true
			}
			for _, id := range RuleIDs(reflect.New(group.Type).Elem().Interface()) {
				if _, exists := raw[id]; exists {
					flat = true
				}
			}
		}
	}
	groups := reflect.TypeOf(result)
	values := reflect.ValueOf(&result).Elem()
	missing := []string{}
	for i := range groups.NumField() {
		group := groups.Field(i)
		name := group.Tag.Get("json")
		section := map[string]json.RawMessage{}
		if flat {
			section = raw
		} else if sectionData, exists := raw[name]; exists {
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
			if flat {
				if key == "_file" {
					if name == "file_validation" {
						continue
					}
					key = name + "_file_missing"
				}
				path = key
			}
			value, exists := section[key]
			if !exists {
				// The meta-section's _file setting is not a configurable rule.
				if name != "file_validation" || key != "_file" {
					missing = append(missing, path)
				}
				continue
			}
			configData := value
			if flat || field.Type == ruleConfigType {
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
			target := values.Field(i).Field(j)
			if field.Type == ruleConfigType {
				if err := json.Unmarshal(configData, target.Addr().Interface()); err != nil {
					return result, fmt.Errorf("%s: %w", key, err)
				}
			} else {
				if flat {
					var config types.RuleConfig
					if err := json.Unmarshal(configData, &config); err != nil {
						return result, fmt.Errorf("%s: %w", key, err)
					}
					if len(config.DependsOn) > 0 {
						return result, fmt.Errorf("%s.depends_on: file-presence rules cannot have prerequisites", key)
					}
				}
				target.SetString(string(severity))
			}
		}
	}
	if len(missing) > 0 {
		return result, fmt.Errorf("missing rules: %s", strings.Join(missing, ", "))
	}
	return result, nil
}
