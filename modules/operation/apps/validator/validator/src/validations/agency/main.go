package agency

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/services"
	"main/types"
	registry "main/validations"
	agency_custom "main/validations/agency/custom/checks"
	agency_fields "main/validations/agency/fields/checks"
	agency_standard "main/validations/agency/standard/checks"
)

func init() {
	registry.Register("agency", RunValidations)
}

func RunValidations(gtfs types.Gtfs, gtfsRules *types.GtfsRules) {
	lib.AppLogger.Debug("Running Validations for agency.txt")

	//
	// Create progress tracker

	tracker := lib.CreateProgressTracker(gtfs, "agency", config.ProgressThresholdSmall)

	//
	// Get file rules

	var fileRules *types.AgencyRules
	if gtfsRules != nil {
		fileRules = &gtfsRules.Agency
	}
	runner, err := services.NewRuleRunner(gtfs, fileRules)
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}

	//
	// Open agency table

	table, err := services.NewSQLiteTable(gtfs.DB(), "agency")
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error opening agency table: %v", err))
		return
	}

	//
	// Iterate over agency table

	err = table.ForEachRow(func(row *services.SQLiteRow) error {
		db := row.Context()
		tracker.Track()
		check := func(ruleID string, err error) {
			if err != nil {
				ctx := lib.NewValidationContext("N/A", "agency.txt", ruleID, db.Row, services.AppMessageService)
				ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
			}
		}

		runner.Run(services.RuleActions{
			//
			// Fields
			"agency_id_field":       func() { check("agency_id_field", agency_fields.AgencyIdField(db, fileRules)) },
			"agency_name_field":     func() { check("agency_name_field", agency_fields.AgencyNameField(db, fileRules)) },
			"agency_url_field":      func() { check("agency_url_field", agency_fields.AgencyUrlField(db, fileRules)) },
			"agency_timezone_field": func() { check("agency_timezone_field", agency_fields.AgencyTimezoneField(db, fileRules)) },
			"agency_lang_field":     func() { check("agency_lang_field", agency_fields.AgencyLangField(db, fileRules)) },
			"agency_phone_field":    func() { check("agency_phone_field", agency_fields.AgencyPhoneField(db, fileRules)) },
			"agency_fare_url_field": func() { check("agency_fare_url_field", agency_fields.AgencyFareUrlField(db, fileRules)) },
			"agency_email_field":    func() { check("agency_email_field", agency_fields.AgencyEmailField(db, fileRules)) },
			
			//
			// Standard
			"agency_email_valid":    func() { check("agency_email_valid", agency_standard.AgencyEmailValid(db, fileRules)) },
			"agency_id_valid":       func() { check("agency_id_valid", agency_standard.AgencyIdValid(db, fileRules)) },
			"agency_id_unique":      func() { check("agency_id_unique", agency_standard.AgencyIdUnique(db, fileRules)) },
			"agency_name_valid":     func() { check("agency_name_valid", agency_standard.AgencyNameValid(db, fileRules)) },
			"agency_url_valid":      func() { check("agency_url_valid", agency_standard.AgencyUrlValid(db, fileRules)) },
			"agency_timezone_valid": func() { check("agency_timezone_valid", agency_standard.AgencyTimezoneValid(db, fileRules)) },
			"agency_lang_valid":     func() { check("agency_lang_valid", agency_standard.AgencyLangValid(db, fileRules)) },
			"agency_phone_valid":    func() { check("agency_phone_valid", agency_standard.AgencyPhoneValid(db, fileRules)) },
			"agency_fare_url_valid": func() { check("agency_fare_url_valid", agency_standard.AgencyFareUrlValid(db, fileRules)) },

			//
			// Custom
			"agency_id_matched_with_agency_name": func() { check("agency_id_matched_with_agency_name", agency_custom.AgencyNameIdMatch(db, fileRules)) },
		
		}, nil)
		return nil
	})

	//
	// Check for errors

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating agencies: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed agency.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}
