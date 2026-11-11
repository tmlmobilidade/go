package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
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

[transfers.txt]: https://gtfs.org/documentation/schedule/reference/#transferstxt
*/
func MinTransferTimeField(ctx *contextTypes.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "transfers", []string{"min_transfer_time"}, func(row *contextTypes.ValidationContext) error {
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
