package validationcontext

import (
	messageseverity "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/messages/severity"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/validation-context/types"
	messages "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/messages"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
)

// AddMessage reports a finding using configured severity unless an explicit override is supplied.
// A nonempty override takes precedence over configuration; ignore suppresses the finding.
func AddMessage(context *types.ValidationContext, message string, severityOverride ...rules.Severities) {
	//
	// 1. Resolve configuration, then apply the optional severity override

	severity := messageseverity.ResolveMessageSeverity(context.FileName, context.RuleID, context.Field, context.Severity)
	if len(severityOverride) > 0 && severityOverride[0] != "" {
		severity = severityOverride[0]
	}

	//
	// 2. Suppress ignored findings and normalize forbidden content to errors

	if severity == rules.SEVERITY_IGNORE {
		return
	}
	if severity == rules.SEVERITY_FORBIDDEN {
		severity = rules.SEVERITY_ERROR
	}

	//
	// 3. Record the failed rule outcome for emitted findings

	if severity == rules.SEVERITY_ERROR || severity == rules.SEVERITY_WARNING || severity == rules.SEVERITY_INFO {
		context.Failed = true
	}

	//
	// 4. Send the resolved severity so the collector does not apply configuration again

	context.MessageAdder.AddMessage(messages.Message{
		Field:            context.Field,
		FileName:         context.FileName,
		Rows:             []int{context.Row},
		Message:          message,
		Severity:         severity,
		RuleID:           context.RuleID,
		SeverityResolved: true,
	})
}
