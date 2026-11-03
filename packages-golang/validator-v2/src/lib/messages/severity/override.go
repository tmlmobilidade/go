package severity

import (
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/variables"
)

// MessageSeverityOverride returns the configured severity for the emitted rule ID.
// Filename and field remain in the signature for callers; configuration uses only rule IDs.
func MessageSeverityOverride(_ string, id, _ string) (rules.Severities, bool) {
	//

	//
	// 1. Read the current immutable configuration snapshot

	values := variables.MessageSeverities.Load()
	if values == nil {
		return "", false
	}

	//
	// 2. Look up the emitted rule ID directly in the configuration

	severity, configured := (*values)[id]
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
