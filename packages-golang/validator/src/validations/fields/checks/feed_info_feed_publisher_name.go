package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [feed_info.txt]
  - Field: feed_publisher_name
  - Presence: Required
  - Type: Text

# Description

Full name of the organization publishing the dataset. It may be the same as an agency_name in agency.txt.

Presence and type follow [GTFS Standard].

[feed_info.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/feed-info
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#feed_infotxt
*/
func FeedPublisherNameField(ctx *contextTypes.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "feed_info", []string{"feed_publisher_name"}, func(row *contextTypes.ValidationContext) error {
		//
		// 2. Get the feed_publisher_name value

		value, err := queries.Field(row.Source, "feed_publisher_name")
		if err != nil {
			return err
		}

		//
		// 3. Check if the feed_publisher_name is required

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
