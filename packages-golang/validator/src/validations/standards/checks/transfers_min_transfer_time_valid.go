package standard

import (
	"strconv"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [transfers.txt]
  - Field: min_transfer_time
  - Presence: Conditionally Required
  - Type: Non-negative integer

# Description

Minimum number of seconds available for the transfer, including walking between locations and a margin for schedule
variation.

Conditionally Required:
- Required if `transfer_type` is `2`.
- Optional otherwise.

Validation: Checks that the populated value is an integer greater than or equal to zero. Empty values are skipped;
required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

[transfers.txt]: https://gtfs.org/documentation/schedule/reference/#transferstxt
*/
func MinTransferTimeValid(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "transfers", []string{"min_transfer_time"}, func(rowCtx *contextTypes.ValidationContext) error {
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
