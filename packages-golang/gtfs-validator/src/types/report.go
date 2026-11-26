package types

import (
	"fmt"
	"maps"
)

// Translation identifies a template variant for the report's rule ID.
type Translation struct {
	Variant string            `json:"variant"`
	Values  map[string]string `json:"values,omitempty"`
}

// NewTranslation preserves identifiers as strings and formats numeric values without a locale.
func NewTranslation(variant string, values map[string]any) *Translation {
	translation := &Translation{Variant: variant}
	if len(values) > 0 {
		translation.Values = make(map[string]string, len(values))
		for name, value := range values {
			translation.Values[name] = fmt.Sprint(value)
		}
	}
	return translation
}

func (t *Translation) Clone() *Translation {
	if t == nil {
		return nil
	}
	return &Translation{Variant: t.Variant, Values: maps.Clone(t.Values)}
}

// Summary is the exported validation report. Totals count each reported rule once at its highest severity.
type Summary struct {
	Results []RuleResult `json:"results"`
	Totals  Totals       `json:"totals"`
}

type Totals struct {
	Errors   int `json:"errors"`
	Warnings int `json:"warnings"`
	Infos    int `json:"infos"`
}

// RuleResult groups sampled findings for one rule.
type RuleResult struct {
	Description            string       `json:"description"`
	DescriptionTranslation *Translation `json:"description_translation,omitempty"`
	Messages               []Message    `json:"messages"`
	RuleID                 string       `json:"rule_id"`
	Severity               Severities   `json:"severity"`
	TotalRows              int          `json:"total_rows"` // Distinct affected rows across all files before sampling.
}

// Message contains the rule's diagnostic text and sampled CSV line numbers.
type Message struct {
	Message     string       `json:"message"`
	Rows        []int        `json:"rows"`
	Translation *Translation `json:"translation,omitempty"`
}
