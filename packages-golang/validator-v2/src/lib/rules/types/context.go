package types

// Compare describes a configured value comparison for a validation rule.
type Compare struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

// RuleContext is the rules.json configuration supplied to one check.
// Missing severity defaults to ignore when loading the configuration.
type RuleContext struct {
	Severity  string     `json:"severity"`
	Options   *[]string  `json:"options,omitempty"`
	Compare   *[]Compare `json:"compare,omitempty"`
	DependsOn []string   `json:"depends_on,omitempty"`
}
