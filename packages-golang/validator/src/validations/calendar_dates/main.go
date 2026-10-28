package calendar_dates

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/services"
	"main/types"
	registry "main/validations"
	fields "main/validations/calendar_dates/fields/checks"
	standard "main/validations/calendar_dates/standard/checks"
)

func init() {
	registry.RegisterWithTables("calendar_dates", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runner, dagErr := services.NewRuleRunner(gtfs, rules, "calendar_dates")
	if dagErr != nil {
		lib.AppLogger.Error(dagErr.Error())
		return
	}
	lib.AppLogger.Debug("Running Calendar Dates Validations...")

	//
	// Create progress tracker
	tracker := lib.CreateProgressTracker(gtfs, "calendar_dates", config.ProgressThresholdSmall)

	//
	// Open the GTFS tables

	tables, err := services.ValidationTables(gtfs.DB(), prepared...)
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error preparing SQLite tables: %v", err))
		return
	}

	//
	// Iterate over the calendar_dates table

	err = tables.ForEachRow("calendar_dates", func(row *services.SQLiteRow) error {
		db := row.Context()
		tracker.Track()
		check := func(ruleID string, err error) {
			if err != nil {
				ctx := lib.NewValidationContext("N/A", "calendar_dates.txt", ruleID, db.Row, services.AppMessageService)
				ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
			}
		}

		runner.Run(services.RuleActions{
			//
			// Fields
			"calendar_dates_date_field": func() {
				check("calendar_dates_date_field", fields.DateField(db, rules.Rule("calendar_dates_date_field")))
			},
			"calendar_dates_exception_type_field": func() {
				check("calendar_dates_exception_type_field", fields.ExceptionTypeField(db, rules.Rule("calendar_dates_exception_type_field")))
			},
			"calendar_dates_service_id_field": func() {
				check("calendar_dates_service_id_field", fields.ServiceIdField(db, rules.Rule("calendar_dates_service_id_field")))
			},

			//
			// Standard
			"calendar_dates_date_valid": func() {
				check("calendar_dates_date_valid", standard.DateValid(db, rules.Rule("calendar_dates_date_valid")))
			},
			"calendar_dates_exception_type_valid": func() {
				check("calendar_dates_exception_type_valid", standard.ExceptionTypeValid(db, rules.Rule("calendar_dates_exception_type_valid")))
			},
			"calendar_dates_service_id_foreign": func() {
				check("calendar_dates_service_id_foreign", standard.ServiceIdForeign(db, rules.Rule("calendar_dates_service_id_foreign")))
			},
		}, nil)

		return nil
	})

	//
	// Check for errors

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating calendar dates: %v", err))
	} else {
		tracker.Complete()
		lib.AppLogger.Info(fmt.Sprintf("Completed calendar_dates.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}
