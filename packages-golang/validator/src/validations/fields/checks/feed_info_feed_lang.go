package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [feed_info.txt]
  - Field: feed_lang
  - Presence: Required
  - Type: Language code

# Description

Default language of text in the dataset. Use translations.txt for other languages. The value mul is reserved for
datasets whose original text uses multiple languages, with translations supplied for those languages.

Presence and type follow [GTFS Standard].

[feed_info.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/feed-info
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#feed_infotxt
*/
func FeedLangField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "feed_info", []string{"feed_lang"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the feed_lang value

		value, err := queries.Field(row.Source, "feed_lang")
		if err != nil {
			return err
		}

		//
		// 3. Check if the feed_lang is required

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
