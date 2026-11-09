package fields

import (
	"strconv"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [transfers.txt]
  - Field: to_stop_id
  - Presence: Conditionally Required
  - Type: Foreign ID referencing stops.stop_id

# Description

Identifies the destination stop or station for the connection. A station reference covers its child stops. Transfer
types 4 and 5 must reference a stop rather than a station.

Conditionally Required:
- Required if `transfer_type` is empty, `0`, `1`, `2`, or `3`.
- Optional if `transfer_type` is `4` or `5`.

[transfers.txt]: https://gtfs.org/documentation/schedule/reference/#transferstxt
*/
func TransfersToStopIdField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "transfers", []string{"to_stop_id", "transfer_type"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the to_stop_id value

		value, err := queries.Field(row.Source, "to_stop_id")
		if err != nil {
			return err
		}

		//
		// 3. Check if the to_stop_id validation should run

		if value != "" || context.ShouldIgnore(row) {
			return nil
		}

		//
		// 4. Get the transfer_type value

		kind, err := queries.Field(row.Source, "transfer_type")
		if err != nil {
			return err
		}

		//
		// 5. Convert the transfer_type to an integer

		transferType, err := strconv.Atoi(kind)

		//
		// 6. Check if the transfer type requires to_stop_id

		// Stop IDs are required only for types 1, 2 and 3.
		if err != nil || transferType < 1 || transferType > 3 {
			return nil
		}

		//
		// 7. Report the missing field with the configured severity

		context.AddMessage(row, context.GetSeverityMessage(row, "required", "recommended", "informational"))

		//
		// 8. Return success

		return nil
	})
}
