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
func FeedVersionValidation(feedInfo *types.FeedInfo, row int, rules *types.FeedInfoRules) {
	ctx := lib.NewValidationContext("feed_version", "feed_info.txt", "feed_version_valid_identifier", row, services.AppMessageService)
	if rules != nil && rules.FeedVersion.Severity != "" {
		ctx.WithSeverity(rules.FeedVersion.Severity)
	}

	// 1. Validate feed_version is present
	if feedInfo.FeedVersion == nil || *feedInfo.FeedVersion == "" {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate feed_version is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}
}
