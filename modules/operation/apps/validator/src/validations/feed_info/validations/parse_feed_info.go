package feed_info

import (
	"main/lib"
	"main/services"
	"main/types"
)

func ParseFeedInfo(rawFeedInfo types.FeedInfoRaw, row int) types.FeedInfo {
	var (
		feedInfo                                                                               types.FeedInfo = types.FeedInfo{}
		feedLang, feedPublisherName, feedPublisherUrl                                          string
		defaultLang, feedContactEmail, feedContactUrl, feedEndDate, feedStartDate, feedVersion string
		messages                                                                               []types.Message
	)

	stringFields := map[string]*string{
		"feed_lang":           &feedLang,
		"feed_publisher_name": &feedPublisherName,
		"feed_publisher_url":  &feedPublisherUrl,
		"default_lang":        &defaultLang,
		"feed_contact_email":  &feedContactEmail,
		"feed_contact_url":    &feedContactUrl,
		"feed_end_date":       &feedEndDate,
		"feed_start_date":     &feedStartDate,
		"feed_version":        &feedVersion,
	}

	addMessage := func(field, msg string) {
		messages = append(messages, types.Message{
			Field:    field,
			FileName: "feed_info.txt",
			Rows:     []int{row},
			Message:  msg,
			Severity: types.SEVERITY_ERROR,
			RuleID:   types.RuleIDFeedInfoValuesParse,
		})
	}

	// Parse string fields
	for field, target := range stringFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawFeedInfo, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}

	if len(messages) > 0 {
		services.AppMessageService.AddMessages(messages)
		return feedInfo
	}

	// Assign required fields
	feedInfo.FeedLang = lib.IfThenElse(feedLang != "", &feedLang, nil)
	feedInfo.FeedPublisherName = lib.IfThenElse(feedPublisherName != "", &feedPublisherName, nil)
	feedInfo.FeedPublisherUrl = lib.IfThenElse(feedPublisherUrl != "", &feedPublisherUrl, nil)

	// Assign optional fields
	feedInfo.DefaultLang = lib.IfThenElse(rawFeedInfo.DefaultLang != "", &defaultLang, nil)
	feedInfo.FeedContactEmail = lib.IfThenElse(rawFeedInfo.FeedContactEmail != "", &feedContactEmail, nil)
	feedInfo.FeedContactUrl = lib.IfThenElse(rawFeedInfo.FeedContactUrl != "", &feedContactUrl, nil)
	feedInfo.FeedEndDate = lib.IfThenElse(rawFeedInfo.FeedEndDate != "", &feedEndDate, nil)
	feedInfo.FeedStartDate = lib.IfThenElse(rawFeedInfo.FeedStartDate != "", &feedStartDate, nil)
	feedInfo.FeedVersion = lib.IfThenElse(rawFeedInfo.FeedVersion != "", &feedVersion, nil)

	return feedInfo
}
