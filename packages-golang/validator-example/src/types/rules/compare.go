package rules

// Compare describes a configured value comparison for a validation rule.
type Compare struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}