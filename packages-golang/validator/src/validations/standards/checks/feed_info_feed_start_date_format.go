package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	validators "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/validators"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [feed_info.txt]
  - Field: feed_start_date
  - Presence: Recommended
  - Type: Date

# Description

First day for which the dataset provides complete and reliable service information. Both period dates may be
omitted when unavailable. Dates within this period but outside the calendars explicitly have no service.

Validation: Checks for eight characters representing an existing calendar date in YYYYMMDD format. Surrounding
whitespace is not removed. Empty values are skipped; required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard].

[feed_info.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/feed-info
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#feed_infotxt
*/
func FeedStartDateFormat(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "feed_info", []string{"feed_start_date"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		//
		// 2. Get the feed_start_date value

		value, err := queries.Field(rowCtx.Source, "feed_start_date")
		if err != nil {
			return err
		}

		//
		// 3. Check if the feed_start_date is in the correct format

		if value != "" && !validators.IsValidServiceDate(value) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}
