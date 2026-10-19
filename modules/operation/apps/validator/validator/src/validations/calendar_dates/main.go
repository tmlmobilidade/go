package calendar_dates

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/services"
	"main/types"
	registry "main/validations"
	validations "main/validations/calendar_dates/validations"
)

func init() {
	registry.RegisterWithTables("calendar_dates", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules, prepared ...*services.SQLiteTables) {
	var section *types.CalendarDatesRules
	if rules != nil {
		section = &rules.CalendarDates
	}
	runner, dagErr := services.NewRuleRunner(gtfs, section)
	if dagErr != nil {
		lib.AppLogger.Error(dagErr.Error())
		return
	}
	lib.AppLogger.Debug("Running Calendar Dates Validations...")

	// Create progress tracker
	tracker := lib.CreateProgressTracker(gtfs, "calendar_dates", config.ProgressThresholdSmall)

	// Open the calendar_dates table
	tables, err := services.ValidationTables(gtfs.DB(), prepared...)
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error preparing SQLite tables: %v", err))
		return
	}
	table, err := tables.Table("calendar_dates")
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error opening calendar_dates table: %v", err))
		return
	}

	err = table.ForEachRow(func(row *services.SQLiteRow) error {
		db := row.Context()
		tracker.Track()
		check := func(ruleID string, err error) {
			if err != nil {
				ctx := lib.NewValidationContext("N/A", "calendar_dates.txt", ruleID, db.Row, services.AppMessageService)
				ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
			}
		}

		runner.Run(services.RuleActions{
			"calendar_dates_service_id_references_calendar": func() {
				check("calendar_dates_service_id_references_calendar", validations.ServiceIdValidation(db, section))
			},
			"calendar_dates_exception_date_valid_yyyymmdd": func() {
				check("calendar_dates_exception_date_valid_yyyymmdd", validations.DateValidation(db, section))
			},
			"calendar_dates_exception_type_add_or_remove_service": func() {
				check("calendar_dates_exception_type_add_or_remove_service", validations.ExceptionTypeValidation(db, section))
			},
		}, nil)

		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating calendar dates: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed calendar_dates.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}
