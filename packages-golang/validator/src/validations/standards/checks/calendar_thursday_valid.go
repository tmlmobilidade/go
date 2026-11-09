package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [calendar.txt]
  - Field: [thursday]
  - Presence: Required
  - Type: Boolean

# Description

Indicates whether service is available on Thursday.

[calendar.txt]: https://gtfs.org/schedule/reference/#calendartxt
*/
func ThursdayValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "calendar", []string{"thursday"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "thursday")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		//
		// 2. Validate value is valid

		if value != "0" && value != "1" {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
		}

		//
		// 3. Return success

		return nil
	})
}
