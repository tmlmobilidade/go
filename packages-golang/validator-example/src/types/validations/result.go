package validations_types

import (
	algorithm_types "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/algorithm"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/messages"
)

// Result contains the final execution state and the complete validation report.
// Findings belong in Summary; the returned Go error describes execution failures.
type Result struct {
	Statuses map[string]algorithm_types.Status `json:"statuses"`
	Summary  messages.Summary                  `json:"summary"`
}
