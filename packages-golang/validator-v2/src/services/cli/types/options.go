package types

type CliOptions struct {
	InputPath  string // Path to the GTFS SQLite database
	OutputPath string // Path to the output file
	LogLevel   string // Log level (debug, info, error)
	RulesPath  string // Path to the rules file
	StopsPath  string // Path to the stops_data.json file
	RulesLang  string // Rules language (en, es, pt)
	Version    bool   // Show version
}