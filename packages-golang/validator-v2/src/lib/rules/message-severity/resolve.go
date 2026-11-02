package message_severity

import "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"

// ResolveMessageSeverity applies a configured override or preserves the fallback.
func ResolveMessageSeverity(file, id, field string, fallback rules.Severities) rules.Severities {
	//
	// 1. Use the configured severity when an override applies

	severity, configured := MessageSeverityOverride(file, id, field)
	if !configured {
		return fallback
	}
	return severity
}
