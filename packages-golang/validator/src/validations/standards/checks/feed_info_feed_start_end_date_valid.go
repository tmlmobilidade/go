package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

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
