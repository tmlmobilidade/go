package trips_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: trip_id
  - Presence: Required
  - Type: Unique ID

# Description

Identifies a trip.

[trips.txt]: https://gtfs.org/schedule/reference/#trips
*/
func TripIdUnique(db *services.SQLiteContext, rules *types.RuleContext) error {
	const ruleID = "trip_id_unique"
	ctx := lib.NewValidationContext("trip_id", "trips.txt", ruleID, db.Row, services.AppMessageService)
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
	_, count, err := db.Trips.FieldWithCount("trip_id")
	if err != nil {
		return err
	}
	if count > 1 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("duplicate", value))
	}
	return nil
}
