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
	registry.RegisterWithTables("calendar", RunValidations)
}

func RunValidations(gtfs types.Gtfs, gtfsRules *types.GtfsRules, prepared ...*services.SQLiteTables) {
	lib.AppLogger.Debug("Running Validations for calendar.txt")

	//
	// Create progress tracker

	tracker := lib.CreateProgressTracker(gtfs, "calendar", config.ProgressThresholdSmall)

	//
	// Create the rule runner

	runner, err := services.NewRuleRunner(gtfs, gtfsRules, "calendar")
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}

	//
	// Select the prepared calendar table

	tables, err := services.ValidationTables(gtfs.DB(), prepared...)
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error preparing SQLite tables: %v", err))
		return
	}
	table, err := tables.Table("calendar")
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
			"calendar_service_id_field": func() {
				check("calendar_service_id_field", calendar_fields.ServiceIdValidation(db, gtfsRules.Rule("calendar_service_id_field")))
			},
			"calendar_start_date_field": func() {
				check("calendar_start_date_field", calendar_fields.StartDateValidation(db, gtfsRules.Rule("calendar_start_date_field")))
			},
			"calendar_end_date_field": func() {
				check("calendar_end_date_field", calendar_fields.EndDateValidation(db, gtfsRules.Rule("calendar_end_date_field")))
			},
			"calendar_monday_field": func() {
				check("calendar_monday_field", calendar_fields.MondayValidation(db, gtfsRules.Rule("calendar_monday_field")))
			},
			"calendar_tuesday_field": func() {
				check("calendar_tuesday_field", calendar_fields.TuesdayValidation(db, gtfsRules.Rule("calendar_tuesday_field")))
			},
			"calendar_wednesday_field": func() {
				check("calendar_wednesday_field", calendar_fields.WednesdayValidation(db, gtfsRules.Rule("calendar_wednesday_field")))
			},
			"calendar_thursday_field": func() {
				check("calendar_thursday_field", calendar_fields.ThursdayValidation(db, gtfsRules.Rule("calendar_thursday_field")))
			},
			"calendar_friday_field": func() {
				check("calendar_friday_field", calendar_fields.FridayValidation(db, gtfsRules.Rule("calendar_friday_field")))
			},
			"calendar_saturday_field": func() {
				check("calendar_saturday_field", calendar_fields.SaturdayValidation(db, gtfsRules.Rule("calendar_saturday_field")))
			},
			"calendar_sunday_field": func() {
				check("calendar_sunday_field", calendar_fields.SundayValidation(db, gtfsRules.Rule("calendar_sunday_field")))
			},

			//
			// Standard
			"calendar_service_id_unique": func() {
				check("calendar_service_id_unique", calendar_standard.ServiceIdUnique(db, gtfsRules.Rule("calendar_service_id_unique")))
			},
			"calendar_start_end_dates_valid_format": func() {
				check("calendar_start_end_dates_valid_format", calendar_standard.DateValidFormat(db, gtfsRules.Rule("calendar_start_end_dates_valid_format")))
			},
			"calendar_start_end_dates_valid": func() {
				check("calendar_start_end_dates_valid", calendar_standard.DateValid(db, gtfsRules.Rule("calendar_start_end_dates_valid")))
			},
			"calendar_monday_valid": func() {
				check("calendar_monday_valid", calendar_standard.MondayValid(db, gtfsRules.Rule("calendar_monday_valid")))
			},
			"calendar_tuesday_valid": func() {
				check("calendar_tuesday_valid", calendar_standard.TuesdayValid(db, gtfsRules.Rule("calendar_tuesday_valid")))
			},
			"calendar_wednesday_valid": func() {
				check("calendar_wednesday_valid", calendar_standard.WednesdayValid(db, gtfsRules.Rule("calendar_wednesday_valid")))
			},
			"calendar_thursday_valid": func() {
				check("calendar_thursday_valid", calendar_standard.ThursdayValid(db, gtfsRules.Rule("calendar_thursday_valid")))
			},
			"calendar_friday_valid": func() {
				check("calendar_friday_valid", calendar_standard.FridayValid(db, gtfsRules.Rule("calendar_friday_valid")))
			},
			"calendar_saturday_valid": func() {
				check("calendar_saturday_valid", calendar_standard.SaturdayValid(db, gtfsRules.Rule("calendar_saturday_valid")))
			},
			"calendar_sunday_valid": func() {
				check("calendar_sunday_valid", calendar_standard.SundayValid(db, gtfsRules.Rule("calendar_sunday_valid")))
			},
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
