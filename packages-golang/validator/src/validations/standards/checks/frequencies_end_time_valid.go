package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	validators "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/validators"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: frequencies.txt
  - Field: end_time
  - Presence: Required
  - Type: Time

# Description

Time at which service changes to a different headway (or ceases) at the first stop in the trip.

[frequencies.txt]: https://gtfs.org/schedule/reference/#frequenciestxt
*/
func EndTimeValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "frequencies", []string{"end_time"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "end_time")
		if err != nil {
			return err
		}

		//
		// 2. Skip empty end_time values

		if value == "" {
			return nil
		}

		//
		// 3. Check if the end_time is a valid time

		if !validators.ValidateTime(value) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
		}

		//
		// 4. Return success

		return nil
	})
}
