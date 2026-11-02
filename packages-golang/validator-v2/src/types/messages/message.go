package messages

import "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"

// Message is one validation finding, with its source location and rule identity.
type Message struct {
	Rows     []int            `json:"rows"`      // Zero-based on input; CSV line numbers in collected output
	Field    string           `json:"field"`     // Field responsible for the finding
	FileName string           `json:"file_name"` // Source GTFS filename
	Message  string           `json:"message"`   // Translated description of the finding
	RuleID   string           `json:"rule_id"`   // Validation or diagnostic identifier
	Severity rules.Severities `json:"severity"`  // Reported info, warning, or error severity
}
