package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

func FeedPublisherNameField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "feed_info", []string{"feed_publisher_name"}, func(row *context.ValidationContext) error {
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
