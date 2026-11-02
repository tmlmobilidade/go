package validationcontext

import (
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/validation-context/types"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
)

// AddError reports a finding, subject to the context and configured severity overrides.
// An optional rule ID identifies a more specific diagnostic than the context's rule.
func AddError(context *types.ValidationContext, message string, ruleID ...string) {
	//
	// 1. Delegate finding creation and severity resolution

	AddMessage(context, message, rules.SEVERITY_ERROR, ruleID...)
}
