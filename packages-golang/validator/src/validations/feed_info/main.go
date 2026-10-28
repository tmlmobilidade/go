package feed_info

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/services"
	"main/types"
	registry "main/validations"
	fields "main/validations/feed_info/fields/checks"
	standard "main/validations/feed_info/standard/checks"
)

func init() {
	registry.Register("feed_info", RunValidations)
}

func RunValidations(gtfs types.Gtfs, gtfsRules *types.GtfsRules) {
	runner, dagErr := services.NewRuleRunner(gtfs, gtfsRules, "feed_info")
	if dagErr != nil {
		lib.AppLogger.Error(dagErr.Error())
		return
	}
	lib.AppLogger.Debug("Running FeedInfo Validations...")

	//
	// Create progress tracker
	tracker := lib.CreateProgressTracker(gtfs, "feed_info", config.ProgressThresholdSmall)

	//
	// Select the prepared GTFS tables

	tables, err := services.ValidationTables(gtfs.DB())
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error preparing SQLite tables: %v", err))
		return
	}

	//
	// Iterate over the feed_info table

	err = tables.ForEachRow("feed_info", func(row *services.SQLiteRow) error {
		db := row.Context()
		tracker.Track()
		check := func(ruleID string, err error) {
			if err != nil {
				ctx := lib.NewValidationContext("N/A", "feed_info.txt", ruleID, db.Row, services.AppMessageService)
				ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
			}
		}

		runner.Run(services.RuleActions{
			//
			// Fields
			"feed_info_default_lang_field": func() {
				check("feed_info_default_lang_field", fields.DefaultLangField(db, gtfsRules.Rule("feed_info_default_lang_field")))
			},
			"feed_info_feed_lang_field": func() {
				check("feed_info_feed_lang_field", fields.FeedLangField(db, gtfsRules.Rule("feed_info_feed_lang_field")))
			},
			"feed_info_feed_publisher_name_field": func() {
				check("feed_info_feed_publisher_name_field", fields.FeedPublisherNameField(db, gtfsRules.Rule("feed_info_feed_publisher_name_field")))
			},
			"feed_info_feed_publisher_url_field": func() {
				check("feed_info_feed_publisher_url_field", fields.FeedPublisherUrlField(db, gtfsRules.Rule("feed_info_feed_publisher_url_field")))
			},
			"feed_info_feed_contact_email_field": func() {
				check("feed_info_feed_contact_email_field", fields.FeedContactEmailField(db, gtfsRules.Rule("feed_info_feed_contact_email_field")))
			},
			"feed_info_feed_contact_url_field": func() {
				check("feed_info_feed_contact_url_field", fields.FeedContactUrlField(db, gtfsRules.Rule("feed_info_feed_contact_url_field")))
			},
			"feed_info_feed_end_date_field": func() {
				check("feed_info_feed_end_date_field", fields.FeedEndDateField(db, gtfsRules.Rule("feed_info_feed_end_date_field")))
			},
			"feed_info_feed_start_date_field": func() {
				check("feed_info_feed_start_date_field", fields.FeedStartDateField(db, gtfsRules.Rule("feed_info_feed_start_date_field")))
			},
			"feed_info_feed_version_field": func() {
				check("feed_info_feed_version_field", fields.FeedVersionField(db, gtfsRules.Rule("feed_info_feed_version_field")))
			},

			//
			// Standard
			"feed_info_default_lang_valid": func() {
				check("feed_info_default_lang_valid", standard.DefaultLangValid(db, gtfsRules.Rule("feed_info_default_lang_valid")))
			},
			"feed_info_feed_contact_email_valid": func() {
				check("feed_info_feed_contact_email_valid", standard.FeedContactEmailValid(db, gtfsRules.Rule("feed_info_feed_contact_email_valid")))
			},
			"feed_info_feed_contact_url_valid": func() {
				check("feed_info_feed_contact_url_valid", standard.FeedContactUrlValid(db, gtfsRules.Rule("feed_info_feed_contact_url_valid")))
			},
			"feed_info_feed_lang_valid": func() {
				check("feed_info_feed_lang_valid", standard.FeedLangValid(db, gtfsRules.Rule("feed_info_feed_lang_valid")))
			},
			"feed_info_feed_publisher_url_valid": func() {
				check("feed_info_feed_publisher_url_valid", standard.FeedPublisherUrlValid(db, gtfsRules.Rule("feed_info_feed_publisher_url_valid")))
			},
			"feed_info_feed_end_date_format": func() {
				check("feed_info_feed_end_date_format", standard.FeedEndDateFormat(db, gtfsRules.Rule("feed_info_feed_end_date_format")))
			},
			"feed_info_feed_start_date_format": func() {
				check("feed_info_feed_start_date_format", standard.FeedStartDateFormat(db, gtfsRules.Rule("feed_info_feed_start_date_format")))
			},
			"feed_info_start_end_dates_valid": func() {
				check("feed_info_start_end_dates_valid", standard.FeedStartEndDateValid(db, gtfsRules.Rule("feed_info_start_end_dates_valid")))
			},
		}, nil)
		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating feed info: %v", err))
	} else {
		tracker.Complete()
		lib.AppLogger.Info(fmt.Sprintf("Completed feed_info.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}
