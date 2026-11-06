package severity

import (
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/variables"
)

// ConfigureMessageSeverities prepares message overrides for a validation run.
// Configure before starting workers; this process-wide configuration must stay stable during the run.
// Nil disables overrides; an empty map ignores unconfigured nontechnical findings.
func ConfigureMessageSeverities(config map[string]rules.RuleConfig) {
	//

	//
	// 1. Clear overrides when no configuration is supplied

	if config == nil {
		variables.MessageSeverities.Store(nil)
		return
	}

	//
	// 2. Copy each configured rule's severity under its own ID

	values := make(map[string]rules.Severities, len(config))
	for id, rule := range config {
		if id == "file_validation" || id == "file_not_found_in_rules" || id == rules.RuleIDGtfsFeedFilePresenceAndIntegrity {
			continue
		}
		severity := rule.Severity
		if severity == "" {
			severity = rules.SEVERITY_IGNORE
		}
		values[id] = severity
	}

	//
	// 3. Publish the completed snapshot atomically

	variables.MessageSeverities.Store(&values)
}
