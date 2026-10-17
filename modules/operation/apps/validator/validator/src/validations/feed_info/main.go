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

	// Create progress tracker
	tracker := lib.CreateProgressTracker(gtfs, "feed_info", config.ProgressThresholdSmall)

	err := gtfs.IterateFeedInfos(func(i int, feedInfo types.FeedInfoRaw) error {
		tracker.Track()
		feedInfoParsed := validations.ParseFeedInfo(feedInfo, i)

		if feedInfoParsed == (types.FeedInfo{}) {
			return nil
		}

		runner.Run(services.RuleActions{
			"feed_lang_valid_tag":                                   func() { validations.FeedLangValidation(&feedInfoParsed, i, fileRules) },
			"feed_publisher_name_non_empty":                         func() { validations.FeedPublisherNameValidation(&feedInfoParsed, i, fileRules) },
			"feed_publisher_url_valid_http_url":                     func() { validations.FeedPublisherUrlValidation(&feedInfoParsed, i, fileRules) },
			"feed_contact_email_valid_address":                      func() { validations.FeedContactEmailValidation(&feedInfoParsed, i, fileRules) },
			"feed_contact_url_valid_http_url":                       func() { validations.FeedContactUrlValidation(&feedInfoParsed, i, fileRules) },
			"feed_end_date_valid_yyyymmdd_not_before_start":         func() { validations.FeedEndDateValidation(&feedInfoParsed, i, fileRules) },
			"feed_start_date_valid_yyyymmdd":                        func() { validations.FeedStartDateValidation(&feedInfoParsed, i, fileRules) },
			"feed_version_valid_identifier":                         func() { validations.FeedVersionValidation(&feedInfoParsed, i, fileRules) },
			"feed_info_default_lang_matches_feed_lang_when_present": func() { validations.DefaultLangValidation(&feedInfoParsed, i, fileRules) },
		}, nil)

		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating feed info: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed feed_info.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}
