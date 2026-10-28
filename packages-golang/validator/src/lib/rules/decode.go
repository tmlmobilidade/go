package rules

import (
	"encoding/json"
	"fmt"
	"main/types"
	"slices"
)

// DecodeConfig accepts a flat rule-ID map, optionally wrapped in validation_rules.
// Each key is looked up directly; file sections are not part of this format.
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
	for id, data := range raw {
		if slices.Contains(types.GtfsRuleFiles, id) {
			return result, fmt.Errorf("rules must be keyed by rule ID, not by file section %q", id)
		}
		config := types.RuleContext{Severity: types.SEVERITY_IGNORE}
		var object map[string]json.RawMessage
		if err := json.Unmarshal(data, &object); err != nil {
			return result, fmt.Errorf("%s: expected a rule object: %w", id, err)
		}
		if object == nil {
			return result, fmt.Errorf("%s: expected a rule object", id)
		}
		if err := json.Unmarshal(data, &config); err != nil {
			return result, fmt.Errorf("%s: %w", id, err)
		}
		if !slices.Contains(Severities, config.Severity) {
			return result, fmt.Errorf("%s: invalid severity %q", id, config.Severity)
		}
		file := FileForRuleID(id)
		if file == "" {
			return result, fmt.Errorf("%s: unknown file prefix", id)
		}
		if id == file+"_file_missing" && len(config.DependsOn) > 0 {
			return result, fmt.Errorf("%s.depends_on: file-presence rules cannot have prerequisites", id)
		}
		result[id] = config
	}
	return result, nil
}
