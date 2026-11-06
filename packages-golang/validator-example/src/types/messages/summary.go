package messages

// Summary is the exported validation report. Totals count distinct collected diagnostics.
type Summary struct {
	Messages      []RuleMessage `json:"messages"`
	TotalErrors   int           `json:"total_errors"`
	TotalWarnings int           `json:"total_warnings"`
}
