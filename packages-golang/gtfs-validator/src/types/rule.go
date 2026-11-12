package types

// Rule configures one registered validation. DependsOn lists other rule IDs
// from the same run that must pass before this rule can execute.
type Rule struct {
	RuleID    string           `json:"rule_id"`
	DependsOn []string         `json:"depends_on,omitzero"`
	Severity  Severities       `json:"severity"`
	Options   []string         `json:"options,omitzero"`
	Compare   []RuleComparison `json:"compare,omitzero"`
}

// RuleComparison is a configured key and value for a rule to compare.
type RuleComparison struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}
