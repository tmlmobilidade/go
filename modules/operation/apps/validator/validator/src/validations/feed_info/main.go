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

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	var section *types.FeedInfoRules
	if rules != nil {
		section = &rules.FeedInfo
	}
	runner, dagErr := services.NewRuleRunner(gtfs, section)
	if dagErr != nil {
		lib.AppLogger.Error(dagErr.Error())
		return
	}
	lib.AppLogger.Debug("Running FeedInfo Validations...")

	// Create progress tracker
	tracker := lib.CreateProgressTracker(gtfs, "feed_info", config.ProgressThresholdSmall)

	err := gtfs.IterateFeedInfos(func(i int, feedInfo types.FeedInfoRaw) error {
		tracker.Track()
		feedInfoParsed := validations.ParseFeedInfo(feedInfo, i)

		if feedInfoParsed == (types.FeedInfo{}) {
			return nil
		}

		// Validate feed_lang
		runner.Run(services.RuleActions{
			"feed_lang_valid_tag":                           func() { validations.FeedLangValidation(nil, &feedInfoParsed, i) },
			"feed_publisher_name_non_empty":                 func() { validations.FeedPublisherNameValidation(nil, &feedInfoParsed, i) },
			"feed_publisher_url_valid_http_url":             func() { validations.FeedPublisherUrlValidation(nil, &feedInfoParsed, i) },
			"feed_contact_email_valid_address":              func() { validations.FeedContactEmailValidation(nil, &feedInfoParsed, i) },
			"feed_contact_url_valid_http_url":               func() { validations.FeedContactUrlValidation(nil, &feedInfoParsed, i) },
			"feed_end_date_valid_yyyymmdd_not_before_start": func() { validations.FeedEndDateValidation(nil, &feedInfoParsed, i) },
			"feed_start_date_valid_yyyymmdd":                func() { validations.FeedStartDateValidation(nil, &feedInfoParsed, i) },
			"feed_version_valid_identifier":                 func() { validations.FeedVersionValidation(nil, &feedInfoParsed, i) },
			"feed_info_default_lang_matches_feed_lang_when_present":   func() { validations.DefaultLangValidation(nil, &feedInfoParsed, i) },
		}, nil)

		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating feed info: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed feed_info.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}
