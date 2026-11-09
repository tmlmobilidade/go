package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
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

Presence and type follow [GTFS Standard].

[feed_info.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/feed-info
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#feed_infotxt
*/
func FeedStartDateField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "feed_info", []string{"feed_start_date"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the feed_start_date value

		value, err := queries.Field(row.Source, "feed_start_date")
		if err != nil {
			return err
		}

		//
		// 3. Check if the feed_start_date is required

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
