package validationcontext

import (
	messageseverity "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/rules/message-severity"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/validation-context/types"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/messages"
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

	if override, configured := messageseverity.MessageSeverityOverride(context.FileName, id, context.Field); configured {
		severity = override
	}
	if severity == rules.SEVERITY_IGNORE {
		return
	}

	//
	// 3. Report forbidden content as an error and record the failed rule outcome

	if severity == rules.SEVERITY_FORBIDDEN {
		severity = rules.SEVERITY_ERROR
	}
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
