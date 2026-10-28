package types

const ALL_OPTIONS = "all_options"

type Compare struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

// RuleContext contains the configuration supplied to one validation rule.
type RuleContext struct {
	Severity  Severity   `json:"severity"`
	Options   *[]string  `json:"options,omitempty"`
	Compare   *[]Compare `json:"compare,omitempty"`
	DependsOn []string   `json:"depends_on,omitempty"` // DependsOn lists rule IDs that must pass before this rule runs
}

// RuleIDGtfsFeedFilePresenceAndIntegrity is the rule_id for forbidden-file checks.
// Missing-file checks emit <table>_file_missing instead.
const RuleIDGtfsFeedFilePresenceAndIntegrity = "file_validation_gtfs_feed_file_presence_and_integrity_rule"

// RuleIDFeedInfoValuesParse is the rule_id for feed_info row parsing errors.
const RuleIDFeedInfoValuesParse = "feed_info_values_parse"

// GtfsRules stores configuration by rule ID, matching rules.json.
type GtfsRules map[string]RuleContext

// Rule returns the context for one check; omitted rules default to Ignore.
func (r *GtfsRules) Rule(id string) *RuleContext {
	context := RuleContext{Severity: SEVERITY_IGNORE}
	if r != nil {
		if configured, exists := (*r)[id]; exists {
			context = configured
			if context.Severity == "" {
				context.Severity = SEVERITY_IGNORE
			}
		}
	}
	return &context
}

func (r *GtfsRules) SetRule(id string, context RuleContext) {
	if *r == nil {
		*r = make(GtfsRules)
	}
	(*r)[id] = context
}

// GtfsRuleFiles lists the tables supported by validation, independently of configuration.
var GtfsRuleFiles = []string{
	"agency",
	"rider_categories",
	"stops",
	"routes",
	"trips",
	"stop_times",
	"calendar",
	"calendar_dates",
	"vehicles",
	"fare_attributes",
	"fare_rules",
	"shapes",
	"frequencies",
	"transfers",
	"pathways",
	"levels",
	"feed_info",
}
