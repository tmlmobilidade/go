package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	"strconv"
)

/*
# Attributes
  - File: [transfers.txt]
  - Field: min_transfer_time
  - Presence: Optional
  - Type: Non-negative integer

# Description

Amount of time, in seconds, that must be available to permit a transfer between routes at the specified stops.
The min_transfer_time should be sufficient to permit a typical rider to move between the two stops, including buffer time to allow for schedule variance on each route.

[transfers.txt]: https://gtfs.org/schedule/reference/#transfertstxt
*/
func MinTransferTimeValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "transfers", []string{"min_transfer_time"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "min_transfer_time")
		if err != nil {
			return err
		}

		//
		// 2. Skip empty min_transfer_time values

		if value == "" {
			return nil
		}

		//
		// 3. Convert the min_transfer_time to an integer

		seconds, err := strconv.Atoi(value)

		//
		// 4. Check if the min_transfer_time is valid

		if err != nil || seconds < 0 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
		}

		//
		// 5. Return success

		return nil
	})
}
