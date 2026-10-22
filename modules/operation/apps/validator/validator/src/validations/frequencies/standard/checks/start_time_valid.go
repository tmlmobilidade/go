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
	const ruleID = "frequency_start_time_valid"
	ctx := lib.NewValidationContext("start_time", "frequencies.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	value, err := db.Frequencies.Field("start_time")
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
