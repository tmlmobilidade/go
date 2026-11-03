package main

import (
	"os"

	telemetry "github.com/tmlmobilidade/go/packages-golang/telemetry/src"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/i18n"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/messages"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/cli"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/logger"
)

func main() {
	//

	//
	// 1. Set the version, read the CLI options, and configure the log level

	cli.SetDisplayVersion("1.0.0")
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
	// 2. Select the validation message language

	if options.RulesLang != "" {
		i18n.AppTranslator.SetLanguage(options.RulesLang)
	}

	//
	// 3. Parse the rules and configure finding severities

	rules, err := services.NewRulesParser(options.RulesPath, validations.RuleIDs()...).ParseRules()
	if err != nil {
		logger.AppLogger.Critical(telemetry.LogEntry{Message: "Error parsing rules", Error: err})
		os.Exit(1)
	}

	ruleset.ConfigureMessageSeverities(rules)

	//
	// 4. Log the validator version

	logger.AppLogger.Info("GTFS Validator v1.0.0")

	//
	// 5. Open the existing GTFS SQLite database and record the loading duration

	messageService := messages.NewMessageService()
	tracker := logger.AppLogger.StartPerformanceTracker("Reading GTFS")

	gtfs, err := services.ReadGTFSSQLite(options.InputPath)
	tracker.End(err)
	if err != nil {
		logger.AppLogger.Critical(telemetry.LogEntry{Message: "Error reading GTFS", Error: err})
		os.Exit(1)
	}

	//
	// 6. Close the database when validation finishes

	defer func() {
		if err := gtfs.Close(); err != nil {
			logger.AppLogger.Error(telemetry.LogEntry{Message: "Error closing database", Error: err})
		}
	}()

	//
	// 7. Execute the configured rules when GTFS loading produced no errors

	if messageService.TotalErrors() == 0 {
		runValidations(gtfs, rules, messageService)
	}

	//
	// 8. Output the validation summary

	if err := messageService.OutputSummary(options.OutputPath); err != nil {
		logger.AppLogger.Critical(telemetry.LogEntry{Message: "Error writing validation summary", Error: err})
		os.Exit(1)
	}
	if options.OutputPath != "" {
		logger.AppLogger.Info("Summary written to: " + options.OutputPath)
	}
}
