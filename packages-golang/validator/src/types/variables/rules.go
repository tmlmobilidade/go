package variables

// AllRuleOptions preserves the configured wildcard for option-based checks.
const AllRuleOptions = "all_options"

// GtfsRuleFiles lists the supported validation tables independently of configuration.
var GtfsRuleFiles = []string{
	"agency",
	"calendar",
	"calendar_dates",
	"fare_attributes",
	"fare_rules",
	"feed_info",
	"frequencies",
	"routes",
	"shapes",
	"stop_times",
	"stops",
	"transfers",
	"levels",
	"pathways",
	"trips",
	"vehicles",
}
