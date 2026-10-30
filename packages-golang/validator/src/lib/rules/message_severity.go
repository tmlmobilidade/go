package rules

import (
	"main/types"
	"strings"
	"sync/atomic"
)

var messageSeverities atomic.Pointer[map[string]types.Severity]

// ConfigureMessageSeverities installs an immutable snapshot before concurrent
// validation starts. Nil retains the standalone validator's existing behavior.
func ConfigureMessageSeverities(config *types.GtfsRules) {
	if config == nil {
		messageSeverities.Store(nil)
		return
	}
	values := map[string]types.Severity{}
	for _, id := range RuleIDs(config) {
		context := config.Rule(id)
		if id == "file_validation" || id == "file_not_found_in_rules" || id == types.RuleIDGtfsFeedFilePresenceAndIntegrity {
			continue
		}
		values[id+"/"] = context.Severity
		if key := RuleMessageKey(id); key != id {
			values[key] = context.Severity
		}
	}
	messageSeverities.Store(&values)
}

// ResolveMessageSeverity also covers older validators that emit hardcoded errors
// instead of consulting their RuleContext. Technical notices have no override.
func ResolveMessageSeverity(file, id, field string, fallback types.Severity) types.Severity {
	severity, ok := MessageSeverityOverride(file, id, field)
	if !ok {
		return fallback
	}
	return severity
}

func MessageSeverityOverride(_ string, id, field string) (types.Severity, bool) {
	values := messageSeverities.Load()
	if values == nil {
		return "", false
	}
	prefix := id + "/"
	severity, ok := (*values)[prefix+field]
	if !ok {
		severity, ok = (*values)[prefix]
	}
	if !ok && !isTechnicalNotice(id) {
		return types.SEVERITY_IGNORE, true
	}
	if severity == types.SEVERITY_FORBIDDEN {
		severity = types.SEVERITY_ERROR
	}
	return severity, ok
}

// Shared message IDs retain the field-specific configuration IDs.
var ruleMessageKeys = map[string]string{
	"calendar_start_date_valid_yyyymmdd": "calendar_start_end_dates_valid_yyyymmdd_order/start_date",
	"calendar_end_date_valid_yyyymmdd":   "calendar_start_end_dates_valid_yyyymmdd_order/end_date",
}

func RuleMessageKey(id string) string {
	if key, exists := ruleMessageKeys[id]; exists {
		return key
	}
	return id
}

// Parser and file-level diagnostics are not per-row configurable validations.
func isTechnicalNotice(id string) bool {
	return strings.HasSuffix(id, "_values_parse") || strings.HasSuffix(id, "_file_missing") ||
		id == "file_validation" || id == "file_not_found_in_rules" ||
		id == types.RuleIDGtfsFeedFilePresenceAndIntegrity
}
