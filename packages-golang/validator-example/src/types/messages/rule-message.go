package messages

import (
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
)

// RuleMessage groups the findings for one rule and file under a generic description.
type RuleMessage struct {
	Messages  []Message        `json:"messages"`
	Field     string           `json:"field"`
	FileName  string           `json:"file_name"`
	Message   string           `json:"message"`
	RuleID    string           `json:"rule_id"`
	Severity  rules.Severities `json:"severity"`
	TotalRows int              `json:"total_rows"` // Distinct retained rows; detail samples are capped.
}
