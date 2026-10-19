package types

const ALL_OPTIONS = "all_options"

type Compare struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

type RuleConfig struct {
	Severity  Severity   `json:"severity"`
	Options   *[]string  `json:"options,omitempty"`
	Compare   *[]Compare `json:"compare,omitempty"`
	DependsOn []string   `json:"depends_on,omitempty"` // DependsOn lists rule ids (from the same file section) that must pass before this rule runs
}

type AgencyRules struct{ RuleSection }

type StopsRules struct{ RuleSection }

type RoutesRules struct{ RuleSection }

type TripsRules struct{ RuleSection }

type StopTimesRules struct{ RuleSection }

type CalendarRules struct{ RuleSection }

type CalendarDatesRules struct{ RuleSection }

type VehiclesRules struct{ RuleSection }

type FareAttributesRules struct{ RuleSection }

type FareRulesRules struct{ RuleSection }

type FareMediaRules struct{ RuleSection }

type ShapesRules struct{ RuleSection }

type FrequenciesRules struct{ RuleSection }

type TransfersRules struct{ RuleSection }

type PathwaysRules struct{ RuleSection }

type LevelsRules struct{ RuleSection }

type FeedInfoRules struct{ RuleSection }

type RiderCategoriesRules struct{ RuleSection }

// RuleIDGtfsFeedFilePresenceAndIntegrity is the rule_id for forbidden-file checks.
// Missing-file checks emit <table>_file_missing instead.
const RuleIDGtfsFeedFilePresenceAndIntegrity = "file_validation_gtfs_feed_file_presence_and_integrity_rule"

// RuleIDFeedInfoValuesParse is the rule_id for feed_info row parsing errors.
const RuleIDFeedInfoValuesParse = "feed_info_values_parse"

type FileValidationRules struct{ RuleSection }

type GtfsRules struct {
	Agency          AgencyRules          `json:"agency"`
	FileValidation  FileValidationRules  `json:"file_validation"`
	RiderCategories RiderCategoriesRules `json:"rider_categories"`
	Stops           StopsRules           `json:"stops"`
	Routes          RoutesRules          `json:"routes"`
	Trips           TripsRules           `json:"trips"`
	StopTimes       StopTimesRules       `json:"stop_times"`
	Calendar        CalendarRules        `json:"calendar"`
	CalendarDates   CalendarDatesRules   `json:"calendar_dates"`
	Vehicles        VehiclesRules        `json:"vehicles"`
	FareAttributes  FareAttributesRules  `json:"fare_attributes"`
	FareRules       FareRulesRules       `json:"fare_rules"`
	Shapes          ShapesRules          `json:"shapes"`
	Frequencies     FrequenciesRules     `json:"frequencies"`
	Transfers       TransfersRules       `json:"transfers"`
	Pathways        PathwaysRules        `json:"pathways"`
	Levels          LevelsRules          `json:"levels"`
	FeedInfo        FeedInfoRules        `json:"feed_info"`
	FareMedia       FareMediaRules       `json:"fare_media"`
}
