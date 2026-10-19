package calendar

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/services"
	"main/types"
	registry "main/validations"
	calendar_fields "main/validations/calendar/fields/checks"
	calendar_standard "main/validations/calendar/standard/checks"
)

func init() {
	registry.Register("calendar", RunValidations)
}

func RunValidations(gtfs types.Gtfs, gtfsRules *types.GtfsRules) {
	lib.AppLogger.Debug("Running Validations for calendar.txt")

	//
	// Create progress tracker

	tracker := lib.CreateProgressTracker(gtfs, "calendar", config.ProgressThresholdSmall)

	//
	// Get file rules

	var fileRules *types.CalendarRules
	if gtfsRules != nil {
		fileRules = &gtfsRules.Calendar
	}
	runner, err := services.NewRuleRunner(gtfs, fileRules)
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}

	//
	// Open calendar table

	table, err := services.NewSQLiteTable(gtfs.DB(), "calendar")
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error opening calendar table: %v", err))
		return
	}

	//
	// Iterate over calendar table

	err = table.ForEachRow(func(row *services.SQLiteRow) error {
		db := row.Context()
		tracker.Track()
		check := func(ruleID string, err error) {
			if err != nil {
				ctx := lib.NewValidationContext("N/A", "calendar.txt", ruleID, db.Row, services.AppMessageService)
				ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
			}
		}

		runner.Run(services.RuleActions{
			//
			// Fields
			"calendar_service_id_field": func() { check("calendar_service_id_field", calendar_fields.ServiceIdValidation(db, fileRules)) },
			"calendar_start_date_field": func() { check("calendar_start_date_field", calendar_fields.StartDateValidation(db, fileRules)) },
			"calendar_end_date_field":   func() { check("calendar_end_date_field", calendar_fields.EndDateValidation(db, fileRules)) },
			"calendar_monday_field":     func() { check("calendar_monday_field", calendar_fields.MondayValidation(db, fileRules)) },
			"calendar_tuesday_field":    func() { check("calendar_tuesday_field", calendar_fields.TuesdayValidation(db, fileRules)) },
			"calendar_wednesday_field":  func() { check("calendar_wednesday_field", calendar_fields.WednesdayValidation(db, fileRules)) },
			"calendar_thursday_field":   func() { check("calendar_thursday_field", calendar_fields.ThursdayValidation(db, fileRules)) },
			"calendar_friday_field":     func() { check("calendar_friday_field", calendar_fields.FridayValidation(db, fileRules)) },
			"calendar_saturday_field":   func() { check("calendar_saturday_field", calendar_fields.SaturdayValidation(db, fileRules)) },
			"calendar_sunday_field":     func() { check("calendar_sunday_field", calendar_fields.SundayValidation(db, fileRules)) },

			//
			// Standard
			"calendar_service_id_unique":            func() { check("calendar_service_id_unique", calendar_standard.ServiceIdUnique(db, fileRules)) },
			"calendar_start_end_dates_valid_format": func() { check("calendar_start_end_dates_valid_format", calendar_standard.DateValidFormat(db, fileRules)) },
			"calendar_start_end_dates_valid":        func() { check("calendar_start_end_dates_valid", calendar_standard.DateValid(db, fileRules)) },
			"calendar_monday_valid":                 func() { check("calendar_monday_valid", calendar_standard.MondayValid(db, fileRules)) },
			"calendar_tuesday_valid":                func() { check("calendar_tuesday_valid", calendar_standard.TuesdayValid(db, fileRules)) },
			"calendar_wednesday_valid":              func() { check("calendar_wednesday_valid", calendar_standard.WednesdayValid(db, fileRules)) },
			"calendar_thursday_valid":               func() { check("calendar_thursday_valid", calendar_standard.ThursdayValid(db, fileRules)) },
			"calendar_friday_valid":                 func() { check("calendar_friday_valid", calendar_standard.FridayValid(db, fileRules)) },
			"calendar_saturday_valid":               func() { check("calendar_saturday_valid", calendar_standard.SaturdayValid(db, fileRules)) },
			"calendar_sunday_valid":                 func() { check("calendar_sunday_valid", calendar_standard.SundayValid(db, fileRules)) },
		}, nil)
		return nil
	})

	//
	// Check for errors

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating calendars: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed calendar.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}
