package feed_info

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

- File: [feed_info.txt]
- Field: feed_publisher_name
- Presence: Optional
- Type: String

# Description

Full name of the organization that publishes the dataset. This may be the same as one of the agency.agency_name values.

[feed_info.txt]: https://gtfs.org/schedule/reference/#feed_infotxt
*/
func FeedPublisherNameValidation(feedInfo *types.FeedInfo, row int, rules *types.FeedInfoRules) {
	ctx := lib.NewValidationContext("feed_publisher_name", "feed_info.txt", "feed_publisher_name_non_empty", row, services.AppMessageService)
	if rules != nil && rules.FeedPublisherName.Severity != "" {
		ctx.WithSeverity(rules.FeedPublisherName.Severity)
	}

	if feedInfo.FeedPublisherName == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("feed_publisher_name_validation.required", "feed_publisher_name_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}
}
