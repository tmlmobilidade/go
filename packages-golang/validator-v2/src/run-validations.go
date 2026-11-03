package main

import (
	"database/sql"
	"fmt"

	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/messages"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/logger"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/queries"
	messageTypes "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/messages"
	ruleTypes "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations"
)

// runValidations coordinates database preparation and rule execution for the CLI.
func runValidations(db *sql.DB, rules map[string]ruleTypes.RuleConfig, messageService *messages.MessageService) {
	//

	//
	// 1. Load the SQLite table metadata shared by validation checks

	loading := logger.AppLogger.StartPerformanceTracker("Loading SQLite validation table metadata")
	tables, err := queries.LoadSQLiteTables(db)
	loading.End(err)
	if err != nil {
		messageService.AddMessage(messageTypes.Message{
			FileName: "N/A", Field: "N/A", RuleID: "file_validation",
			Severity: ruleTypes.SEVERITY_ERROR, Message: fmt.Sprintf("Error loading GTFS validation tables: %v", err),
		})
		return
	}

	//
	// 2. Prepare query indexes before concurrent validation starts

	preparation := logger.AppLogger.StartPerformanceTracker("Preparing SQLite validation indexes")
	err = queries.PrepareSQLiteIndexes(tables)
	preparation.End(err)
	if err != nil {
		messageService.AddMessage(messageTypes.Message{
			FileName: "N/A", Field: "N/A", RuleID: "file_validation",
			Severity: ruleTypes.SEVERITY_ERROR, Message: fmt.Sprintf("Error preparing GTFS validation indexes: %v", err),
		})
		return
	}

	//
	// 3. Execute the configured rules and record the validation duration

	tracker := logger.AppLogger.StartPerformanceTracker("Validating GTFS rules")
	_, err = validations.Run(db, rules, tables)
	tracker.End(err)
	if err != nil {
		messageService.AddMessage(messageTypes.Message{
			FileName: "N/A", Field: "N/A", RuleID: "file_validation",
			Severity: ruleTypes.SEVERITY_ERROR, Message: fmt.Sprintf("Error validating GTFS: %v", err),
		})
	}
}
