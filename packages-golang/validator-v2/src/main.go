package main

import (
	"fmt"
	"os"

	telemetry "github.com/tmlmobilidade/go/packages-golang/telemetry/src"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/logger"

	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/i18n"
	services "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services"
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types"
)

func init() {
	//

	//
	// 1. Set the version displayed by the CLI

	services.SetDisplayVersion("1.0.0")
}

func runValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	//

	//
	// 1. Prepare the SQLite validation tables and indexes

	preparation := logger.AppLogger.StartPerformanceTracker("Preparing SQLite validation tables and indexes")
	tables, err := services.PrepareSQLiteTables(gtfs.DB())
	preparation.End(err)
	if err != nil {
		services.AppMessageService.AddMessage(types.Message{
			FileName: "N/A", Field: "N/A", RuleID: "file_validation",
			Severity: types.SEVERITY_ERROR, Message: fmt.Sprintf("Error preparing GTFS validation: %v", err),
		})
		return
	}

	//
	// 2. Execute the configured rules and record the validation duration

	tracker := logger.AppLogger.StartPerformanceTracker("Validating GTFS rules")
	_, err = validations.Run(gtfs, rules, tables)
	tracker.End(err)
	if err != nil {
		services.AppMessageService.AddMessage(types.Message{
			FileName: "N/A", Field: "N/A", RuleID: "file_validation",
			Severity: types.SEVERITY_ERROR, Message: fmt.Sprintf("Error validating GTFS: %v", err),
		})
	}
}

func outputSummary() {
	//

	//
	// 1. Write the summary to the configured output file

	if services.AppCLI.Options.OutputPath != "" {
		if err := services.AppMessageService.WriteToFile(services.AppCLI.Options.OutputPath); err != nil {
			logger.AppLogger.Critical(telemetry.LogEntry{Message: "Error writing validation summary", Error: err})
			os.Exit(1)
		}
		logger.AppLogger.Info("Summary written to: " + services.AppCLI.Options.OutputPath)
		return
	}

	//
	// 2. Print the summary to stdout when no output file is configured

	services.AppMessageService.PrintJSON()
}

func main() {
	//

	//
	// 1. Read the CLI options and configure the log level

	services.AppCLI.Run()
	if err := logger.AppLogger.SetLogLevel(services.AppCLI.Options.LogLevel); err != nil {
		logger.AppLogger.Critical(err)
		os.Exit(1)
	}

	//
	// 2. Select the validation message language

	if services.AppCLI.Options.RulesLang != "" {
		i18n.AppTranslator.SetLanguage(services.AppCLI.Options.RulesLang)
	}

	//
	// 3. Parse the rules and configure finding severities

	rules, err := services.NewRulesParser(services.AppCLI.Options.RulesPath, validations.RuleIDs()...).ParseRules()
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

	tracker := logger.AppLogger.StartPerformanceTracker("Reading GTFS")

	gtfs, err := services.ReadGTFSSQLite(services.AppCLI.Options.InputPath)
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
	// 7. Output existing GTFS errors before running validation rules

	if services.AppMessageService.TotalErrors() > 0 {
		outputSummary()
		return
	}

	//
	// 8. Execute the configured rules in the global dependency graph

	runValidations(gtfs, rules)

	//
	// 9. Output the validation summary

	outputSummary()
}
