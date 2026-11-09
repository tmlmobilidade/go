package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	validators "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/validators"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
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
func StartPickupDropOffWindowValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "stop_times", []string{"start_pickup_drop_off_window", "arrival_time", "departure_time"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		//
		// 2. Read the window and related stop time values

		values, err := queries.Fields(rowCtx.Source, "start_pickup_drop_off_window", "arrival_time", "departure_time")
		if err != nil {
			return err
		}
		value := values["start_pickup_drop_off_window"]
		if value == "" {
			return nil
		}

		//
		// 3. Windows are forbidden when arrival or departure time is defined

		if values["arrival_time"] != "" || values["departure_time"] != "" {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "forbidden_arrival_departure"))
			return nil
		}

		//
		// 4. Validate the time format

		if !validators.ValidateTime(value) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 5. Return success

		return nil
	})
}
