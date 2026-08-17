package feed_info

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

- File: [feed_info.txt]
- Field: feed_publisher_url
- Presence: Required
- Type: URL

# Description

URL of the dataset publishing organization's website. This may be the same as one of the agency.agency_url values.

[feed_info.txt]: https://gtfs.org/schedule/reference/#feed_infotxt
*/
func FeedPublisherUrlValidation(feedInfo *types.FeedInfo, row int) {
	ctx := lib.NewValidationContext("feed_publisher_url", "feed_info.txt", "feed_publisher_url_valid_http_url", row, services.AppMessageService)

	if feedInfo.FeedPublisherUrl == nil || *feedInfo.FeedPublisherUrl == "" {
		ctx.AddError(ctx.GetTranslatedMessage("feed_publisher_url_validation.required"))
		return
	}

	if valid := lib.ValidateUrl(*feedInfo.FeedPublisherUrl); !valid {
		ctx.AddError(ctx.GetTranslatedMessage("feed_publisher_url_validation.invalid"))
		return
	}
}
