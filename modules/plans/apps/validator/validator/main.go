package main

import (
	"fmt"
	"log"
	"main/config"
	"main/i18n"
	"main/lib"
	"main/services"
	"main/types"
	"main/validations"
	file_validation "main/validations/files"
	"os"
	"sync"

	// Import all validation packages to trigger their init() functions
	_ "main/validations/afetacao"
	_ "main/validations/agency"
	_ "main/validations/archives"
	_ "main/validations/areas"
	_ "main/validations/attributions"
	_ "main/validations/booking_rules"
	_ "main/validations/calendar"
	_ "main/validations/calendar_dates"
	_ "main/validations/fare_attributes"
	_ "main/validations/fare_leg_join_rules"
	_ "main/validations/fare_leg_rules"
	_ "main/validations/fare_media"
	_ "main/validations/fare_products"
	_ "main/validations/fare_rules"
	_ "main/validations/fare_transfer_rules"
	_ "main/validations/feed_info"
	_ "main/validations/frequencies"
	_ "main/validations/levels"
	_ "main/validations/location_group_stops"
	_ "main/validations/location_groups"
	_ "main/validations/municipalities"
	_ "main/validations/networks"
	_ "main/validations/pathways"
	_ "main/validations/periods"
	_ "main/validations/rider_categories"
	_ "main/validations/route_networks"
	_ "main/validations/routes"
	_ "main/validations/shapes"
	_ "main/validations/stop_areas"
	_ "main/validations/stop_times"
	_ "main/validations/stops"
	_ "main/validations/timeframes"
	_ "main/validations/transfers"
	_ "main/validations/translations"
	_ "main/validations/trips"
	_ "main/validations/vehicles"
)

func init() {
	services.SetDisplayVersion(version)
}

func runValidations(gtfs types.Gtfs, tracker *lib.PerformanceTracker, rules *types.GtfsRules) {
	// Create a wait group to wait for all validations to complete
	var wg sync.WaitGroup

	// List of all possible GTFS tables (from config)
	gtfsTables := config.GTFSTables

	// Run Validations for each file concurrently
	for _, fileName := range gtfsTables {
		// Check if table exists in database
		if !gtfs.HasTable(fileName) {
			continue
		}

		// Check if validation is registered for this table
		validationFn, ok := validations.Get(fileName)
		if !ok {
			services.AppMessageService.AddMessage(types.Message{
				Rows:     []int{},
				Field:    "N/A",
				FileName: fileName,
				Message:  fmt.Sprintf(i18n.AppTranslator.Get("file_validations.not_supported"), fileName),
				RuleID:   "file_not_found_in_rules",
				Severity: types.SEVERITY_WARNING,
			})
			continue
		}

		wg.Add(1)
		go func(name string, fn validations.ValidationFunction) {
			defer wg.Done()
			fn(gtfs, rules)
		}(fileName, validationFn)
	}

	// Wait for all validations to complete
	wg.Wait()
	tracker.End()
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

	//
	// lib.AppLogger.Clear()
	lib.AppLogger.Divider("GTFS Validator v" + version)

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
		services.AppMessageService.PrintJSON()
		return
	}

	//
	// 2. Check File Requirements
	// File validations add messages directly to AppMessageService
	// Only exit early if there are errors (warnings are ok to continue)
	if hasErrors := file_validation.NewFileValidation().Validate(gtfs, rules); hasErrors {
		services.AppMessageService.WriteToFile(services.AppCLI.Options.OutputPath)
		lib.AppLogger.Error("File validations found errors. Exiting.")
		return
	}

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
	if services.AppCLI.Options.OutputPath != "" {
		services.AppMessageService.WriteToFile(services.AppCLI.Options.OutputPath)
		lib.AppLogger.Info("Summary written to: " + services.AppCLI.Options.OutputPath)
	} else {
		services.AppMessageService.PrintJSON()
	}
}
