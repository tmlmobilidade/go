package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
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

Presence and type follow [GTFS Standard].

[feed_info.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/feed-info
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#feed_infotxt
*/
func FeedEndDateField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "feed_info", []string{"feed_end_date"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the feed_end_date value

		value, err := queries.Field(row.Source, "feed_end_date")
		if err != nil {
			return err
		}

		//
		// 3. Check if the feed_end_date is required

		if value == "" {
			if context.ShouldIgnore(row) {
				return nil
			}

			context.AddMessage(row, context.GetSeverityMessage(row, "required", "recommended", "informational"))
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}
