package validationcontext

import (
	messageseverity "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/messages/severity"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/validation-context/types"
	messages "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/messages"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
)

// AddMessage resolves the effective severity and reports a finding to the receiver.
// An optional rule ID overrides the context's default ID for this finding only.
func AddMessage(context *types.ValidationContext, message string, severity rules.Severities, ruleID ...string) {
	//

	//
	// 1. Resolve the finding's rule ID and explicit context severity

	id := context.RuleID
	if len(ruleID) > 0 {
		id = ruleID[0]
	}
	if context.HasRuleContext && id == context.RuleID {
		severity = context.Severity
	}

	//
	// 2. Apply message-level configuration and suppress ignored findings

	severity = messageseverity.ResolveMessageSeverity(context.FileName, id, context.Field, severity)
	if severity == rules.SEVERITY_IGNORE {
		return
	}

	//
	// 3. Record the failed rule outcome for emitted findings

	if severity == rules.SEVERITY_ERROR || severity == rules.SEVERITY_WARNING || severity == rules.SEVERITY_INFO {
		context.Failed = true
	}

	//
	// 4. Send the finding with its original source location

	context.MessageAdder.AddMessage(messages.Message{
		Field:    context.Field,
		FileName: context.FileName,
		Rows:     []int{context.Row},
		Message:  message,
		Severity: severity,
		RuleID:   id,
	})
}
