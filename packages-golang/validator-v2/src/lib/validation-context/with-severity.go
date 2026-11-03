package validationcontext

import (
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/validation-context"
)

// WithSeverity updates the context when a nonempty severity is supplied.
func WithSeverity(context *types.ValidationContext, severity rules.Severities) *types.ValidationContext {
	//

	//
	// 1. Apply the supplied severity and return the context

	if severity != "" {
		context.Config.Severity = severity
	}
	return context
}
