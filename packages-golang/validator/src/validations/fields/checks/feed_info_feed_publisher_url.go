package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

func FeedPublisherUrlField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "feed_info", []string{"feed_publisher_url"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the feed_publisher_url value

		value, err := queries.Field(row.Source, "feed_publisher_url")
		if err != nil {
			return err
		}

		//
		// 3. Check if the feed_publisher_url is required

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
