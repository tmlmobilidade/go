package trips_custom

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes
  - File: [trips.txt]
  - Field: trip_id
  - Presence: Required (TML Rule)
  - Type: Foreign Key referencing trips.trip_id

# Description

Ensures the trip_id is less than or equal to 36 characters.

[trips.txt]: https://gtfs.org/schedule/reference/#trips
*/
func TripIdMaxLength(db *services.SQLiteContext, rules *types.RuleContext) error {
	const ruleID = "trip_id_limit_max_length"
	ctx := lib.NewValidationContext("trip_id_limit_characters", "trips.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	value, err := db.Trips.Field("trip_id")
	if err != nil {
		return err
	}
	if value == "" {
		return nil
	}
	if len(value) > 36 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("too_long"))
	}
	return nil
}
