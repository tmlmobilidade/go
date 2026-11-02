package rules

import (
	"main/types"
	"slices"
	"sort"
)

// SeverityFor resolves one rule, defaulting omitted settings to Ignore.
func SeverityFor(config *types.GtfsRules, ruleID string) types.Severity {
	return config.Rule(ruleID).Severity
}

func RuleIDs(config *types.GtfsRules) []string {
	ids := []string{}
	if config != nil {
		for id := range *config {
			ids = append(ids, id)
		}
	}
	sort.Strings(ids)
	return ids
}

func DependenciesFrom(config *types.GtfsRules) map[string][]string {
	deps := map[string][]string{}
	for _, id := range RuleIDs(config) {
		deps[id] = slices.Clone(config.Rule(id).DependsOn)
	}
	return deps
}

// ValidateDependencies validates one graph of rule IDs, without file or scope boundaries.
// Known IDs may be omitted from configuration; their default severity is Ignore.
func ValidateDependencies(config *types.GtfsRules, knownIDs ...string) error {
	ids := map[string]bool{}
	for _, id := range knownIDs {
		ids[id] = true
	}
	for _, file := range types.GtfsRuleFiles {
		ids[FileNode(file)] = true
	}
	for _, id := range RuleIDs(config) {
		ids[id] = true
	}
	ordered := make([]string, 0, len(ids))
	for id := range ids {
		ordered = append(ordered, id)
	}
	sort.Strings(ordered)
	list := make([]Rule[struct{}], 0, len(ordered))
	for _, id := range ordered {
		list = append(list, Rule[struct{}]{ID: id, DependsOn: config.Rule(id).DependsOn})
	}
	_, err := NewManager(list...)
	return err
}

var Severities = []types.Severity{types.SEVERITY_ERROR, types.SEVERITY_WARNING, types.SEVERITY_INFO, types.SEVERITY_IGNORE, types.SEVERITY_FORBIDDEN}

func DefaultConfig() types.GtfsRules { return types.GtfsRules{} }

func FileSeverity(config *types.GtfsRules, file string) types.Severity {
	return config.Rule(file + "_file_missing").Severity
}

// FileNode uses the configured file rule ID. It passes when the table exists,
// independently of the severity used to report a missing file.
func FileNode(file string) string { return file + "_file_missing" }
