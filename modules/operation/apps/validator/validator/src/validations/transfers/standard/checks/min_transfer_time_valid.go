package transfers_standard

import (
	"main/lib"
	"main/services"
	"main/types"
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
func MinTransferTimeValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "transfers_min_transfer_time_non_negative_seconds"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("min_transfer_time", "transfers.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the min_transfer_time value

	value, err := db.Transfers.Field("min_transfer_time")
	if err != nil {
		return err
	}

	//
	// 4. Skip empty min_transfer_time values

	if value == "" {
		return nil
	}

	//
	// 5. Convert the min_transfer_time to an integer

	seconds, err := strconv.Atoi(value)

	//
	// 6. Check if the min_transfer_time is valid

	if err != nil || seconds < 0 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
	}

	//
	// 7. Return success

	return nil
}
