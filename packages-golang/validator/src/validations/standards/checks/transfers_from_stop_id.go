package standard

import (
	"strconv"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes
  - File: [transfers.txt]
  - Field: from_stop_id
  - Presence: Conditionally Required
  - Type: Foreign ID referencing stops.stop_id

# Description

Identifies a stop (location_type=0) or a station (location_type=1) where a connection between routes begins.
If this field refers to a station, the transfer rule applies to all its child stops. It must refer to a stop (location_type=0) if transfer_type is 4 or 5.

Conditionally Required:
- Required if transfer_type is 1, 2, or 3.
- Optional if transfer_type is 4 or 5.

[transfers.txt]: https://gtfs.org/schedule/reference/#transfertstxt
*/
func TransfersFromStopIdField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "transfers", []string{"from_stop_id", "transfer_type"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the from_stop_id value

		value, err := queries.Field(row.Source, "from_stop_id")
		if err != nil {
			return err
		}

		//
		// 3. Check if the from_stop_id validation should run

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
		// 6. Check if the transfer type requires from_stop_id

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
