package calendar

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/services"
	"main/types"
	registry "main/validations"
	validations "main/validations/calendar/validations"
)

func init() {
	registry.Register("calendar", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	var section *types.CalendarRules
	if rules != nil {
		section = &rules.Calendar
	}
	runner, dagErr := services.NewRuleRunner(gtfs, section)
	if dagErr != nil {
		lib.AppLogger.Error(dagErr.Error())
		return
	}
	lib.AppLogger.Debug("Running Calendar Validations...")

	// Create progress tracker
	tracker := lib.CreateProgressTracker(gtfs, "calendar", config.ProgressThresholdSmall)

	table, err := services.NewSQLiteTable(gtfs.DB(), "calendar")
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error opening calendar table: %v", err))
		return
	}

	err = table.ForEachRow(func(row *services.SQLiteRow) error {
		db := row.Context()
		tracker.Track()
		check := func(ruleID string, err error) {
			if err != nil {
				ctx := lib.NewValidationContext("N/A", "calendar.txt", ruleID, db.Row, services.AppMessageService)
				ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
			}
		}

		valid, err := validations.WeekdaysValidation(db)
		check("calendar_values_parse", err)
		if err != nil || !valid {
			return nil
		}

		runner.Run(services.RuleActions{
			"calendar_service_id_unique_non_empty": func() {
				check("calendar_service_id_unique_non_empty", validations.ServiceIdValidation(db, section))
			},
			"calendar_start_date_valid_yyyymmdd": func() {
				check("calendar_start_date_valid_yyyymmdd", validations.DateValidation(db, "start_date", section))
			},
			"calendar_end_date_valid_yyyymmdd": func() {
				check("calendar_end_date_valid_yyyymmdd", validations.DateValidation(db, "end_date", section))
			},
		}, nil)

		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating calendars: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed calendar.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}
