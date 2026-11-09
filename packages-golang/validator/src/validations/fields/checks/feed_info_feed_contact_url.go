package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [feed_info.txt]
  - Field: feed_contact_url
  - Presence: Optional
  - Type: URL

# Description

Technical contact page, support form or help desk for the dataset and its publication. Providing this field or
feed_contact_email is recommended.

Presence and type follow [GTFS Standard].

[feed_info.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/feed-info
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#feed_infotxt
*/
func FeedContactUrlField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "feed_info", []string{"feed_contact_url"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the feed_contact_url value

		value, err := queries.Field(row.Source, "feed_contact_url")
		if err != nil {
			return err
		}

		//
		// 3. Check if the feed_contact_url is required

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
