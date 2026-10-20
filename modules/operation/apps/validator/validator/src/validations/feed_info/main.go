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
	var fileRules *types.FeedInfoRules
	if gtfsRules != nil {
		fileRules = &gtfsRules.FeedInfo
	}
	runner, dagErr := services.NewRuleRunner(gtfs, fileRules)
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
			"default_lang_field":        func() { check("default_lang_field", fields.DefaultLangField(db, fileRules)) },
			"feed_lang_field":           func() { check("feed_lang_field", fields.FeedLangField(db, fileRules)) },
			"feed_publisher_name_field": func() { check("feed_publisher_name_field", fields.FeedPublisherNameField(db, fileRules)) },
			"feed_publisher_url_field":  func() { check("feed_publisher_url_field", fields.FeedPublisherUrlField(db, fileRules)) },
			"feed_contact_email_field":  func() { check("feed_contact_email_field", fields.FeedContactEmailField(db, fileRules)) },
			"feed_contact_url_field":    func() { check("feed_contact_url_field", fields.FeedContactUrlField(db, fileRules)) },
			"feed_end_date_field":       func() { check("feed_end_date_field", fields.FeedEndDateField(db, fileRules)) },
			"feed_start_date_field":     func() { check("feed_start_date_field", fields.FeedStartDateField(db, fileRules)) },
			"feed_version_field":        func() { check("feed_version_field", fields.FeedVersionField(db, fileRules)) },

			//
			// Standard
			"feed_info_default_lang_valid":       func() { check("feed_info_default_lang_valid", standard.DefaultLangValid(db, fileRules)) },
			"feed_info_feed_contact_email_valid": func() { check("feed_info_feed_contact_email_valid", standard.FeedContactEmailValid(db, fileRules)) },
			"feed_info_feed_contact_url_valid":   func() { check("feed_info_feed_contact_url_valid", standard.FeedContactUrlValid(db, fileRules)) },
			"feed_info_feed_lang_valid":          func() { check("feed_info_feed_lang_valid", standard.FeedLangValid(db, fileRules)) },
			"feed_info_feed_publisher_url_valid":  func() { check("feed_info_feed_publisher_url_valid", standard.FeedPublisherUrlValid(db, fileRules)) },
			"feed_info_feed_end_date_format":      func() { check("feed_info_feed_end_date_format", standard.FeedEndDateFormat(db, fileRules)) },
			"feed_info_feed_start_date_format":    func() { check("feed_info_feed_start_date_format", standard.FeedStartDateFormat(db, fileRules)) },
			"feed_info_start_end_dates_valid":       func() { check("feed_info_start_end_dates_valid", standard.FeedStartEndDateValid(db, fileRules)) },
		
		}, nil)
		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating feed info: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed feed_info.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}
