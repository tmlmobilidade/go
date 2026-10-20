package stop_times_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: start_pickup_drop_off_window
  - Presence: Conditionally Required
  - Type: Time

# Description

Time that on-demand service becomes available in a GeoJSON location, location group, or stop.

Conditionally Required:

  - Required if stop_times.location_group_id or stop_times.location_id is defined.
  - Required if end_pickup_drop_off_window is defined.
  - Forbidden if arrival_time or departure_time is defined.
  - Optional otherwise.

[stop_times.txt]: https://gtfs.org/schedule/reference/#stoptimetxt
*/
func StartPickupDropOffWindowValid(db *services.SQLiteContext, rules *types.StopTimesRules) error {
	//

	//
	// 1. Get the rule and create the validation context

	const ruleID = "stop_times_start_pickup_drop_off_window_valid"
	
	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("start_pickup_drop_off_window", "stop_times.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Rule(ruleID).Severity)
	}

	//
	// 3. Check if the rule should be ignored

	if ctx.ShouldIgnore() {
		return nil
	}

	//
	// 4. Read the window and related stop time values

	values, err := db.StopTimes.Fields("start_pickup_drop_off_window", "end_pickup_drop_off_window", "arrival_time", "departure_time", "location_group_id", "location_id")
	if err != nil {
		return err
	}
	value := values["start_pickup_drop_off_window"]

	//
	// 5. Windows are forbidden when arrival or departure time is defined

	if values["arrival_time"] != "" || values["departure_time"] != "" {
		if value != "" {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden_arrival_departure"))
		}
		return nil
	}

	//
	// 6. Check whether the field is forbidden by configuration

	if value != "" && ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return nil
	}

	//
	// 7. Require the window for locations or when the other window is defined

	required := values["location_group_id"] != "" || values["location_id"] != "" || values["end_pickup_drop_off_window"] != ""
	if value == "" {
		if required {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("required_location_group_id_start_pickup_dropoff"))
		}
		return nil
	}

	//
	// 8. Validate the time format

	if !lib.ValidateTime(value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 9. Return success

	return nil
}
