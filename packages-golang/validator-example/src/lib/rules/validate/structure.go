package validate

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
)

// ValidateStructure decodes a flat rule object or a validation_rules wrapper.
// Missing severity defaults to ignore; omitted/null optional settings remain unset.
func ValidateStructure(data []byte) (map[string]rules.RuleConfig, error) {
	//

	//
	// 1. Require a JSON object and unwrap validation_rules when present

	var entries map[string]json.RawMessage
	if err := json.Unmarshal(data, &entries); err != nil {
		return nil, fmt.Errorf("rules must be an object: %w", err)
	}
	if entries == nil {
		return nil, fmt.Errorf("rules must be an object")
	}
	if wrapped, exists := entries["validation_rules"]; exists {
		entries = nil
		if err := json.Unmarshal(wrapped, &entries); err != nil {
			return nil, fmt.Errorf("validation_rules must be an object: %w", err)
		}
		if entries == nil {
			return nil, fmt.Errorf("validation_rules must be an object")
		}
	}

	//
	// 2. Decode each rule, rejecting invalid IDs, settings, and unknown fields

	config := make(map[string]rules.RuleConfig, len(entries))
	for _, id := range sortedIDs(entries) {
		if strings.TrimSpace(id) == "" {
			return nil, fmt.Errorf("rule ID must not be empty")
		}
		raw := bytes.TrimSpace(entries[id])
		if len(raw) == 0 || raw[0] != '{' {
			return nil, fmt.Errorf("rule %q: expected a rule object", id)
		}
		var fields map[string]json.RawMessage
		if err := json.Unmarshal(raw, &fields); err != nil {
			return nil, fmt.Errorf("rule %q: %w", id, err)
		}
		for _, field := range sortedIDs(fields) {
			switch field {
			case "severity":
				if bytes.Equal(bytes.TrimSpace(fields[field]), []byte("null")) {
					return nil, fmt.Errorf("rule %q: severity must be a string", id)
				}
			case "options", "compare", "depends_on":
				if err := validateArraySetting(field, fields[field]); err != nil {
					return nil, fmt.Errorf("rule %q: %w", id, err)
				}
			default:
				return nil, fmt.Errorf("rule %q: unknown field %q", id, field)
			}
		}
		entry := rules.RuleConfig{RuleContext: rules.RuleContext{Severity: rules.SEVERITY_IGNORE}}
		decoder := json.NewDecoder(bytes.NewReader(raw))
		decoder.DisallowUnknownFields()
		if err := decoder.Decode(&entry); err != nil {
			return nil, fmt.Errorf("rule %q: %w", id, err)
		}
		config[id] = entry
	}
	return config, nil
}

// validateArraySetting rejects null elements that encoding/json would otherwise
// silently turn into zero-valued strings or comparison structs.
func validateArraySetting(field string, raw json.RawMessage) error {
	if bytes.Equal(bytes.TrimSpace(raw), []byte("null")) {
		return nil
	}
	var values []json.RawMessage
	if err := json.Unmarshal(raw, &values); err != nil {
		return fmt.Errorf("%s: %w", field, err)
	}
	for index, value := range values {
		value = bytes.TrimSpace(value)
		if field != "compare" {
			if len(value) == 0 || value[0] != '"' {
				return fmt.Errorf("%s[%d] must be a string", field, index)
			}
			continue
		}
		if len(value) == 0 || value[0] != '{' {
			return fmt.Errorf("compare[%d] must be an object", index)
		}
		var comparison map[string]json.RawMessage
		if err := json.Unmarshal(value, &comparison); err != nil {
			return err
		}
		for _, key := range []string{"key", "value"} {
			if setting, exists := comparison[key]; exists {
				setting = bytes.TrimSpace(setting)
				if len(setting) == 0 || setting[0] != '"' {
					return fmt.Errorf("compare[%d].%s must be a string", index, key)
				}
			}
		}
	}
	return nil
}
