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
	for _, entry := range Catalogue() {
		// File checks resolve their own presence/forbidden semantics.
		if !entry.Editable || entry.ConfigKey == "_file" || entry.Group == "file_validation" {
			continue
		}
		for i := range groups.NumField() {
			if groups.Type().Field(i).Tag.Get("json") != entry.Group {
				continue
			}
			group := groups.Field(i)
			for j := range group.NumField() {
				if group.Type().Field(j).Tag.Get("json") != entry.ConfigKey {
					continue
				}
				severity := group.Field(j).Interface().(types.RuleConfig).Severity
				if severity == "" {
					severity = types.SEVERITY_IGNORE
				}
				values[entry.Group+"/"+entry.ID+"/"] = severity
				for _, id := range entry.OutputIDs {
					values[entry.Group+"/"+id+"/"+entry.MessageField] = severity
				}
			}
		}
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
	if severity == types.SEVERITY_FORBIDDEN {
		severity = types.SEVERITY_ERROR
	}
	return severity, ok
}
