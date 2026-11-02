package validationcontext

import (
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/validation-context/types"
)

// AddMessageWithSeverity reports a finding using the context's configured severity.
func AddMessageWithSeverity(context *types.ValidationContext, message string, ruleID ...string) {
	//

	//
	// 1. Report the finding with its configured severity and optional rule ID

	AddMessage(context, message, context.Severity, ruleID...)
}
