package frequencies_standard

import (
	"main/lib"
	"main/services"
	"main/types"
	"strconv"
)

/*
# Attributes

  - File: frequencies.txt
  - Field: headway_secs
  - Presence: Required
  - Type: positive integer

# Description

Headway of service in seconds.

[frequencies.txt]: https://gtfs.org/schedule/reference/#frequenciestxt
*/
func HeadwaySecsValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	const ruleID = "frequencies_headway_secs_positive_and_aligns_trip"
	ctx := lib.NewValidationContext("headway_secs", "frequencies.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	value, err := db.Frequencies.Field("headway_secs")
	if err != nil {
		return err
	}
	if value == "" {
		return nil
	}
	parsed, err := strconv.Atoi(value)
	if err != nil || parsed <= 0 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
	}
	return nil
}
