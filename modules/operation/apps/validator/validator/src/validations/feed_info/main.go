package feed_info

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/types"
	validations "main/validations/feed_info/validations"
	registry "main/validations"
)

func init() {
	registry.Register("feed_info", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
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
		validations.FeedLangValidation(&feedInfoParsed, i)

		// Validate feed_publisher_name
		validations.FeedPublisherNameValidation(&feedInfoParsed, i)

		// Validate feed_publisher_url
		validations.FeedPublisherUrlValidation(&feedInfoParsed, i)
		
		// Validate feed_contact_email
		validations.FeedContactEmailValidation(nil, &feedInfoParsed, i)

		// Validate feed_contact_url
		validations.FeedContactUrlValidation(nil, &feedInfoParsed, i)

		// Validate feed_end_date
		validations.FeedEndDateValidation(nil, &feedInfoParsed, i)

		// Validate feed_start_date
		validations.FeedStartDateValidation(nil, &feedInfoParsed, i)

		// Validate feed_version
		validations.FeedVersionValidation(nil, &feedInfoParsed, i)

		// Validate default_lang
		validations.DefaultLangValidation(nil, &feedInfoParsed, i)

		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating feed info: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed feed_info.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}
