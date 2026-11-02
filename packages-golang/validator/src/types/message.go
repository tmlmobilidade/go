package types

// RuleMessage collapses every message a rule reported into a single summary entry.
// Message is the rule's generic sentence, meant to be read on its own without the
// detail; Messages carries its informational messages, warnings, and errors.
type RuleMessage struct {
	Messages  []Message `json:"messages"`
	Field     string    `json:"field"`
	FileName  string    `json:"file_name"`
	Message   string    `json:"message"`
	RuleID    string    `json:"rule_id"`
	Severity  Severity  `json:"severity"`
	TotalRows int       `json:"total_rows"`
}

type Summary struct {
	Messages      []RuleMessage `json:"messages"`
	TotalErrors   int           `json:"total_errors"`
	TotalWarnings int           `json:"total_warnings"`
}

// AllMessages flattens the rules back into the individual messages they group, for
// callers that work message by message rather than rule by rule.
func (s Summary) AllMessages() []Message {
	messages := []Message{}
	for _, rule := range s.Messages {
		messages = append(messages, rule.Messages...)
	}

	return messages
}
