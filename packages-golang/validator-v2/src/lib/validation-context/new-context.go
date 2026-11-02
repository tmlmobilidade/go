package validationcontext

import (
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/validation-context/types"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/messages"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
)

// NewValidationContext prepares one check's location, receiver, and configured severity.
// Supplying ruleContext sets the default severity; AddMessage may explicitly override it.
func NewValidationContext(field, fileName, ruleID string, row int, messageAdder messages.MessageAdder, ruleContext ...*rules.RuleContext) *types.ValidationContext {
	//

	//
	// 1. Resolve the configured severity, defaulting to ignore

	severity := rules.SEVERITY_IGNORE
	if len(ruleContext) > 0 && ruleContext[0] != nil && ruleContext[0].Severity != "" {
		severity = ruleContext[0].Severity
	}

	//
	// 2. Return the context for this check invocation

	return &types.ValidationContext{
		Field:        field,
		FileName:     fileName,
		RuleID:       ruleID,
		Row:          row,
		Severity:     severity,
		MessageAdder: messageAdder,
	}
}
