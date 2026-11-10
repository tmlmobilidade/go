package validate

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/lib/rules/validate/utils"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/rules"
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
	for _, id := range utils.SortedIDs(entries) {
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
		for _, field := range utils.SortedIDs(fields) {
			switch field {
			case "severity":
				if bytes.Equal(bytes.TrimSpace(fields[field]), []byte("null")) {
					return nil, fmt.Errorf("rule %q: severity must be a string", id)
				}
			case "options", "compare", "depends_on":
				if err := utils.ValidateArraySetting(field, fields[field]); err != nil {
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
