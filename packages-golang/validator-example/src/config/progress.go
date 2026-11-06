package config

// Progress tracking configuration constants
const (
	// ProgressThresholdLarge is the row threshold for logging progress on large tables
	// Used for tables like stops, trips, routes, stop_times, shapes
	ProgressThresholdLarge = 10000

	// ProgressThresholdSmall is the row threshold for logging progress on small tables
	// Used for tables like agency, feed_info, calendar, calendar_dates, fare_rules, fare_attributes
	ProgressThresholdSmall = 100
)