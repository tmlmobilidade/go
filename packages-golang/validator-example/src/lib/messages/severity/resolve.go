package severity

import (
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/rules"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/variables"
)

// ResolveMessageSeverity applies configuration and converts forbidden findings to errors.
func ResolveMessageSeverity(id string, fallback rules.Severities) rules.Severities {
	//

	//
	// 1. Use the configured severity when an override applies

	severity := fallback
	if values := variables.MessageSeverities.Load(); values != nil {
		if override, configured := (*values)[id]; configured {
			severity = override
		} else if !isTechnicalNotice(id) {
			severity = rules.SEVERITY_IGNORE
		}
	}

	//
	// 2. Return the resolved severity

	return severity
}
