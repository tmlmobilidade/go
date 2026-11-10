package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
)

// ValidateArraySetting rejects null elements that encoding/json would otherwise
// silently turn into zero-valued strings or comparison structs.
func ValidateArraySetting(field string, raw json.RawMessage) error {
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
