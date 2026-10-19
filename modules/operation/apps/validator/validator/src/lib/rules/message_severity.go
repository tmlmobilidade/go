package rules

import (
	"main/types"
	"reflect"
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
	groups := reflect.ValueOf(config).Elem()
	for i := range groups.NumField() {
		name := groups.Type().Field(i).Tag.Get("json")
		if name == "file_validation" {
			continue
		}
		forEachRuleConfig(groups.Field(i).Interface(), func(id string, config types.RuleConfig) {
			severity := config.Severity
			if severity == "" {
				severity = types.SEVERITY_IGNORE
			}
			values[name+"/"+id+"/"] = severity
			if key := RuleMessageKey(id); key != id {
				values[name+"/"+key] = severity
			}
		})
	}
	messageSeverities.Store(&values)
}

// ResolveMessageSeverity also covers older validators that emit hardcoded errors
// instead of consulting their RuleConfig. Technical notices have no override.
func ResolveMessageSeverity(file, id, field string, fallback types.Severity) types.Severity {
	severity, ok := MessageSeverityOverride(file, id, field)
	if !ok {
		return fallback
	}
	return severity
}

func MessageSeverityOverride(file, id, field string) (types.Severity, bool) {
	values := messageSeverities.Load()
	if values == nil {
		return "", false
	}
	prefix := strings.TrimSuffix(file, ".txt") + "/" + id + "/"
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

// RuleMessageKey handles the shared message ID emitted by calendar date checks.
func RuleMessageKey(id string) string {
	switch id {
	case "calendar_start_date_valid_yyyymmdd":
		return "calendar_start_end_dates_valid_yyyymmdd_order/start_date"
	case "calendar_end_date_valid_yyyymmdd":
		return "calendar_start_end_dates_valid_yyyymmdd_order/end_date"
	default:
		return id
	}
}

// Parser and file-level diagnostics are not per-row configurable validations.
func isTechnicalNotice(id string) bool {
	return strings.HasSuffix(id, "_values_parse") || strings.HasSuffix(id, "_file_missing") ||
		id == "file_validation" || id == "file_not_found_in_rules" ||
		id == types.RuleIDGtfsFeedFilePresenceAndIntegrity
}
