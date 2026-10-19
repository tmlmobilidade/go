package rules

import (
	"encoding/json"
	"fmt"
	"main/types"
	"reflect"
	"slices"
	"strings"
)

// DecodeConfig accepts partial rule-ID maps, optionally wrapped in validation_rules,
// and legacy file sections. Missing rules and severities default to Ignore.
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
	groups := reflect.ValueOf(&result).Elem()
	sections := map[string]*types.RuleSection{}
	for i := range groups.NumField() {
		name := groups.Type().Field(i).Tag.Get("json")
		sections[name] = groups.Field(i).FieldByName("RuleSection").Addr().Interface().(*types.RuleSection)
	}
	decodeRule := func(id string, data json.RawMessage) (types.RuleConfig, error) {
		config := types.RuleConfig{Severity: types.SEVERITY_IGNORE}
		var object map[string]json.RawMessage
		if err := json.Unmarshal(data, &object); err != nil {
			return config, fmt.Errorf("%s: expected a rule object: %w", id, err)
		}
		if object == nil {
			return config, fmt.Errorf("%s: expected a rule object", id)
		}
		if err := json.Unmarshal(data, &config); err != nil {
			return config, fmt.Errorf("%s: %w", id, err)
		}
		if !slices.Contains(Severities, config.Severity) {
			return config, fmt.Errorf("%s: invalid severity %q", id, config.Severity)
		}
		return config, nil
	}
	for key, data := range raw {
		if section, grouped := sections[key]; grouped {
			var entries map[string]json.RawMessage
			if err := json.Unmarshal(data, &entries); err != nil {
				return result, fmt.Errorf("%s: %w", key, err)
			}
			if entries == nil {
				return result, fmt.Errorf("%s: expected a rules object", key)
			}
			for id, value := range entries {
				if id == "_file" {
					if err := json.Unmarshal(value, &section.File); err != nil {
						return result, fmt.Errorf("%s._file: %w", key, err)
					}
					if !slices.Contains(Severities, section.File) {
						return result, fmt.Errorf("%s._file: invalid severity %q", key, section.File)
					}
					continue
				}
				config, err := decodeRule(id, value)
				if err != nil {
					return result, err
				}
				section.SetRule(id, config)
			}
			continue
		}
		config, err := decodeRule(key, data)
		if err != nil {
			return result, err
		}
		name := sectionForRuleID(key, sections)
		if name == "" {
			return result, fmt.Errorf("%s: unknown file prefix; use a file section for custom rule IDs", key)
		}
		section := sections[name]
		if key == name+"_file_missing" {
			if len(config.DependsOn) > 0 {
				return result, fmt.Errorf("%s.depends_on: file-presence rules cannot have prerequisites", key)
			}
			section.File = config.Severity
		} else {
			section.SetRule(key, config)
		}
	}
	return result, nil
}

// Legacy rule IDs use singular as well as plural GTFS file names.
func sectionForRuleID(id string, sections map[string]*types.RuleSection) string {
	best, length := "", 0
	for name := range sections {
		prefixes := []string{name}
		switch name {
		case "stops", "routes", "trips", "vehicles", "shapes", "transfers", "pathways", "levels":
			prefixes = append(prefixes, strings.TrimSuffix(name, "s"))
		case "frequencies":
			prefixes = append(prefixes, "frequency")
		case "fare_attributes":
			prefixes = append(prefixes, "fare_price")
		case "fare_rules":
			prefixes = append(prefixes, "fare_rule")
		case "feed_info":
			prefixes = append(prefixes, "feed")
		case "rider_categories":
			prefixes = append(prefixes, "rider_category")
		}
		for _, prefix := range prefixes {
			if strings.HasPrefix(id, prefix+"_") && len(prefix) > length {
				best, length = name, len(prefix)
			}
		}
	}
	return best
}
