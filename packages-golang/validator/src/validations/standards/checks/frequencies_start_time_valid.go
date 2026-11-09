package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	validators "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/validators"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: frequencies.txt
  - Field: start_time
  - Presence: Required
  - Type: Time

# Description

Time at which the first vehicle departs from the first stop of the trip with the specified headway.

[frequencies.txt]: https://gtfs.org/schedule/reference/#frequenciestxt
*/
func StartTimeValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "frequencies", []string{"start_time"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "start_time")
		if err != nil {
			return err
		}

		//
		// 2. Skip empty start_time values

		if value == "" {
			return nil
		}

		//
		// 3. Check if the start_time is a valid time

		if !validators.ValidateTime(value) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
		}

		//
		// 4. Return success

		return nil
	})
}
