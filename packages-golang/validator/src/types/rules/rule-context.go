package rules

// RuleContext is the configuration supplied to one validation rule.
type RuleContext struct {
	Severity Severities `json:"severity"`          // Severity used when reporting findings
	Options  *[]string  `json:"options,omitempty"` // Optional values allowed by this check
	Compare  *[]Compare `json:"compare,omitempty"` // Optional configured comparisons
}
