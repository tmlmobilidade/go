package main

import (
	"fmt"

	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/messages"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/logger"
	messageTypes "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/messages"
	ruleTypes "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
)

// runValidations coordinates database preparation and rule execution for the CLI.
func runValidations(gtfs types.Gtfs, rules map[string]ruleTypes.RuleConfig, messageService *messages.MessageService) {
	//

	//
	// 1. Prepare the SQLite validation tables and indexes

	preparation := logger.AppLogger.StartPerformanceTracker("Preparing SQLite validation tables and indexes")
	tables, err := services.PrepareSQLiteTables(gtfs.DB())
	preparation.End(err)
	if err != nil {
		messageService.AddMessage(messageTypes.Message{
			FileName: "N/A", Field: "N/A", RuleID: "file_validation",
			Severity: ruleTypes.SEVERITY_ERROR, Message: fmt.Sprintf("Error preparing GTFS validation: %v", err),
		})
		return
	}

	//
	// 2. Execute the configured rules and record the validation duration

	tracker := logger.AppLogger.StartPerformanceTracker("Validating GTFS rules")
	_, err = validations.Run(gtfs, rules, tables)
	tracker.End(err)
	if err != nil {
		messageService.AddMessage(messageTypes.Message{
			FileName: "N/A", Field: "N/A", RuleID: "file_validation",
			Severity: ruleTypes.SEVERITY_ERROR, Message: fmt.Sprintf("Error validating GTFS: %v", err),
		})
	}
}
