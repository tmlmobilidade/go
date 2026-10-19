package feed_info

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/services"
	"main/types"
	registry "main/validations"
	validations "main/validations/feed_info/validations"
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
	// Select the prepared agency table

	tables, err := services.ValidationTables(gtfs.DB(), prepared...)
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error preparing SQLite tables: %v", err))
		return
	}

	//
	// Iterate over feed info table

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
			"default_lang_field":        func() { check("default_lang_field", feed_info_fields.DefaultLangField(db, fileRules)) },
			"feed_lang_field":           func() { check("feed_lang_field", feed_info_fields.FeedLangField(db, fileRules)) },
			"feed_publisher_name_field": func() { check("feed_publisher_name_field", feed_info_fields.FeedPublisherNameField(db, fileRules)) },
			"feed_publisher_url_field":  func() { check("feed_publisher_url_field", feed_info_fields.FeedPublisherUrlField(db, fileRules)) },
			"feed_contact_email_field":  func() { check("feed_contact_email_field", feed_info_fields.FeedContactEmailField(db, fileRules)) },
			"feed_contact_url_field":    func() { check("feed_contact_url_field", feed_info_fields.FeedContactUrlField(db, fileRules)) },
			"feed_end_date_field":       func() { check("feed_end_date_field", feed_info_fields.FeedEndDateField(db, fileRules)) },
			"feed_start_date_field":     func() { check("feed_start_date_field", feed_info_fields.FeedStartDateField(db, fileRules)) },
			"feed_version_field":        func() { check("feed_version_field", feed_info_fields.FeedVersionField(db, fileRules)) },

			//
			// Standard
			"default_lang_valid":        func() { check("default_lang_valid", feed_info_standard.DefaultLangValid(db, fileRules)) },
			"feed_lang_valid":           func() { check("feed_lang_valid", feed_info_standard.FeedLangValid(db, fileRules)) },
			"feed_publisher_name_valid": func() { check("feed_publisher_name_valid", feed_info_standard.FeedPublisherNameValid(db, fileRules)) },
			"feed_publisher_url_valid":  func() { check("feed_publisher_url_valid", feed_info_standard.FeedPublisherUrlValid(db, fileRules)) },
			"feed_contact_email_valid":  func() { check("feed_contact_email_valid", feed_info_standard.FeedContactEmailValid(db, fileRules)) },
			"feed_contact_url_valid":    func() { check("feed_contact_url_valid", feed_info_standard.FeedContactUrlValid(db, fileRules)) },
			"feed_end_date_valid":       func() { check("feed_end_date_valid", feed_info_standard.FeedEndDateValid(db, fileRules)) },
			"feed_start_date_valid":     func() { check("feed_start_date_valid", feed_info_standard.FeedStartDateValid(db, fileRules)) },
			"feed_version_valid":        func() { check("feed_version_valid", feed_info_standard.FeedVersionValid(db, fileRules)) },
			
		}, nil)
		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating feed info: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed feed_info.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}
