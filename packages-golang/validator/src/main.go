package main

import (
	"fmt"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/i18n"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	ruleset "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/rules"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/validations"
	"log"
	"main/types"
)

func init() {
	services.SetDisplayVersion("1.0.0")
}

func runValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	preparation := lib.AppLogger.StartPerformanceTracker("Preparing SQLite validation tables and indexes")
	tables, err := services.PrepareSQLiteTables(gtfs.DB())
	preparation.End()
	if err != nil {
		services.AppMessageService.AddMessage(types.Message{
			FileName: "N/A", Field: "N/A", RuleID: "file_validation",
			Severity: types.SEVERITY_ERROR, Message: fmt.Sprintf("Error preparing GTFS validation: %v", err),
		})
		return
	}
	tracker := lib.AppLogger.StartPerformanceTracker("Validating GTFS rules")
	defer tracker.End()
	if _, err := validations.Run(gtfs, rules, tables); err != nil {
		services.AppMessageService.AddMessage(types.Message{
			FileName: "N/A", Field: "N/A", RuleID: "file_validation",
			Severity: types.SEVERITY_ERROR, Message: fmt.Sprintf("Error validating GTFS: %v", err),
		})
	}
}

func outputSummary() {
	if services.AppCLI.Options.OutputPath != "" {
		if err := services.AppMessageService.WriteToFile(services.AppCLI.Options.OutputPath); err != nil {
			log.Fatalf("Error writing validation summary: %v", err)
		}
		lib.AppLogger.Info("Summary written to: " + services.AppCLI.Options.OutputPath)
		return
	}

	services.AppMessageService.PrintJSON()
}

func main() {

	//
	// 0.1 Initialize CLI
	services.AppCLI.Run()
	lib.AppLogger.SetLogLevel(services.AppCLI.Options.LogLevel)

	// 0.2 Initialize Translator
	if services.AppCLI.Options.RulesLang != "" {
		i18n.AppTranslator.SetLanguage(services.AppCLI.Options.RulesLang)
	}

	// 0.3 Parse Rules
	rules, err := services.NewRulesParser(services.AppCLI.Options.RulesPath, validations.RuleIDs()...).ParseRules()
	if err != nil {
		log.Fatalf("Error parsing rules: %v", err)
	}

	ruleset.ConfigureMessageSeverities(rules)

	//
	// lib.AppLogger.Clear()
	lib.AppLogger.Divider("GTFS Validator v1.0.0")

	//
	// 0.4 Start Performance Tracker
	tracker := lib.AppLogger.StartPerformanceTracker("Reading GTFS")

	//
	// 1. Open the existing GTFS SQLite database
	gtfs, err := services.ReadGTFSSQLite(services.AppCLI.Options.InputPath)
	tracker.End()
	if err != nil {
		log.Fatalf("Error reading GTFS: %v", err)
	}
	defer func() {
		if err := gtfs.Close(); err != nil {
			lib.AppLogger.Error(fmt.Sprintf("Error closing database: %v", err))
		}
	}()

	// If there are errors in the GTFS, print the errors and exit
	if services.AppMessageService.TotalErrors() > 0 {
		outputSummary()
		return
	}

	//
	// 2. Execute every configured rule in the global dependency graph.
	runValidations(gtfs, rules)

	//
	// 3. Output Summary
	outputSummary()
}
