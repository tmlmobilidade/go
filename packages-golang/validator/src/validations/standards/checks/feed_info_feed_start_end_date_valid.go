package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [feed_info.txt]
  - Field: [feed_start_date, feed_end_date]
  - Presence: Recommended
  - Type: Date

# Description

  - feed_start_date: First day for which the dataset provides complete and reliable service information. Both period
    dates may be omitted when unavailable. Dates within this period but outside the calendars explicitly have no
    service.
  - feed_end_date: Last day for which the dataset provides complete and reliable service information. The date must
    not precede feed_start_date when both are supplied. Dates within this period but outside the calendars explicitly
    have no service.

Validation: Compares the two populated date strings and reports feed_start_date greater than or equal to
feed_end_date. Equal dates are rejected by this implementation. Date existence and format are checked separately.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard].

[feed_info.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/feed-info
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#feed_infotxt
*/
func FeedStartEndDateValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "feed_info", []string{"feed_start_date", "feed_end_date"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		//
		// 2. Get the date value

		feedStartDate, err := queries.Field(rowCtx.Source, "feed_start_date")
		if err != nil {
			return err
		}

		feedEndDate, err := queries.Field(rowCtx.Source, "feed_end_date")
		if err != nil {
			return err
		}

		//
		// 3. Validate start_date is before end_date

		if feedStartDate != "" && feedEndDate != "" && feedStartDate >= feedEndDate {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", feedStartDate, feedEndDate))
		}

		//
		// 4. Return success

		return nil
	})
}
