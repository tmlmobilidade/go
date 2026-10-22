package transfers_fields

import (
	"main/lib"
	"main/services"
	"main/types"
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
func MinTransferTimeField(db *services.SQLiteContext, rules *types.RuleContext) error {
	// 1. Create the validation context.
	const ruleID = "transfers_min_transfer_time_field"
	ctx := lib.NewValidationContext("min_transfer_time", "transfers.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	// 2. Read current SQLite values. Presence is independent of value validation.
	value, err := db.Transfers.Field("min_transfer_time")
	if err != nil {
		return err
	}
	if value != "" || ctx.ShouldIgnore() {
		return nil
	}
	ctx.AddMessageWithSeverity(ctx.GetSeverityMessage("required", "recommended", "informational"))

	return nil
}
