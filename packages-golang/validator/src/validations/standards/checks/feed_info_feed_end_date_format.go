package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	validators "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/validators"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [feed_info.txt]
  - Field: feed_end_date
  - Presence: Recommended
  - Type: Date

# Description

Last day for which the dataset provides complete and reliable service information. The date must not precede
feed_start_date when both are supplied. Dates within this period but outside the calendars explicitly have no
service.

Validation: Checks for eight characters representing an existing calendar date in YYYYMMDD format. Surrounding
whitespace is not removed. Empty values are skipped; required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard].

[feed_info.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/feed-info
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#feed_infotxt
*/
func FeedEndDateFormat(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "feed_info", []string{"feed_end_date"}, func(rowCtx *contextTypes.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		//
		// 2. Get the feed_end_date value

		value, err := queries.Field(rowCtx.Source, "feed_end_date")
		if err != nil {
			return err
		}

		//
		// 3. Check if the feed_end_date is in the correct format

		if value != "" && !validators.IsValidServiceDate(value) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}
