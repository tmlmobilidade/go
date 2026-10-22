package frequencies_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: frequencies.txt
  - Field: start_time
  - Presence: Required
  - Type: Time

# Description

Time at which the first vehicle departs from the first stop of the trip with the specified headway.

[frequencies.txt]: https://gtfs.org/schedule/reference/#frequenciestxt
*/
func StartTimeValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "frequency_start_time_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("start_time", "frequencies.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the start_time value

	value, err := db.Frequencies.Field("start_time")
	if err != nil {
		return err
	}

	//
	// 4. Skip empty start_time values

	if value == "" {
		return nil
	}

	//
	// 5. Check if the start_time is a valid time

	if !lib.ValidateTime(value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
	}

	//
	// 6. Return success

	return nil
}
