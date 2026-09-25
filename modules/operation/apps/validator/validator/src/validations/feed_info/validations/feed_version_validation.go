package feed_info

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

- File: [feed_info.txt]
- Field: feed_version
- Presence: Optional
- Type: String

# Description

String that indicates the current version of their GTFS dataset. GTFS-consuming applications can display this value to help dataset publishers determine whether the latest dataset has been incorporated.

[feed_info.txt]: https://gtfs.org/schedule/reference/#feed_infotxt
*/
func FeedVersionValidation(severity *types.Severity, feedInfo *types.FeedInfo, row int) {
	ctx := lib.NewValidationContext("feed_version", "feed_info.txt", "feed_version_valid_identifier", row, services.AppMessageService)
	if severity != nil {
		ctx.WithSeverity(*severity)
	}

	if feedInfo.FeedVersion == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("feed_version_validation.required", "feed_version_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}
}
