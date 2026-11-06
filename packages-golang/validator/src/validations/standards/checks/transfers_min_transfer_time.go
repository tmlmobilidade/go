package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/queries"
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
func MinTransferTimeField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "transfers", []string{"min_transfer_time"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the min_transfer_time value

		value, err := queries.Field(row.Source, "min_transfer_time")
		if err != nil {
			return err
		}

		//
		// 3. Check if the min_transfer_time validation should run

		if value != "" || context.ShouldIgnore(row) {
			return nil
		}

		//
		// 4. Report the missing field with the configured severity

		context.AddMessage(row, context.GetSeverityMessage(row, "required", "recommended", "informational"))

		//
		// 5. Return success

		return nil
	})
}
