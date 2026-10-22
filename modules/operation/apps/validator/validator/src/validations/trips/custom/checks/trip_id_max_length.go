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
	//

	//
	// 1. Get the rule

	const ruleID = "trips_trip_id_max_length"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("trip_id_limit_characters", "trips.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the trip_id value

	value, err := db.Trips.Field("trip_id")
	if err != nil {
		return err
	}

	//
	// 4. Skip empty trip_id_limit_characters values

	if value == "" {
		return nil
	}

	//
	// 5. Check if the trip_id exceeds the maximum length

	if len(value) > 36 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("too_long"))
	}

	//
	// 6. Return success

	return nil
}
