package main

import (
	"fmt"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/config"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/i18n"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	ruleset "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/rules"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/validations"
	file_validation "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/files"
	"log"
	"main/types"
	"os"
	"sync"

	// Import all validation packages to trigger their init() functions
	_ "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/afetacao"
	_ "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/agency"
	_ "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/archives"
	_ "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/areas"
	_ "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/attributions"
	_ "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/booking_rules"
	_ "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/calendar"
	_ "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/calendar_dates"
	_ "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fare_attributes"
	_ "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fare_leg_join_rules"
	_ "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fare_leg_rules"
	_ "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fare_media"
	_ "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fare_products"
	_ "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fare_rules"
	_ "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fare_transfer_rules"
	_ "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/feed_info"
	_ "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/frequencies"
	_ "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/levels"
	_ "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/location_group_stops"
	_ "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/location_groups"
	_ "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/municipalities"
	_ "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/networks"
	_ "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/pathways"
	_ "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/periods"
	_ "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/rider_categories"
	_ "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/route_networks"
	_ "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/routes"
	_ "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/shapes"
	_ "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stop_areas"
	_ "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stop_times"
	_ "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops"
	_ "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/timeframes"
	_ "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/transfers"
	_ "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/translations"
	_ "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/trips"
	_ "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/vehicles"
)

func init() {
	services.SetDisplayVersion("1.0.0")
}

func runValidations(gtfs types.Gtfs, tracker *lib.PerformanceTracker, rules *types.GtfsRules) {
	// Prepare all imported tables before starting any validation goroutine.
	tables, err := services.PrepareSQLiteTables(gtfs.DB())
	if err != nil {
		services.AppMessageService.AddMessage(types.Message{
			FileName: "N/A", Field: "N/A", RuleID: "file_validation",
			Severity: types.SEVERITY_ERROR, Message: fmt.Sprintf("Error preparing SQLite tables: %v", err),
		})
		tracker.End()
		return
	}

	// Create a wait group to wait for all validations to complete
	var wg sync.WaitGroup

	// List of all possible GTFS tables (from config)
	gtfsTables := config.GTFSTables

	// Run Validations for each file concurrently
	for _, fileName := range gtfsTables {
		// Check if table exists in database
		if !tables.Has(fileName) {
			continue
		}

		// Check if validation is registered for this table
		validationFn, ok := validations.Get(fileName)
		if !ok {
			services.AppMessageService.AddMessage(types.Message{
				Rows:     []int{},
				Field:    "N/A",
				FileName: fileName,
				Message:  fmt.Sprintf(i18n.AppTranslator.Get("file_not_found_in_rules.not_supported"), fileName),
				RuleID:   "file_not_found_in_rules",
				Severity: types.SEVERITY_WARNING,
			})
			continue
		}

		wg.Add(1)
		go func(name string, fn validations.ValidationFunction) {
			defer wg.Done()
			fn(gtfs, rules, tables)
		}(fileName, validationFn)
	}

	// Wait for all validations to complete
	wg.Wait()
	tracker.End()
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
	rules, err := services.NewRulesParser(services.AppCLI.Options.RulesPath).ParseRules()
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
	// 1. Read GTFS from zip file
	gtfs, err := services.ReadGTFSZip(services.AppCLI.Options.InputPath)
	if err != nil {
		log.Fatalf("Error reading GTFS: %v", err)
	}

	// If there are errors in the GTFS, print the errors and exit
	if services.AppMessageService.TotalErrors() > 0 {
		outputSummary()
		return
	}

	//
	// 2. Check File Requirements
	// File validations add messages directly to AppMessageService
	// Missing files block their own DAGs; independent available files still run.
	file_validation.NewFileValidation().Validate(gtfs, rules)

	//
	// 3. Run Validations for each file
	runValidations(gtfs, tracker, rules)

	//
	// 4. Clean up database file
	defer func() {
		if err := gtfs.Close(); err != nil {
			lib.AppLogger.Error(fmt.Sprintf("Error closing database: %v", err))
		}
		if gtfs.DBPath() != "" {
			if err := os.Remove(gtfs.DBPath()); err != nil {
				lib.AppLogger.Debug(fmt.Sprintf("Error removing temp database file: %v", err))
			}
		}
	}()

	//
	// 5. Output Summary
	outputSummary()
}
