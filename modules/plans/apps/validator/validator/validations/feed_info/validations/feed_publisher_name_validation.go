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
- Presence: Required
- Type: String

# Description

Full name of the organization that publishes the dataset. This may be the same as one of the agency.agency_name values.

[feed_info.txt]: https://gtfs.org/schedule/reference/#feed_infotxt
*/
func FeedPublisherNameValidation(feedInfo *types.FeedInfo, row int) {
	ctx := lib.NewValidationContext("feed_publisher_name", "feed_info.txt", "feed_publisher_name_non_empty", row, services.AppMessageService)

	if feedInfo.FeedPublisherName == nil || *feedInfo.FeedPublisherName == "" {
		ctx.AddError(ctx.GetTranslatedMessage("feed_publisher_name_validation.required"))
		return
	}
}
