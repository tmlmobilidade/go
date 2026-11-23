package types

// Summary is the exported validation report. Totals count distinct collected diagnostics.
type Summary struct {
	Messages      []RuleMessage `json:"messages"`
	TotalErrors   int           `json:"total_errors"`
	TotalWarnings int           `json:"total_warnings"`
}

// RuleMessage groups findings for one rule, file, field, and severity.
type RuleMessage struct {
	Messages  []Message  `json:"messages"`
	Field     string     `json:"field"`
	FileName  string     `json:"file_name"`
	Message   string     `json:"message"`
	RuleID    string     `json:"rule_id"`
	Severity  Severities `json:"severity"`
	TotalRows int        `json:"total_rows"` // Distinct retained rows; detail samples are capped.
}

// Message is one validation finding, with its source location and rule identity.
type Message struct {
	SeverityResolved bool       `json:"-"`    // Internal: configuration was already applied by the validation context.
	Rows             []int      `json:"rows"` // Zero-based on input; CSV line numbers in collected output.
	Field            string     `json:"field"`
	FileName         string     `json:"file_name"`
	Message          string     `json:"message"`
	RuleID           string     `json:"rule_id"`
	Severity         Severities `json:"severity"`
}
