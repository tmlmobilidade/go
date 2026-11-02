package message_severity

import "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"

// MessageSeverityOverride returns the configured severity for a rule and field.
// The filename is retained in the signature; configuration is keyed globally by rule ID.
func MessageSeverityOverride(_ string, id, field string) (rules.Severities, bool) {
	//

	//
	// 1. Read the current immutable configuration snapshot

	values := messageSeverities.Load()
	if values == nil {
		return "", false
	}

	//
	// 2. Prefer a field-specific override, then the rule-wide override

	prefix := id + "/"
	severity, configured := (*values)[prefix+field]
	if !configured {
		severity, configured = (*values)[prefix]
	}
	if !configured && !isTechnicalNotice(id) {
		return rules.SEVERITY_IGNORE, true
	}

	//
	// 3. Report forbidden content as an error

	if severity == rules.SEVERITY_FORBIDDEN {
		severity = rules.SEVERITY_ERROR
	}
	return severity, configured
}
