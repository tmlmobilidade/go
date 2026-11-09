package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	"strconv"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: continuous_pickup
  - Presence: Conditionally Forbidden
  - Type: Enum

# Description

Indicates that the rider can board the transit vehicle at any point along the vehicle's travel path as described by shapes.txt, from this stop_time to the next stop_time in the trip's stop_sequence.

Valid options are:

  - 0 - Continuous stopping pickup.
  - 1 or empty - No continuous stopping pickup.
  - 2 - Must phone agency to arrange continuous stopping pickup.
  - 3 - Must coordinate with driver to arrange continuous stopping pickup.

If this field is populated, it overrides any continuous pickup behavior defined in routes.txt. If this field is empty, the stop_time inherits any continuous pickup behavior defined in routes.txt.

Conditionally Forbidden:

  - Any value other than 1 or empty is Forbidden if start_pickup_drop_off_window or end_pickup_drop_off_window are defined.
  - Optional otherwise.

[stop_times.txt]: https://gtfs.org/schedule/reference/#stoptimetxt
*/
func StopTimesContinuousPickupValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "stop_times", []string{"continuous_pickup", "start_pickup_drop_off_window", "end_pickup_drop_off_window"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		//
		// 2. Read the value and pickup/drop-off windows

		values, err := queries.Fields(rowCtx.Source, "continuous_pickup", "start_pickup_drop_off_window", "end_pickup_drop_off_window")
		if err != nil {
			return err
		}
		value := values["continuous_pickup"]
		if value == "" {
			return nil
		}

		//
		// 3. Validate the GTFS enum

		continuous, err := strconv.Atoi(value)
		if err != nil || continuous < 0 || continuous > 3 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid"))
			return nil
		}

		//
		// 4. Only 1 or empty is allowed with pickup/drop-off windows

		if continuous != 1 && (values["start_pickup_drop_off_window"] != "" || values["end_pickup_drop_off_window"] != "") {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "forbidden_with_window"))
			return nil
		}

		//
		// 5. Return success

		return nil
	})
}
