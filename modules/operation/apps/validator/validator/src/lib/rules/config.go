package rules

import (
	"fmt"
	"main/types"
	"slices"
	"sort"
	"strings"
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

// ForFile selects the rules executed against a table without changing the flat configuration.
func ForFile(config *types.GtfsRules, file string) *types.GtfsRules {
	selected := types.GtfsRules{}
	for _, id := range RuleIDs(config) {
		if FileForRuleID(id) == file && id != file+"_file_missing" {
			selected[id] = *config.Rule(id)
		}
	}
	return &selected
}

// ValidateDependencies retains row/group dependency boundaries within each table.
func ValidateDependencies(config *types.GtfsRules, file string) error {
	deps := DependenciesFrom(config)
	for id, prerequisites := range deps {
		for _, prerequisite := range prerequisites {
			scope := executionScopes[prerequisite]
			if scope != "" && executionScopes[id] != scope {
				return fmt.Errorf("rule %q cannot depend on %q in %s scope", id, prerequisite, scope)
			}
		}
	}
	list := []Rule[struct{}]{{ID: FileNode(file)}}
	for _, id := range RuleIDs(config) {
		list = append(list, Rule[struct{}]{ID: id, DependsOn: deps[id]})
	}
	_, err := NewManager(list...)
	return err
}

var Severities = []types.Severity{types.SEVERITY_ERROR, types.SEVERITY_WARNING, types.SEVERITY_INFO, types.SEVERITY_IGNORE, types.SEVERITY_FORBIDDEN}

func DefaultConfig() types.GtfsRules { return types.GtfsRules{} }

func FileSeverity(config *types.GtfsRules, file string) types.Severity {
	return config.Rule(file + "_file_missing").Severity
}

func FileNode(file string) string { return file + "_file_present" }

// Legacy rule IDs use singular as well as plural GTFS file names.
func FileForRuleID(id string) string {
	best, length := "", 0
	for _, file := range append(slices.Clone(types.GtfsRuleFiles), "file_validation") {
		prefixes := []string{file}
		switch file {
		case "stops", "routes", "trips", "vehicles", "shapes", "transfers", "pathways", "levels":
			prefixes = append(prefixes, strings.TrimSuffix(file, "s"))
		case "frequencies":
			prefixes = append(prefixes, "frequency")
		case "fare_attributes":
			prefixes = append(prefixes, "fare_price")
		case "fare_rules":
			prefixes = append(prefixes, "fare_rule")
		case "feed_info":
			prefixes = append(prefixes, "feed")
		case "rider_categories":
			prefixes = append(prefixes, "rider_category")
		}
		for _, prefix := range prefixes {
			if strings.HasPrefix(id, prefix+"_") && len(prefix) > length {
				best, length = file, len(prefix)
			}
		}
	}
	return best
}
