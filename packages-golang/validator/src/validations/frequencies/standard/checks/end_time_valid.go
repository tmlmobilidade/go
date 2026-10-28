package frequencies_standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

/*
# Attributes

  - File: frequencies.txt
  - Field: end_time
  - Presence: Required
  - Type: Time

# Description

Time at which service changes to a different headway (or ceases) at the first stop in the trip.

[frequencies.txt]: https://gtfs.org/schedule/reference/#frequenciestxt
*/
func EndTimeValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "frequencies_end_time_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("end_time", "frequencies.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the end_time value

	value, err := db.Frequencies.Field("end_time")
	if err != nil {
		return err
	}

	//
	// 4. Skip empty end_time values

	if value == "" {
		return nil
	}

	//
	// 5. Check if the end_time is a valid time

	if !lib.ValidateTime(value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
	}

	//
	// 6. Return success

	return nil
}
