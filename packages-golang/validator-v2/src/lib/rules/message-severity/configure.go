package message_severity

import (
	"sort"
	"sync/atomic"

	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
)

// messageSeverities publishes an immutable configuration snapshot to running checks.
var messageSeverities atomic.Pointer[map[string]rules.Severities]

// ConfigureMessageSeverities prepares message overrides for a validation run.
// Nil disables overrides; an empty map ignores unconfigured nontechnical findings.
func ConfigureMessageSeverities(config map[string]rules.RuleConfig) {
	//

	//
	// 1. Clear overrides when no configuration is supplied

	if config == nil {
		messageSeverities.Store(nil)
		return
	}

	//
	// 2. Visit rule IDs in deterministic order

	ids := make([]string, 0, len(config))
	for id := range config {
		ids = append(ids, id)
	}
	sort.Strings(ids)

	//
	// 3. Copy severities and field-specific diagnostic aliases

	values := make(map[string]rules.Severities)
	for _, id := range ids {
		if id == "file_validation" || id == "file_not_found_in_rules" || id == rules.RuleIDGtfsFeedFilePresenceAndIntegrity {
			continue
		}
		severity := config[id].Severity
		if severity == "" {
			severity = rules.SEVERITY_IGNORE
		}
		values[id+"/"] = severity
		if key := RuleMessageKey(id); key != id {
			values[key] = severity
		}
	}

	//
	// 4. Publish the completed snapshot atomically

	messageSeverities.Store(&values)
}
