package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [transfers.txt]
  - Field: transfer_type
  - Presence: Required
  - Type: Enum

# Description

Connection policy: 0 or empty for a recommended transfer, 1 a timed transfer, 2 a transfer requiring
min_transfer_time, 3 no transfer, 4 an in-seat transfer or 5 an in-seat transfer that is not allowed.

[transfers.txt]: https://gtfs.org/documentation/schedule/reference/#transferstxt
*/
func TransferTypeField(ctx *contextTypes.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "transfers", []string{"transfer_type"}, func(row *contextTypes.ValidationContext) error {
		//
		// 2. Get the transfer_type value

		value, err := queries.Field(row.Source, "transfer_type")
		if err != nil {
			return err
		}

		//
		// 3. Check if the transfer_type validation should run

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
