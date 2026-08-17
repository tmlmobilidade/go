package feed_info

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

- File: [feed_info.txt]
- Field: feed_start_date
- Presence: Recommended
- Type: Date

# Description

The dataset provides complete and reliable schedule information for service in the period from the beginning of the feed_start_date day to the end of the feed_end_date day.

Both days may be left empty if unavailable.

The feed_end_date date must not precede the feed_start_date date if both are given.

It is recommended that dataset providers give schedule data outside this period to advise of likely future service, but dataset consumers should treat it mindful of its non-authoritative status.

If feed_start_date or feed_end_date extend beyond the active calendar dates defined in calendar.txt and calendar_dates.txt, the dataset is making an explicit assertion that there is no service for dates within the feed_start_date or feed_end_date range but not included in the active calendar dates.

[feed_info.txt]: https://gtfs.org/schedule/reference/#feed_infotxt
*/
func FeedStartDateValidation(severity *types.Severity, feedInfo *types.FeedInfo, row int) {
	ctx := lib.NewValidationContext("feed_start_date", "feed_info.txt", "feed_start_date_valid_yyyymmdd", row, services.AppMessageService)
	if severity != nil {
		ctx.WithSeverity(*severity)
	} else {
		ctx.WithSeverity(types.SEVERITY_WARNING)
	}

	if feedInfo.FeedStartDate == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("feed_start_date_validation.required", "feed_start_date_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if feedInfo.FeedStartDate != nil && *feedInfo.FeedStartDate != "" {
		if !lib.IsValidServiceDate(*feedInfo.FeedStartDate) {
			ctx.AddError(ctx.GetTranslatedMessage("feed_start_date_validation.invalid"))
			return
		}
	}
}
