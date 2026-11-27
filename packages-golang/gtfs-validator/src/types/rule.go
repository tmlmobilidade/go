package types

import (
	"bytes"
	"encoding/json"
	"fmt"
	"slices"
)

// Rule configures one validation method. DependsOn lists other rule IDs
// from the same run that must pass before this rule can execute.
type Rule struct {
	RuleID    string       `json:"rule_id"`
	DependsOn []string     `json:"depends_on,omitzero"`
	Severity  Severities   `json:"severity"`
	Modifiers RuleModifier `json:"modifiers,omitempty"`
}

// RuleModifier is one optional options list or list of comparisons.
type RuleModifier interface {
	clone() RuleModifier
}

type RuleOptionsModifier []string
type RuleCompareModifier []RuleComparison

func (m RuleOptionsModifier) clone() RuleModifier { return slices.Clone(m) }
func (m RuleCompareModifier) clone() RuleModifier { return slices.Clone(m) }

func (m RuleOptionsModifier) MarshalJSON() ([]byte, error) {
	return marshalModifier("options", []string(m))
}

func (m RuleCompareModifier) MarshalJSON() ([]byte, error) {
	return marshalModifier("compare", []RuleComparison(m))
}

func marshalModifier[T any](kind string, values []T) ([]byte, error) {
	if values == nil {
		values = []T{}
	}
	return json.Marshal(struct {
		Type   string `json:"type"`
		Values []T    `json:"values"`
	}{kind, values})
}

// RuleComparison is a configured key and value for a rule to compare.
type RuleComparison struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

func (r Rule) Options() []string {
	values, ok := r.Modifiers.(RuleOptionsModifier)
	if ok && values == nil {
		return []string{}
	}
	return values
}

func (r Rule) Compare() []RuleComparison {
	values, ok := r.Modifiers.(RuleCompareModifier)
	if ok && values == nil {
		return []RuleComparison{}
	}
	return values
}

// Clone keeps the graph's configuration independent of the input slices.
func (r Rule) Clone() Rule {
	r.DependsOn = slices.Clone(r.DependsOn)
	if r.Modifiers != nil {
		r.Modifiers = r.Modifiers.clone()
	}
	return r
}

func (r *Rule) UnmarshalJSON(data []byte) error {
	type rule Rule
	var wire struct {
		rule
		DependsOn json.RawMessage `json:"depends_on"`
		Modifiers json.RawMessage `json:"modifiers"`
	}
	if err := decodeRuleJSON(data, &wire); err != nil {
		return err
	}
	if len(wire.DependsOn) != 0 {
		dependencies, err := decodeStrings(wire.DependsOn)
		if err != nil {
			return fmt.Errorf("rule %q depends_on: %w", wire.RuleID, err)
		}
		wire.rule.DependsOn = dependencies
	}
	if len(wire.Modifiers) != 0 {
		modifier, err := decodeModifier(wire.Modifiers)
		if err != nil {
			return fmt.Errorf("rule %q modifiers: %w", wire.RuleID, err)
		}
		wire.rule.Modifiers = modifier
	}
	*r = Rule(wire.rule)
	return nil
}

func decodeModifier(data []byte) (RuleModifier, error) {
	var wire struct {
		Type   string          `json:"type"`
		Values json.RawMessage `json:"values"`
	}
	if err := decodeRuleJSON(data, &wire); err != nil {
		return nil, err
	}
	switch wire.Type {
	case "options":
		values, err := decodeStrings(wire.Values)
		if err != nil {
			return nil, fmt.Errorf("options values: %w", err)
		}
		return RuleOptionsModifier(values), nil
	case "compare":
		var values []struct {
			Key   *string `json:"key"`
			Value *string `json:"value"`
		}
		if err := decodeRuleJSON(wire.Values, &values); err != nil || values == nil {
			return nil, fmt.Errorf("compare values must be an array of key/value pairs")
		}
		pairs := make(RuleCompareModifier, len(values))
		for i, value := range values {
			if value.Key == nil || value.Value == nil {
				return nil, fmt.Errorf("compare values must have string keys and values")
			}
			pairs[i] = RuleComparison{Key: *value.Key, Value: *value.Value}
		}
		return pairs, nil
	default:
		return nil, fmt.Errorf("unknown modifier type %q", wire.Type)
	}
}

func decodeStrings(data []byte) ([]string, error) {
	var values []*string
	if err := json.Unmarshal(data, &values); err != nil || values == nil {
		return nil, fmt.Errorf("expected an array of strings")
	}
	strings := make([]string, len(values))
	for i, value := range values {
		if value == nil {
			return nil, fmt.Errorf("expected a string at index %d", i)
		}
		strings[i] = *value
	}
	return strings, nil
}

func decodeRuleJSON(data []byte, target any) error {
	decoder := json.NewDecoder(bytes.NewReader(data))
	decoder.DisallowUnknownFields()
	return decoder.Decode(target)
}
