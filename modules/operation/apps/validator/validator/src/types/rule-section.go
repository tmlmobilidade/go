package types

import "encoding/json"

// RuleSection stores the rule IDs supplied by rules.json without a field per rule.
// File remains separate because the legacy _file setting is a severity string.
type RuleSection struct {
	File  Severity
	Rules map[string]RuleConfig
}

func (s RuleSection) Rule(id string) RuleConfig {
	config := s.Rules[id]
	if config.Severity == "" {
		config.Severity = SEVERITY_IGNORE
	}
	return config
}

func (s *RuleSection) SetRule(id string, config RuleConfig) {
	if s.Rules == nil {
		s.Rules = make(map[string]RuleConfig)
	}
	s.Rules[id] = config
}

func (s RuleSection) RuleConfigs() map[string]RuleConfig { return s.Rules }

func (s *RuleSection) UnmarshalJSON(data []byte) error {
	var entries map[string]json.RawMessage
	if err := json.Unmarshal(data, &entries); err != nil {
		return err
	}
	*s = RuleSection{File: SEVERITY_IGNORE, Rules: make(map[string]RuleConfig)}
	for id, value := range entries {
		if id == "_file" {
			if err := json.Unmarshal(value, &s.File); err != nil {
				return err
			}
			continue
		}
		config := RuleConfig{Severity: SEVERITY_IGNORE}
		if err := json.Unmarshal(value, &config); err != nil {
			return err
		}
		s.Rules[id] = config
	}
	return nil
}

func (s RuleSection) MarshalJSON() ([]byte, error) {
	entries := make(map[string]any, len(s.Rules)+1)
	severity := s.File
	if severity == "" {
		severity = SEVERITY_IGNORE
	}
	entries["_file"] = severity
	for id := range s.Rules {
		entries[id] = s.Rule(id)
	}
	return json.Marshal(entries)
}
