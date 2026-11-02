package severity

import "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"

// ResolveMessageSeverity applies configuration and converts forbidden findings to errors.
func ResolveMessageSeverity(file, id, field string, fallback rules.Severities) rules.Severities {
	//

	//
	// 1. Use the configured severity when an override applies

	severity := fallback
	if override, configured := MessageSeverityOverride(file, id, field); configured {
		severity = override
	}

	//
	// 2. Report forbidden content as an error, including fallback severities

	if severity == rules.SEVERITY_FORBIDDEN {
		severity = rules.SEVERITY_ERROR
	}
	return severity
}
