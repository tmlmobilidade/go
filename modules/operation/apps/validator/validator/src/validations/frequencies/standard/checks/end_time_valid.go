package frequencies_standard

import (
	"main/lib"
	"main/services"
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
	const ruleID = "frequency_end_time_valid"
	ctx := lib.NewValidationContext("end_time", "frequencies.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	value, err := db.Frequencies.Field("end_time")
	if err != nil {
		return err
	}
	if value == "" {
		return nil
	}
	if !lib.ValidateTime(value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
	}
	return nil
}
