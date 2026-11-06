package rules

// RuleConfig is one rules.json entry, including scheduling and validation settings.
// Only RuleContext is passed to the validation function.
type RuleConfig struct {
	RuleContext
	DependsOn []string `json:"depends_on,omitempty"` // Rule IDs that must pass before this rule runs
}
