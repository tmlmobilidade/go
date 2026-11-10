package main

import (
	"database/sql"
	"fmt"

	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/lib/messages"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/services/sqlite"
	messageTypes "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/messages"
	ruleTypes "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/rules"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/variables/logger"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/validations"
)

// runValidations coordinates database preparation and rule execution for the CLI.
func runValidations(db *sql.DB, rules map[string]ruleTypes.RuleConfig, messageService *messages.MessageService) {
	//

	//
	// 1. Prepare query indexes before concurrent validation starts

	preparation := logger.AppLogger.StartPerformanceTracker("Preparing SQLite validation indexes")
	err := sqlite.PrepareSQLiteIndexes(db)
	preparation.End(err)
	if err != nil {
		messageService.AddMessage(messageTypes.Message{
			FileName: "N/A", Field: "N/A", RuleID: "file_validation",
			Severity: ruleTypes.SEVERITY_ERROR, Message: fmt.Sprintf("Error preparing GTFS validation indexes: %v", err),
		})
		return
	}

	//
	// 2. Execute DAG validations.

	tracker := logger.AppLogger.StartPerformanceTracker("Validating GTFS rules")
	_, err = validations.RunValidations(db, rules, messageService)
	tracker.End(err)
}
