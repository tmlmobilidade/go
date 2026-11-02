package messages

// Summary is the exported validation report. Totals count distinct collected diagnostics.
type Summary struct {
	Messages      []RuleMessage `json:"messages"`
	TotalErrors   int           `json:"total_errors"`
	TotalWarnings int           `json:"total_warnings"`
}

// AllMessages returns the details from every rule group in report order.
func (summary Summary) AllMessages() []Message {
	//

	//
	// 1. Flatten the grouped findings

	messages := []Message{}
	for _, rule := range summary.Messages {
		messages = append(messages, rule.Messages...)
	}
	return messages
}
