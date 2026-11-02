package types

const ALL_OPTIONS = "all_options"

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
