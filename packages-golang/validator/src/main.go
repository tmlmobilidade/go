package main

import (
	"os"

	telemetry "github.com/tmlmobilidade/go/packages-golang/telemetry/src"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib/messages"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib/messages/severity"
	rulevalidate "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/rules/validate"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/cli"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables/i18n"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables/logger"
)

func main() {
	//

	//
	// 1. Set the version

	cli.SetDisplayVersion("1.0.0")

	//
	// 2. Read the CLI options and configure the log level

	appCLI := cli.NewCLI("GTFS Validator")
	if err := cli.Run(appCLI); err != nil {
		logger.AppLogger.Critical(telemetry.LogEntry{Message: "Invalid CLI options", Error: err})
		os.Exit(1)
	}
	options := appCLI.Options

	if err := logger.AppLogger.SetLogLevel(options.LogLevel); err != nil {
		logger.AppLogger.Critical(err)
		os.Exit(1)
	}

	//
	// 3. Select the validation message language

	if options.RulesLang != "" {
		i18n.AppTranslator.SetLanguage(options.RulesLang)
	}

	//
	// 4. Validate rules.json and configure finding severities

	rules, err := rulevalidate.ValidateRulesJSON(options.RulesPath)
	if err != nil {
		logger.AppLogger.Critical(telemetry.LogEntry{Message: "Invalid rules configuration", Error: err})
		os.Exit(1)
	}

	severity.ConfigureMessageSeverities(rules)

	//
	// 5. Log the validator version

	logger.AppLogger.Info("GTFS Validator v1.0.0")

	//
	// 6. Open the existing GTFS SQLite database and record the loading duration

	messageService := messages.NewMessageService()
	tracker := logger.AppLogger.StartPerformanceTracker("Reading GTFS")

	db, err := sqlite.ReadGTFSSQLite(options.InputPath)
	tracker.End(err)
	if err != nil {
		logger.AppLogger.Critical(telemetry.LogEntry{Message: "Error reading GTFS", Error: err})
		os.Exit(1)
	}

	//
	// 7. Close the database when validation finishes

	defer func() {
		if err := db.Close(); err != nil {
			logger.AppLogger.Error(telemetry.LogEntry{Message: "Error closing database", Error: err})
		}
	}()

	//
	// 8. Execute the configured rules

	runValidations(db, rules, messageService)

	//
	// 9. Output the validation summary

	if err := messageService.OutputSummary(options.OutputPath); err != nil {
		logger.AppLogger.Critical(telemetry.LogEntry{Message: "Error writing validation summary", Error: err})
		os.Exit(1)
	}
	if options.OutputPath != "" {
		logger.AppLogger.Info("Summary written to: " + options.OutputPath)
	}
}
