package agency

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/services"
	"main/types"
	registry "main/validations"
	validations "main/validations/agency/validations"
)

func init() {
	registry.Register("agency", RunValidations)
}

func RunValidations(gtfs types.Gtfs, gtfsRules *types.GtfsRules) {
	lib.AppLogger.Debug("Running Validations for agency.txt")

	// Create progress tracker
	tracker := lib.CreateProgressTracker(gtfs, "agency", config.ProgressThresholdSmall)

	var fileRules *types.AgencyRules
	if gtfsRules != nil {
		fileRules = &gtfsRules.Agency
	}
	runner, err := services.NewRuleRunner(gtfs, fileRules)
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}

	table, err := services.NewSQLiteTable(gtfs.DB(), "agency")
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error opening agency table: %v", err))
		return
	}

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
			"agency_id_unique":    func() { check("agency_id_unique", validations.AgencyIdValidation(db, fileRules)) },
			"agency_name_present": func() { check("agency_name_present", validations.AgencyNameValidation(db, fileRules)) },
			"agency_id_matched_with_agency_name": func() {
				check("agency_id_matched_with_agency_name", validations.AgencyNameIdMatchValidation(db, fileRules))
			},
			"agency_url_valid_url":            func() { check("agency_url_valid_url", validations.AgencyUrlValidation(db, fileRules)) },
			"agency_timezone_valid_id":        func() { check("agency_timezone_valid_id", validations.AgencyTimezoneValidation(db, fileRules)) },
			"agency_lang_valid_language_tag":  func() { check("agency_lang_valid_language_tag", validations.AgencyLangValidation(db, fileRules)) },
			"agency_phone_valid_phone_number": func() { check("agency_phone_valid_phone_number", validations.AgencyPhoneValidation(db, fileRules)) },
			"agency_fare_url_valid_url":       func() { check("agency_fare_url_valid_url", validations.AgencyFareUrlValidation(db, fileRules)) },
			"agency_email_valid_address":      func() { check("agency_email_valid_address", validations.AgencyEmailValidation(db, fileRules)) },
		}, nil)
		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating agencies: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed agency.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}
