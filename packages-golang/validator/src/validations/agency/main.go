package agency

import (
	"fmt"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/config"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	registry "github.com/tmlmobilidade/go/packages-golang/validator/src/validations"
	agency_custom "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/agency/custom/checks"
	agency_fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/agency/fields/checks"
	agency_standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/agency/standard/checks"
	"main/types"
)

func init() {
	registry.RegisterWithTables("agency", RunValidations)
}

func RunValidations(gtfs types.Gtfs, gtfsRules *types.GtfsRules, prepared ...*services.SQLiteTables) {
	lib.AppLogger.Debug("Running Validations for agency.txt")

	//
	// Create progress tracker

	tracker := lib.CreateProgressTracker(gtfs, "agency", config.ProgressThresholdSmall)

	//
	// Create the rule runner

	runner, err := services.NewRuleRunner(gtfs, gtfsRules, "agency")
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}

	//
	// Select the prepared agency table

	tables, err := services.ValidationTables(gtfs.DB(), prepared...)
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error preparing SQLite tables: %v", err))
		return
	}

	//
	// Iterate over agency table

	err = tables.ForEachRow("agency", func(row *services.SQLiteRow) error {
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
			"agency_id_field": func() { check("agency_id_field", agency_fields.AgencyIdField(db, gtfsRules.Rule("agency_id_field"))) },
			"agency_name_field": func() {
				check("agency_name_field", agency_fields.AgencyNameField(db, gtfsRules.Rule("agency_name_field")))
			},
			"agency_url_field": func() {
				check("agency_url_field", agency_fields.AgencyUrlField(db, gtfsRules.Rule("agency_url_field")))
			},
			"agency_timezone_field": func() {
				check("agency_timezone_field", agency_fields.AgencyTimezoneField(db, gtfsRules.Rule("agency_timezone_field")))
			},
			"agency_lang_field": func() {
				check("agency_lang_field", agency_fields.AgencyLangField(db, gtfsRules.Rule("agency_lang_field")))
			},
			"agency_phone_field": func() {
				check("agency_phone_field", agency_fields.AgencyPhoneField(db, gtfsRules.Rule("agency_phone_field")))
			},
			"agency_fare_url_field": func() {
				check("agency_fare_url_field", agency_fields.AgencyFareUrlField(db, gtfsRules.Rule("agency_fare_url_field")))
			},
			"agency_email_field": func() {
				check("agency_email_field", agency_fields.AgencyEmailField(db, gtfsRules.Rule("agency_email_field")))
			},

			//
			// Standard
			"agency_email_valid": func() {
				check("agency_email_valid", agency_standard.AgencyEmailValid(db, gtfsRules.Rule("agency_email_valid")))
			},
			"agency_id_valid": func() { check("agency_id_valid", agency_standard.AgencyIdValid(db, gtfsRules.Rule("agency_id_valid"))) },
			"agency_id_unique": func() {
				check("agency_id_unique", agency_standard.AgencyIdUnique(db, gtfsRules.Rule("agency_id_unique")))
			},
			"agency_name_valid": func() {
				check("agency_name_valid", agency_standard.AgencyNameValid(db, gtfsRules.Rule("agency_name_valid")))
			},
			"agency_url_valid": func() {
				check("agency_url_valid", agency_standard.AgencyUrlValid(db, gtfsRules.Rule("agency_url_valid")))
			},
			"agency_timezone_valid": func() {
				check("agency_timezone_valid", agency_standard.AgencyTimezoneValid(db, gtfsRules.Rule("agency_timezone_valid")))
			},
			"agency_lang_valid": func() {
				check("agency_lang_valid", agency_standard.AgencyLangValid(db, gtfsRules.Rule("agency_lang_valid")))
			},
			"agency_phone_valid": func() {
				check("agency_phone_valid", agency_standard.AgencyPhoneValid(db, gtfsRules.Rule("agency_phone_valid")))
			},
			"agency_fare_url_valid": func() {
				check("agency_fare_url_valid", agency_standard.AgencyFareUrlValid(db, gtfsRules.Rule("agency_fare_url_valid")))
			},

			//
			// Custom
			"agency_id_matched_with_agency_name": func() {
				check("agency_id_matched_with_agency_name", agency_custom.AgencyNameIdMatch(db, gtfsRules.Rule("agency_id_matched_with_agency_name")))
			},
		}, nil)
		return nil
	})

	//
	// Check for errors

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating agencies: %v", err))
	} else {
		tracker.Complete()
		lib.AppLogger.Info(fmt.Sprintf("Completed agency.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}
