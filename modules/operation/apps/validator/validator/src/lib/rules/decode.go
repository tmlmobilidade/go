package rules

import (
	"encoding/json"
	"fmt"
	"main/types"
	"slices"
)

// DecodeConfig accepts a flat rule-ID map, optionally wrapped in validation_rules.
// Legacy file sections are flattened at the input boundary.
func DecodeConfig(data []byte) (types.GtfsRules, error) {
	result := DefaultConfig()
	var raw map[string]json.RawMessage
	if err := json.Unmarshal(data, &raw); err != nil {
		return result, err
	}
	if raw == nil {
		return result, fmt.Errorf("rules must be an object")
	}
	if wrapped, exists := raw["validation_rules"]; exists {
		raw = nil
		if err := json.Unmarshal(wrapped, &raw); err != nil {
			return result, fmt.Errorf("validation_rules: %w", err)
		}
		if raw == nil {
			return result, fmt.Errorf("validation_rules: expected a rules object")
		}
	}
	decodeRule := func(id string, data json.RawMessage) error {
		if _, exists := result[id]; exists {
			return fmt.Errorf("duplicate rule %q", id)
		}
		config := types.RuleContext{Severity: types.SEVERITY_IGNORE}
		var object map[string]json.RawMessage
		if err := json.Unmarshal(data, &object); err != nil {
			return fmt.Errorf("%s: expected a rule object: %w", id, err)
		}
		if object == nil {
			return fmt.Errorf("%s: expected a rule object", id)
		}
		if err := json.Unmarshal(data, &config); err != nil {
			return fmt.Errorf("%s: %w", id, err)
		}
		if !slices.Contains(Severities, config.Severity) {
			return fmt.Errorf("%s: invalid severity %q", id, config.Severity)
		}
		file := FileForRuleID(id)
		if file == "" {
			return fmt.Errorf("%s: unknown file prefix", id)
		}
		if id == FileNode(file) {
			return fmt.Errorf("%s: reserved file-presence node", id)
		}
		if id == file+"_file_missing" && len(config.DependsOn) > 0 {
			return fmt.Errorf("%s.depends_on: file-presence rules cannot have prerequisites", id)
		}
		result[id] = config
		return nil
	}
	for key, data := range raw {
		if slices.Contains(types.GtfsRuleFiles, key) || key == "file_validation" {
			var entries map[string]json.RawMessage
			if err := json.Unmarshal(data, &entries); err != nil {
				return result, fmt.Errorf("%s: %w", key, err)
			}
			if entries == nil {
				return result, fmt.Errorf("%s: expected a rules object", key)
			}
			for id, value := range entries {
				if id == "_file" {
					var severity types.Severity
					if err := json.Unmarshal(value, &severity); err != nil {
						return result, fmt.Errorf("%s._file: %w", key, err)
					}
					if !slices.Contains(Severities, severity) {
						return result, fmt.Errorf("%s._file: invalid severity %q", key, severity)
					}
					if key != "file_validation" {
						result[key+"_file_missing"] = types.RuleContext{Severity: severity}
					}
					continue
				}
				if err := decodeRule(id, value); err != nil {
					return result, err
				}
			}
			continue
		}
		if err := decodeRule(key, data); err != nil {
			return result, err
		}
	}
	return result, nil
}
